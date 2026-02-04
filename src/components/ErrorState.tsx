import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

/**
 * Error state component displayed when data fetching fails
 */
export function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertTriangle
        className="h-16 w-16 text-destructive/70 mb-4"
        aria-hidden="true"
      />
      <h2 className="text-lg font-semibold mb-2">Wystąpił błąd</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {message ||
          "Nie udało się załadować listy gier. Sprawdź połączenie internetowe i spróbuj ponownie."}
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Spróbuj ponownie
      </Button>
    </div>
  );
}
