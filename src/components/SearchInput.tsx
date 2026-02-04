import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

/**
 * Search input with icon and clear button
 * Filters game list with debounce (handled by parent)
 */
export function SearchInput({
  value,
  onChange,
  onClear,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Szukaj gry..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
        aria-label="Szukaj gry po nazwie"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={onClear}
          aria-label="Wyczyść wyszukiwanie"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
