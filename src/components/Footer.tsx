interface FooterProps {
  lastUpdated?: string;
}

/**
 * Formats ISO date string to Polish locale
 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/**
 * Footer component with last update information
 */
export function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t bg-muted/50 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        {lastUpdated && (
          <p>Ostatnia aktualizacja danych: {formatDate(lastUpdated)}</p>
        )}
        <p className="mt-1">
          Katalog gier planszowych lokalu{" "}
          <a
            href="https://www.facebook.com/GrotaGdansk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Grota
          </a>
        </p>
      </div>
    </footer>
  );
}
