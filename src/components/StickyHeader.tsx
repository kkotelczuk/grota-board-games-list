import type { ViewMode, ThemeMode, FilterChip } from "../types";
import { SearchInput } from "./SearchInput";
import { ViewToggle } from "./ViewToggle";
import { ThemeToggle } from "./ThemeToggle";
import { FilterButton } from "./FilterButton";
import { FilterChips } from "./FilterChips";

interface StickyHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  activeFiltersCount: number;
  onOpenFilters: () => void;
  filterChips: FilterChip[];
  onFilterRemove: (filterKey: string) => void;
  totalGames: number;
}

/**
 * Sticky header with search, filters, and view controls
 */
export function StickyHeader({
  searchQuery,
  onSearchChange,
  onSearchClear,
  viewMode,
  onViewModeChange,
  theme,
  onThemeChange,
  activeFiltersCount,
  onOpenFilters,
  filterChips,
  onFilterRemove,
  totalGames,
}: StickyHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3">
        {/* Main header row */}
        <div className="flex items-center gap-3">
          {/* Logo (light + dark variant) */}
          <h1 className="shrink-0">
            <img
              src="/images/logos/bgp_grota.png"
              alt="Białostocka GROTA Grupa Planszówkowa"
              className="h-8 w-auto sm:h-10 md:h-12 dark:hidden"
            />
            <img
              src="/images/logos/bgp_grota_white.png"
              alt="Białostocka GROTA Grupa Planszówkowa"
              className="h-8 w-auto sm:h-10 md:h-12 hidden dark:block"
            />
          </h1>

          {/* Search input */}
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
            className="flex-1 max-w-md"
          />

          {/* Controls */}
          <div className="flex items-center gap-1">
            <FilterButton
              activeFiltersCount={activeFiltersCount}
              onClick={onOpenFilters}
            />
            <ViewToggle value={viewMode} onChange={onViewModeChange} />
            <ThemeToggle value={theme} onChange={onThemeChange} />
          </div>
        </div>

        {/* Filter chips row */}
        {filterChips.length > 0 && (
          <div className="mt-2">
            <FilterChips filters={filterChips} onRemove={onFilterRemove} />
          </div>
        )}

        {/* Results count */}
        <div className="mt-2 text-xs text-muted-foreground">
          {totalGames > 0 ? (
            <span>Znaleziono {totalGames} gier</span>
          ) : (
            <span>Ładowanie...</span>
          )}
        </div>
      </div>
    </header>
  );
}
