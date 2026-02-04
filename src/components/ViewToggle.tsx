import type { ViewMode } from "../types";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

/**
 * Toggle between grid and list view modes
 */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onChange(val as ViewMode)}
      aria-label="Tryb widoku"
    >
      <ToggleGroupItem value="grid" aria-label="Widok kafelkowy">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Widok listy">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
