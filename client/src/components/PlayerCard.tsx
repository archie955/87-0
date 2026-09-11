import { motion } from "motion/react";
import {
  Check,
  Crosshair,
  HatGlasses,
  Shield,
  Sparkles,
  Wrench,
} from "lucide-react";

import type { Player } from "@/types/playerTypes";
import { cn } from "@/lib/utils";
import { useRules } from "@/stores/ruleStore";

const ROLE_META: Record<
  string,
  {
    icon: typeof Crosshair;
    accent: string;
    label: string;
  }
> = {
  Opener: {
    icon: Sparkles,
    accent: "oklch(0.72 0.18 145)",
    label: "OPENER",
  },
  Closer: {
    icon: HatGlasses,
    accent: "oklch(0.68 0.20 25)",
    label: "CLOSER",
  },
  AWPer: {
    icon: Crosshair,
    accent: "oklch(0.72 0.16 285)",
    label: "AWPER",
  },
  Support: {
    icon: Wrench,
    accent: "oklch(0.78 0.16 80)",
    label: "SUPPORT",
  },
  Flex: {
    icon: Shield,
    accent: "oklch(0.70 0.15 190)",
    label: "FLEX",
  },
};

type PlayerPickCardProps = {
  player: Player;
  selectable: boolean;
  onSelect: () => void;
};

const PlayerCard = ({ player, selectable, onSelect }: PlayerPickCardProps) => {
  const rules = useRules();
  const meta = ROLE_META[player.role] ?? ROLE_META.Flex;
  const RoleIcon = meta.icon;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={!selectable}
      whileHover={
        selectable
          ? {
              y: -5,
              transition: { duration: 0.16 },
            }
          : undefined
      }
      whileTap={selectable ? { scale: 0.985 } : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border text-left transition-all",
        selectable
          ? "cursor-pointer border-border/80 bg-card hover:border-primary/30 hover:shadow-[0_14px_40px_oklch(0_0_0_/_25%)]"
          : "cursor-not-allowed border-border/60 bg-card/60 opacity-35 grayscale",
      )}
      style={
        selectable
          ? {
              boxShadow: `inset 0 1px 0 oklch(1 0 0 / 4%), 0 0 0 1px color-mix(in oklch, ${meta.accent} 12%, transparent)`,
            }
          : undefined
      }
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-80"
        style={{ backgroundColor: meta.accent }}
      />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black tracking-[0.16em]"
            style={{
              borderColor: `color-mix(in oklch, ${meta.accent} 34%, transparent)`,
              color: meta.accent,
              backgroundColor: `color-mix(in oklch, ${meta.accent} 7%, transparent)`,
            }}
          >
            <RoleIcon className="size-3" />
            {meta.label}
          </span>

          {selectable && (
            <span className="flex size-7 items-center justify-center rounded-full border border-border/70 bg-background/40 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <Check className="size-3.5" />
            </span>
          )}
        </div>

        <div className="mt-5">
          <p className="min-h-12 text-lg font-extrabold leading-tight tracking-tight">
            {player.name}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
            {rules === "easy" ? (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  HLTV
                </p>
                <p className="mt-0.5 font-mono text-xl font-bold tabular-nums">
                  {player.hltv.toFixed(2)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Role
                </p>
                <p className="mt-0.5 text-sm font-semibold">{player.role}</p>
              </div>
            )}

            <div
              className="flex size-10 items-center justify-center rounded-xl border"
              style={{
                borderColor: `color-mix(in oklch, ${meta.accent} 24%, transparent)`,
                color: meta.accent,
                backgroundColor: `color-mix(in oklch, ${meta.accent} 6%, transparent)`,
              }}
            >
              <RoleIcon className="size-4" />
            </div>
          </div>
        </div>
      </div>

      {selectable && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
          <div
            className="absolute inset-x-8 bottom-0 h-14 blur-2xl"
            style={{
              backgroundColor: `color-mix(in oklch, ${meta.accent} 15%, transparent)`,
            }}
          />
        </div>
      )}
    </motion.button>
  );
};

export default PlayerCard;
