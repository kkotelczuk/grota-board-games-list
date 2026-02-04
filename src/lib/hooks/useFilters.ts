import { useState, useCallback, useMemo } from "react";
import type {
  ActiveFilters,
  FilterChip,
  DifficultyLevelKeyDto,
} from "../../types";
import { DEFAULT_FILTERS, DIFFICULTY_LABELS, SORT_OPTIONS } from "../../types";

interface UseFiltersReturn {
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Current active filters */
  filters: ActiveFilters;
  /** Set all filters at once */
  setFilters: (filters: ActiveFilters) => void;
  /** Update a single filter */
  updateFilter: <K extends keyof ActiveFilters>(
    key: K,
    value: ActiveFilters[K],
  ) => void;
  /** Remove a filter (reset to undefined or default) */
  removeFilter: (key: keyof ActiveFilters) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** Reset search query */
  resetSearch: () => void;
  /** Reset everything (filters + search) */
  resetAll: () => void;
  /** Active filter chips for display */
  activeFilterChips: FilterChip[];
  /** Count of active filters (excluding sort) */
  activeFiltersCount: number;
}

/**
 * Hook for managing filters and search state
 * @param initialFilters - Optional initial filter values
 */
export function useFilters(
  initialFilters?: Partial<ActiveFilters>,
): UseFiltersReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFiltersState] = useState<ActiveFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const setFilters = useCallback((newFilters: ActiveFilters) => {
    setFiltersState(newFilters);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => {
      setFiltersState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const removeFilter = useCallback((key: keyof ActiveFilters) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev };

      if (key === "sort") {
        // Sort always has a value, reset to default
        newFilters.sort = DEFAULT_FILTERS.sort;
      } else {
        // Other filters can be undefined
        delete newFilters[key];
      }

      return newFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...DEFAULT_FILTERS });
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const resetAll = useCallback(() => {
    setSearchQuery("");
    setFiltersState({ ...DEFAULT_FILTERS });
  }, []);

  // Generate filter chips for UI display
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (filters.players !== undefined) {
      chips.push({
        key: "players",
        label: "Gracze",
        value: `${filters.players}`,
      });
    }

    if (filters.difficulty) {
      chips.push({
        key: "difficulty",
        label: "Trudność",
        value: DIFFICULTY_LABELS[filters.difficulty as DifficultyLevelKeyDto],
      });
    }

    // Only show sort chip if not default
    if (filters.sort !== DEFAULT_FILTERS.sort) {
      const sortOption = SORT_OPTIONS.find((opt) => opt.key === filters.sort);
      if (sortOption) {
        chips.push({
          key: "sort",
          label: "Sortowanie",
          value: sortOption.label,
        });
      }
    }

    return chips;
  }, [filters]);

  // Count active filters (excluding default sort)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.players !== undefined) count++;
    if (filters.difficulty) count++;
    if (filters.sort !== DEFAULT_FILTERS.sort) count++;
    return count;
  }, [filters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    resetFilters,
    resetSearch,
    resetAll,
    activeFilterChips,
    activeFiltersCount,
  };
}
