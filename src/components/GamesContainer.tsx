import { useState, useCallback } from "react";
import type { ActiveFilters } from "../types";
import {
  useGamesQuery,
  useFilters,
  useViewPreferences,
  useInfiniteScroll,
} from "../lib/hooks";
import { StickyHeader } from "./StickyHeader";
import { GameList } from "./GameList";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { FilterPanel } from "./FilterPanel";

/**
 * Main container component that orchestrates the games list view
 * Manages all state through custom hooks and renders appropriate components
 */
export function GamesContainer() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // View preferences (persisted in localStorage)
  const { viewMode, setViewMode, theme, setTheme } = useViewPreferences();

  // Filters and search state
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    removeFilter,
    resetFilters,
    resetAll,
    activeFilterChips,
    activeFiltersCount,
  } = useFilters();

  // Games data fetching
  const { data, fetchNextPage, refetch } = useGamesQuery({
    q: searchQuery || undefined,
    players: filters.players,
    difficulty: filters.difficulty,
    sort: filters.sort,
  });

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll(fetchNextPage, {
    enabled: data.hasMore && !data.isLoading && !data.isLoadingMore,
  });

  // Handlers
  const handleOpenFilters = useCallback(() => {
    setIsFilterPanelOpen(true);
  }, []);

  const handleCloseFilters = useCallback(() => {
    setIsFilterPanelOpen(false);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const handleFilterRemove = useCallback(
    (filterKey: string) => {
      removeFilter(filterKey as keyof ActiveFilters);
    },
    [removeFilter],
  );

  const handleResetAll = useCallback(() => {
    resetAll();
    setIsFilterPanelOpen(false);
  }, [resetAll]);

  // Render error state
  if (data.error && data.games.length === 0) {
    return (
      <>
        <StickyHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={handleSearchClear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          theme={theme}
          onThemeChange={setTheme}
          activeFiltersCount={activeFiltersCount}
          onOpenFilters={handleOpenFilters}
          filterChips={activeFilterChips}
          onFilterRemove={handleFilterRemove}
          totalGames={0}
        />
        <main className="container mx-auto px-4 py-6">
          <ErrorState onRetry={refetch} message={data.error} />
        </main>
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={handleCloseFilters}
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />
      </>
    );
  }

  // Render empty state
  if (!data.isLoading && data.games.length === 0) {
    return (
      <>
        <StickyHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={handleSearchClear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          theme={theme}
          onThemeChange={setTheme}
          activeFiltersCount={activeFiltersCount}
          onOpenFilters={handleOpenFilters}
          filterChips={activeFilterChips}
          onFilterRemove={handleFilterRemove}
          totalGames={0}
        />
        <main className="container mx-auto px-4 py-6">
          <EmptyState onReset={handleResetAll} />
        </main>
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={handleCloseFilters}
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />
      </>
    );
  }

  // Render games list
  return (
    <>
      <StickyHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={handleSearchClear}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeChange={setTheme}
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={handleOpenFilters}
        filterChips={activeFilterChips}
        onFilterRemove={handleFilterRemove}
        totalGames={data.total}
      />
      <main className="container mx-auto px-4 py-6">
        <GameList
          games={data.games}
          viewMode={viewMode}
          isLoading={data.isLoading}
          isLoadingMore={data.isLoadingMore}
          hasMore={data.hasMore}
          sentinelRef={sentinelRef}
        />
      </main>
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />
    </>
  );
}
