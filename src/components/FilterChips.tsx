import type { FilterChip } from "../types";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (filterKey: string) => void;
}

/**
 * Horizontal list of active filter chips
 * Each chip can be removed by clicking the X button
 */
export function FilterChips({ filters, onRemove }: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
      role="list"
      aria-label="Aktywne filtry"
    >
      {filters.map((filter) => (
        <div
          key={filter.key}
          role="listitem"
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shrink-0"
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemove(filter.key)}
            aria-label={`Usuń filtr ${filter.label}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
