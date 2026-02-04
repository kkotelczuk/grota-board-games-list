import type { DifficultyLevelEntity } from "../types";
import { Badge } from "./ui/badge";
import { Shield, Swords, Axe, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface DifficultyBadgeProps {
  difficulty: DifficultyLevelEntity;
  size?: "sm" | "md";
  className?: string;
}

const difficultyConfig = {
  easy: {
    icon: Shield,
    variant: "easy" as const,
  },
  medium: {
    icon: Swords,
    variant: "medium" as const,
  },
  hard: {
    icon: Axe,
    variant: "hard" as const,
  },
  unknown: {
    icon: HelpCircle,
    variant: "secondary" as const,
  },
};

export function DifficultyBadge({
  difficulty,
  size = "md",
  className,
}: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty.key];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1",
        size === "sm" && "text-[10px] px-1.5 py-0",
        className,
      )}
    >
      <Icon
        className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
      />
      <span>{difficulty.label}</span>
    </Badge>
  );
}
