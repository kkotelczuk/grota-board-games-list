import { useEffect, useCallback } from "react";
import type {
  ActiveFilters,
  GameSortKey,
  DifficultyLevelKeyDto,
} from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { PlayerCountFilter } from "./PlayerCountFilter";
import { DifficultyFilter } from "./DifficultyFilter";
import { SortOptions } from "./SortOptions";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  onReset: () => void;
}

/**
 * Filter panel dialog with all filtering and sorting options
 */
export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onReset,
}: FilterPanelProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handlePlayersChange = (value: number | undefined) => {
    onFiltersChange({ ...filters, players: value });
  };

  const handleDifficultyChange = (value: DifficultyLevelKeyDto | undefined) => {
    onFiltersChange({ ...filters, difficulty: value });
  };

  const handleSortChange = (value: GameSortKey) => {
    onFiltersChange({ ...filters, sort: value });
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtry i sortowanie</DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>
              Wybierz opcje filtrowania i sortowania listy gier
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Player count filter */}
          <PlayerCountFilter
            value={filters.players}
            onChange={handlePlayersChange}
          />

          {/* Difficulty filter */}
          <DifficultyFilter
            value={filters.difficulty}
            onChange={handleDifficultyChange}
          />

          {/* Sort options */}
          <SortOptions value={filters.sort} onChange={handleSortChange} />
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={handleReset}>
            Wyczyść wszystko
          </Button>
          <Button onClick={onClose}>Gotowe</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
