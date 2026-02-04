import { PackageOpen } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  onReset: () => void;
}

/**
 * Empty state component displayed when no games match the filters
 */
export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <PackageOpen
        className="h-16 w-16 text-muted-foreground/50 mb-4"
        aria-hidden="true"
      />
      <h2 className="text-lg font-semibold mb-2">Nie znaleziono gier</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Brak gier spełniających podane kryteria wyszukiwania. Spróbuj zmienić
        filtry lub wyczyść je, aby zobaczyć wszystkie gry.
      </p>
      <Button onClick={onReset} variant="outline">
        Wyczyść filtry
      </Button>
    </div>
  );
}
