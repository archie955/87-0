import type { Player } from "@/types/playerTypes";

const ROLE_COLOR: Record<string, string> = {
  Opener: "var(--chart-1)",
  Closer: "var(--chart-2)",
  AWPer: "var(--chart-3)",
  Support: "var(--chart-4)",
};

const PlayerCard = ({
  player,
  selected,
  onSelect,
}: {
  player: Player;
  selected: boolean;
  onSelect: () => void;
}) => {
  const roleColor = ROLE_COLOR[player.role];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={selected}
      className="flex flex-col items-center gap-2 rounded-lg border-2 bg-card p-4 text-left transition-colors hover:bg-accent"
      style={{ borderColor: selected ? roleColor : "var(--border)" }}
    >
      <span className="font-medium text-card-foreground">{player.name}</span>
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium text-background"
        style={{ backgroundColor: roleColor }}
      >
        {player.role}
      </span>
      <span className="text-xs text-muted-foreground">
        HLTV {player.hltv.toFixed(2)}
      </span>
    </button>
  );
};

export default PlayerCard;
