import { motion } from "motion/react";
import {
  Book,
  Crosshair,
  Crown,
  HatGlasses,
  SportShoe,
  Wrench,
} from "lucide-react";

import type { LineupRole } from "@/services/enum";
import { lineupRoles } from "@/services/enum";
import type { Player } from "@/types/playerTypes";
import { useRules } from "@/stores/ruleStore";
import { cn } from "@/lib/utils";

const ROLE_META: Record<
  LineupRole,
  {
    label: string;
    icon: typeof Crosshair;
    accent: string;
  }
> = {
  [lineupRoles.opener]: {
    label: "Opener",
    icon: SportShoe,
    accent: "oklch(0.72 0.18 145)",
  },
  [lineupRoles.closer]: {
    label: "Closer",
    icon: HatGlasses,
    accent: "oklch(0.68 0.20 25)",
  },
  [lineupRoles.awper]: {
    label: "AWPer",
    icon: Crosshair,
    accent: "oklch(0.72 0.16 285)",
  },
  [lineupRoles.support]: {
    label: "Support",
    icon: Wrench,
    accent: "oklch(0.78 0.16 80)",
  },
  [lineupRoles.flex]: {
    label: "Flex",
    icon: Book,
    accent: "oklch(0.70 0.15 190)",
  },
};

type LineupSlotsProps = {
  slots: Record<LineupRole, Player | null>;
};

const LineupSlots = ({ slots }: LineupSlotsProps) => {
  const order: LineupRole[] = [
    lineupRoles.opener,
    lineupRoles.closer,
    lineupRoles.awper,
    lineupRoles.support,
    lineupRoles.flex,
  ];
  const rules = useRules();

  return (
    <div className="grid grid-rows-5 gap-1.5 sm:gap-2">
      {order.map((role, index) => {
        const player = slots[role];
        const meta = ROLE_META[role];
        const Icon = meta.icon;

        return (
          <motion.div
            key={role}
            layout
            className={cn(
              "relative min-w-0 overflow-hidden rounded-xl border p-2.5 text-center transition-colors sm:p-3",
              player
                ? "border-border/80 bg-background/25"
                : "border-border/70 bg-background/10 border-dashed",
            )}
          >
            <div
              className="absolute inset-x-0 top-0 h-0.5"
              style={{
                backgroundColor: player ? meta.accent : "transparent",
              }}
            />

            <div className="flex items-center justify-center gap-1">
              <Icon
                className="size-3 shrink-0"
                style={{ color: player ? meta.accent : undefined }}
              />
              <span className="text-muted-foreground truncate text-[8px] font-black tracking-[0.14em] uppercase sm:text-[9px]">
                {meta.label}
              </span>
            </div>

            {player ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 24 }}
                className="mt-2 min-w-0"
              >
                <div
                  className="mx-auto flex size-9 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `color-mix(in oklch, ${meta.accent} 24%, transparent)`,
                    backgroundColor: `color-mix(in oklch, ${meta.accent} 6%, transparent)`,
                    color: meta.accent,
                  }}
                >
                  {role === lineupRoles.closer && index === 1 ? (
                    <Crown className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>

                <p className="mt-2 truncate text-[10px] leading-tight font-bold sm:text-xs">
                  {player.name}
                </p>

                {rules === "easy" && (
                  <p className="text-muted-foreground mt-2 truncate font-mono text-[10px] tabular-nums">
                    hltv: {player.hltv.toFixed(2)}
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="mt-3">
                <div className="border-border/70 text-muted-foreground/30 mx-auto flex size-9 items-center justify-center rounded-lg border border-dashed">
                  <Icon className="size-4" />
                </div>
                <p className="text-muted-foreground/40 mt-2 text-[9px] font-medium tracking-wider uppercase">
                  Empty
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default LineupSlots;
