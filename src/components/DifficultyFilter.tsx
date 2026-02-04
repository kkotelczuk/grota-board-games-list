import type { DifficultyLevelKeyDto } from "../types";
import { DIFFICULTY_LABELS } from "../types";
import { Button } from "./ui/button";
import { Shield, Swords, Axe } from "lucide-react";
import { cn } from "../lib/utils";

interface DifficultyFilterProps {
  value: DifficultyLevelKeyDto | undefined;
  onChange: (value: DifficultyLevelKeyDto | undefined) => void;
}

const DIFFICULTY_OPTIONS: {
  key: DifficultyLevelKeyDto;
  icon: typeof Shield;
  colorClass: string;
}[] = [
  {
    key: "easy",
    icon: Shield,
    colorClass:
      "data-[active=true]:bg-green-100 data-[active=true]:text-green-800 dark:data-[active=true]:bg-green-900/30 dark:data-[active=true]:text-green-400",
  },
  {
    key: "medium",
    icon: Swords,
    colorClass:
      "data-[active=true]:bg-yellow-100 data-[active=true]:text-yellow-800 dark:data-[active=true]:bg-yellow-900/30 dark:data-[active=true]:text-yellow-400",
  },
  {
    key: "hard",
    icon: Axe,
    colorClass:
      "data-[active=true]:bg-red-100 data-[active=true]:text-red-800 dark:data-[active=true]:bg-red-900/30 dark:data-[active=true]:text-red-400",
  },
];

/**
 * Difficulty filter with three options
 * Clicking the same option again clears the filter
 */
export function DifficultyFilter({ value, onChange }: DifficultyFilterProps) {
  const handleClick = (difficulty: DifficultyLevelKeyDto) => {
    if (value === difficulty) {
      onChange(undefined);
    } else {
      onChange(difficulty);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Poziom trudności</label>
      <div className="flex flex-wrap gap-2">
        {DIFFICULTY_OPTIONS.map(({ key, icon: Icon, colorClass }) => (
          <Button
            key={key}
            variant={value === key ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1.5",
              value === key && "ring-2 ring-ring ring-offset-2",
              colorClass,
            )}
            onClick={() => handleClick(key)}
            aria-pressed={value === key}
            data-active={value === key}
          >
            <Icon className="h-4 w-4" />
            {DIFFICULTY_LABELS[key]}
          </Button>
        ))}
      </div>
    </div>
  );
}
