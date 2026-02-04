import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface PlayerCountFilterProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Player count filter with predefined options
 * Clicking the same option again clears the filter
 */
export function PlayerCountFilter({ value, onChange }: PlayerCountFilterProps) {
  const handleClick = (players: number) => {
    if (value === players) {
      onChange(undefined);
    } else {
      onChange(players);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Liczba graczy</label>
      <div className="flex flex-wrap gap-2">
        {PLAYER_OPTIONS.map((players) => (
          <Button
            key={players}
            variant={value === players ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-9 w-9 p-0",
              value === players && "ring-2 ring-ring ring-offset-2",
            )}
            onClick={() => handleClick(players)}
            aria-pressed={value === players}
          >
            {players === 8 ? "8+" : players}
          </Button>
        ))}
      </div>
    </div>
  );
}
