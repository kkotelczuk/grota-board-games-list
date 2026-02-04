import type { GameDto } from "../types";
import { DifficultyBadge } from "./DifficultyBadge";
import { Users, Clock } from "lucide-react";

interface GameRowProps {
  game: GameDto;
}

/**
 * Formats player count range
 */
function formatPlayerRange(
  minPlayers: number | null,
  maxPlayers: number | null,
): string {
  if (minPlayers === null && maxPlayers === null) return "?";
  if (minPlayers === maxPlayers) return `${minPlayers}`;
  if (minPlayers === null) return `1-${maxPlayers}`;
  if (maxPlayers === null) return `${minPlayers}+`;
  return `${minPlayers}-${maxPlayers}`;
}

/**
 * Game row component for list view
 * Compact presentation without cover image
 */
export function GameRow({ game }: GameRowProps) {
  return (
    <article className="flex items-center gap-4 rounded-lg border bg-card p-3 text-card-foreground transition-colors hover:bg-accent/50">
      {/* Game name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium leading-tight truncate">{game.name}</h3>
      </div>

      {/* Parameters */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
        {/* Player count */}
        <div
          className="flex items-center gap-1"
          title="Liczba graczy"
          aria-label={`Liczba graczy: ${formatPlayerRange(game.minPlayers, game.maxPlayers)}`}
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          <span className="tabular-nums">
            {formatPlayerRange(game.minPlayers, game.maxPlayers)}
          </span>
        </div>

        {/* Play time */}
        {game.playTime && (
          <div
            className="flex items-center gap-1"
            title="Czas gry"
            aria-label={`Czas gry: ${game.playTime} minut`}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">{game.playTime}</span>
          </div>
        )}

        {/* Difficulty badge */}
        <DifficultyBadge difficulty={game.difficulty} size="sm" />
      </div>
    </article>
  );
}
