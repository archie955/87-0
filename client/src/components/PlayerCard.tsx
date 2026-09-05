import { motion } from "motion/react";
import { Check, User } from "lucide-react";
import type { Player } from "@/types/playerTypes";
import { cn } from "@/lib/utils";

const ROLE_COLOR: Record<string, string> = {
  Opener: "oklch(0.72 0.18 145)", // green
  Closer: "oklch(0.65 0.22 25)", // red
  AWPer: "oklch(0.7 0.18 285)", // purple
  Support: "oklch(0.78 0.16 65)", // amber
};

type PlayerPickCardProps = {
  player: Player;
  selectable: boolean;
  onSelect: () => void;
};

const PlayerCard = ({ player, selectable, onSelect }: PlayerPickCardProps) => {
  const colour = ROLE_COLOR[player.role] ?? "var(--primary)";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={!selectable}
      whileHover={selectable ? { y: -4 } : undefined}
      whileTap={selectable ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex w-44 flex-col items-center gap-3 rounded-xl border-2 bg-card p-5 text-left",
        selectable && "cursor-pointer hover:shadow-lg",
        !selectable && "cursor-not-allowed opacity-40 grayscale",
      )}
      style={{ borderColor: selectable ? colour : "var(--border)" }}
    >
      <span
        className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: colour }}
      >
        {player.role}
      </span>

      <div
        className="flex size-14 items-center justify-center rounded-full border-2"
        style={{ borderColor: colour }}
      >
        <User className="size-7" style={{ color: colour }} />
      </div>

      <div className="text-center">
        <p className="font-semibold text-card-foreground">{player.name}</p>
      </div>

      <div className="flex items-baseline gap-1 rounded-md bg-muted px-2.5 py-1">
        <span className="text-xs text-muted-foreground">HLTV</span>
        <span className="text-sm font-bold tabular-nums">
          {player.hltv.toFixed(2)}
        </span>
      </div>

      {selectable && (
        <div
          className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor: colour }}
        >
          <Check className="size-4" />
        </div>
      )}
    </motion.button>
  );
};

export default PlayerCard;
