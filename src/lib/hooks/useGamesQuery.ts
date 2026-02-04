import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type {
  GamesListViewModel,
  GameDto,
  GameEntity,
  GameSortKey,
  DifficultyKey,
  DifficultyLevelKeyDto,
} from "../../types";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../../types";
import { useDebounce } from "./useDebounce";

// Import games data directly for client-side filtering (static site)
import gamesData from "../../data/games.json";

interface UseGamesQueryParams {
  q?: string;
  players?: number;
  difficulty?: DifficultyLevelKeyDto;
  sort?: GameSortKey;
}

interface UseGamesQueryReturn {
  data: GamesListViewModel;
  fetchNextPage: () => void;
  refetch: () => void;
  resetAndRefetch: () => void;
}

// Difficulty order for sorting
const DIFFICULTY_ORDER: Record<DifficultyKey, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  unknown: 4,
};

/**
 * Maps GameEntity to GameDto (removes raw field)
 */
function toGameDto(entity: GameEntity): GameDto {
  const { raw: _raw, ...dto } = entity;
  return dto;
}

/**
 * Client-side filtering, sorting of games
 */
function filterAndSortGames(
  games: GameEntity[],
  params: UseGamesQueryParams,
): GameDto[] {
  let result = [...games];

  // Filter by search query
  if (params.q) {
    const lowerQuery = params.q.toLowerCase();
    result = result.filter((game) =>
      game.name.toLowerCase().includes(lowerQuery),
    );
  }

  // Filter by player count
  if (params.players !== undefined) {
    result = result.filter((game) => {
      if (game.minPlayers === null || game.maxPlayers === null) {
        return false;
      }
      return (
        game.minPlayers <= params.players! && params.players! <= game.maxPlayers
      );
    });
  }

  // Filter by difficulty
  if (params.difficulty) {
    result = result.filter((game) => game.difficulty.key === params.difficulty);
  }

  // Sort
  const sortKey = params.sort || "name_asc";
  switch (sortKey) {
    case "name_asc":
      result.sort((a, b) => a.name.localeCompare(b.name, "pl"));
      break;
    case "name_desc":
      result.sort((a, b) => b.name.localeCompare(a.name, "pl"));
      break;
    case "difficulty_asc":
      result.sort(
        (a, b) =>
          DIFFICULTY_ORDER[a.difficulty.key] -
          DIFFICULTY_ORDER[b.difficulty.key],
      );
      break;
    case "difficulty_desc":
      result.sort(
        (a, b) =>
          DIFFICULTY_ORDER[b.difficulty.key] -
          DIFFICULTY_ORDER[a.difficulty.key],
      );
      break;
    case "minPlayers_asc":
      result.sort((a, b) => {
        const aVal = a.minPlayers ?? Number.MAX_SAFE_INTEGER;
        const bVal = b.minPlayers ?? Number.MAX_SAFE_INTEGER;
        return aVal - bVal;
      });
      break;
    case "minPlayers_desc":
      result.sort((a, b) => {
        const aVal = a.minPlayers ?? Number.MIN_SAFE_INTEGER;
        const bVal = b.minPlayers ?? Number.MIN_SAFE_INTEGER;
        return bVal - aVal;
      });
      break;
  }

  return result.map(toGameDto);
}

/**
 * Hook for managing games data with client-side filtering, sorting, and pagination
 * Data is loaded from static JSON import (no API calls)
 * @param params - Query parameters for filtering/sorting
 */
export function useGamesQuery(
  params: UseGamesQueryParams,
): UseGamesQueryReturn {
  // Debounce search query
  const debouncedQuery = useDebounce(params.q || "", SEARCH_DEBOUNCE_MS);

  // All games from static JSON
  const allGames = useMemo(
    () => (gamesData as { games: GameEntity[] }).games,
    [],
  );

  // Filtered and sorted games (client-side)
  const filteredGames = useMemo(
    () =>
      filterAndSortGames(allGames, {
        ...params,
        q: debouncedQuery || undefined,
      }),
    [allGames, debouncedQuery, params.players, params.difficulty, params.sort],
  );

  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(DEFAULT_PAGE_SIZE);
  const prevParamsRef = useRef<string>("");

  // Serialize params for comparison
  const paramsKey = JSON.stringify({
    q: debouncedQuery,
    players: params.players,
    difficulty: params.difficulty,
    sort: params.sort,
  });

  // Reset displayed count when filters change
  useEffect(() => {
    if (prevParamsRef.current !== paramsKey) {
      setDisplayedCount(DEFAULT_PAGE_SIZE);
      prevParamsRef.current = paramsKey;
    }
  }, [paramsKey]);

  // Current page of games
  const displayedGames = useMemo(
    () => filteredGames.slice(0, displayedCount),
    [filteredGames, displayedCount],
  );

  // Calculate state
  const total = filteredGames.length;
  const hasMore = displayedCount < total;
  const currentPage = Math.ceil(displayedCount / DEFAULT_PAGE_SIZE);
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  // Load more games (for infinite scroll)
  const fetchNextPage = useCallback(() => {
    setDisplayedCount((prev) => Math.min(prev + DEFAULT_PAGE_SIZE, total));
  }, [total]);

  // Refetch (reset pagination)
  const refetch = useCallback(() => {
    setDisplayedCount(DEFAULT_PAGE_SIZE);
  }, []);

  // Reset and refetch
  const resetAndRefetch = useCallback(() => {
    setDisplayedCount(DEFAULT_PAGE_SIZE);
  }, []);

  const data: GamesListViewModel = {
    games: displayedGames,
    isLoading: false, // No loading state for client-side filtering
    isLoadingMore: false,
    error: null,
    hasMore,
    currentPage,
    totalPages,
    total,
  };

  return {
    data,
    fetchNextPage,
    refetch,
    resetAndRefetch,
  };
}
