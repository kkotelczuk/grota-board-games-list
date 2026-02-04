import type { GameDto, ViewMode } from "../types";
import { GameCard } from "./GameCard";
import { GameRow } from "./GameRow";
import { Loader2 } from "lucide-react";

interface GameListProps {
  games: GameDto[];
  viewMode: ViewMode;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Game list container with support for grid and list view modes
 * Includes sentinel element for infinite scroll
 */
export function GameList({
  games,
  viewMode,
  isLoading,
  isLoadingMore,
  hasMore,
  sentinelRef,
}: GameListProps) {
  // Initial loading state
  if (isLoading && games.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {games.map((game, index) => (
            <GameCard key={`${game.id ?? game.name}-${index}`} game={game} />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-2">
          {games.map((game, index) => (
            <GameRow key={`${game.id ?? game.name}-${index}`} game={game} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex justify-center py-4"
          aria-hidden="true"
        >
          {isLoadingMore && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && games.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Wyświetlono wszystkie gry ({games.length})
        </p>
      )}
    </div>
  );
}
