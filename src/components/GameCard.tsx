import { useState } from "react";
import type { GameDto } from "../types";
import { assetUrl } from "../lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";
import { ImageFallback } from "./ImageFallback";
import { Users, Clock } from "lucide-react";

interface GameCardProps {
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
 * Game card component for grid view
 * Displays game cover, name, and key parameters
 */
export function GameCard({ game }: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  const showFallback = !game.imageUrl || imageError;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Cover image */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {showFallback ? (
          <ImageFallback gameName={game.name} className="rounded-t-lg" />
        ) : (
          <img
            src={assetUrl(game.imageUrl!)}
            alt={`Okładka gry ${game.name}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
          {game.bggUrl ? (
            <a
              href={game.bggUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
            >
              {game.name}
            </a>
          ) : (
            game.name
          )}
        </h3>

        {/* Parameters */}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {/* Player count */}
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{formatPlayerRange(game.minPlayers, game.maxPlayers)}</span>
          </div>

          {/* Play time */}
          {game.playTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{game.playTime} min</span>
            </div>
          )}
        </div>

        {/* Difficulty badge */}
        <div className="mt-1">
          <DifficultyBadge difficulty={game.difficulty} size="sm" />
        </div>
      </div>
    </article>
  );
}
