import { Crown } from "lucide-react";
import type { LineupRole } from "@/services/enum";
import type { Player } from "@/types/playerTypes";
import { cn } from "@/lib/utils";

type IglSelectorProps = {
  candidates: { role: LineupRole; player: Player }[];
  selected: LineupRole | null;
  onSelect: (role: LineupRole) => void;
};

const IglSelector = ({ candidates, selected, onSelect }: IglSelectorProps) => {
  if (candidates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {candidates.map(({ role, player }) => {
        const isSelected = selected === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onSelect(role)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all",
              isSelected
                ? "border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-300"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            {isSelected && <Crown className="size-3.5" />}
            <span className="font-medium">{player.name}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              +{player.igl_bonus.toFixed(2)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default IglSelector;
