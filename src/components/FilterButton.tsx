import { Button } from "./ui/button";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "../lib/utils";

interface FilterButtonProps {
  activeFiltersCount: number;
  onClick: () => void;
}

/**
 * Button to open the filter panel
 * Shows badge with active filters count
 */
export function FilterButton({
  activeFiltersCount,
  onClick,
}: FilterButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="relative"
      aria-label={`Otwórz filtry${activeFiltersCount > 0 ? ` (${activeFiltersCount} aktywnych)` : ""}`}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {activeFiltersCount > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center",
            "rounded-full bg-primary text-[10px] font-medium text-primary-foreground",
          )}
        >
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );
}
