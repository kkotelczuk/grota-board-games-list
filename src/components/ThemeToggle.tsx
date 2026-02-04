import type { ThemeMode } from "../types";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

/**
 * Toggle between light and dark theme
 */
export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const toggleTheme = () => {
    onChange(value === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={value === "light" ? "Włącz tryb ciemny" : "Włącz tryb jasny"}
    >
      {value === "light" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
