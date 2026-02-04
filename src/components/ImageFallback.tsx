import { Dices } from "lucide-react";
import { cn } from "../lib/utils";

interface ImageFallbackProps {
  gameName: string;
  className?: string;
}

/**
 * Generates a deterministic color based on game name
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color with fixed saturation and lightness for consistency
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 40%, 45%)`;
}

/**
 * Fallback component displayed when game image is unavailable
 * Generates a deterministic background color based on game name
 */
export function ImageFallback({ gameName, className }: ImageFallbackProps) {
  const backgroundColor = stringToColor(gameName);

  return (
    <div
      className={cn(
        "flex items-center justify-center aspect-[3/4] w-full rounded-t-lg",
        className,
      )}
      style={{ backgroundColor }}
      aria-label={`Brak okładki dla gry ${gameName}`}
    >
      <Dices className="h-12 w-12 text-white/70" />
    </div>
  );
}
