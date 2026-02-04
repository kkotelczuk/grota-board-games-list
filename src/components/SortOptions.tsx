import type { GameSortKey } from "../types";
import { SORT_OPTIONS } from "../types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface SortOptionsProps {
  value: GameSortKey;
  onChange: (value: GameSortKey) => void;
}

/**
 * Sort options as radio group
 */
export function SortOptions({ value, onChange }: SortOptionsProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Sortuj według</label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as GameSortKey)}
        className="gap-2"
      >
        {SORT_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-2">
            <RadioGroupItem value={option.key} id={`sort-${option.key}`} />
            <label
              htmlFor={`sort-${option.key}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
