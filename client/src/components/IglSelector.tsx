import { motion } from "motion/react";
import {
  Crown,
  Crosshair,
  SportShoe,
  HatGlasses,
  Wrench,
  Book,
} from "lucide-react";

import { lineupRoles, type LineupRole } from "@/services/enum";
import type { Player } from "@/types/playerTypes";
import { cn } from "@/lib/utils";
import { useRules } from "@/stores/ruleStore";

type IglSelectorProps = {
  candidates: { role: LineupRole; player: Player }[];
  selected: LineupRole | null;
  onSelect: (role: LineupRole) => void;
};

const IglSelector = ({ candidates, selected, onSelect }: IglSelectorProps) => {
  const rules = useRules();

  const ROLE_ICONS: Record<
    LineupRole,
    React.ComponentType<{ className?: string }>
  > = {
    [lineupRoles.opener]: SportShoe,
    [lineupRoles.closer]: HatGlasses,
    [lineupRoles.awper]: Crosshair,
    [lineupRoles.support]: Wrench,
    [lineupRoles.flex]: Book,
  };

  if (candidates.length === 0) return null;

  return (
    <div className="mx-auto flex min-h-[470px] w-full max-w-4xl flex-col justify-center gap-7">
      <div className="mx-auto max-w-xl text-center">
        <div className="border-primary/20 bg-primary/10 text-primary mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border">
          <Crown className="size-5" />
        </div>
        <p className="text-primary/80 text-[10px] font-black tracking-[0.22em] uppercase">
          Final decision
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">
          Who leads the team?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Pick one eligible player to become the IGL. Your final score is based
          on the lineup you have built.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {candidates.map(({ role, player }) => {
          const isSelected = selected === role;
          const Icon = ROLE_ICONS[role];

          return (
            <motion.button
              key={role}
              type="button"
              onClick={() => onSelect(role)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                isSelected
                  ? "border-primary/40 bg-primary/[0.08] shadow-[0_0_28px_oklch(0.78_0.16_80_/_8%)]"
                  : "border-border/80 bg-card hover:border-primary/20 hover:bg-secondary/60",
              )}
            >
              <div className="bg-primary/80 absolute inset-x-0 top-0 h-0.5 opacity-60" />

              <div className="flex items-start justify-between gap-3">
                {isSelected ? (
                  <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.14em] uppercase">
                    <Crown className="size-3" />
                    IGL
                  </span>
                ) : (
                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.14em] uppercase">
                    <Icon className="size-3" />
                    {String(role)}
                  </span>
                )}
              </div>

              <div className="mt-5">
                <p className="text-xl font-black tracking-tight">
                  {player.name}
                </p>

                {rules === "easy" && (
                  <div className="border-border/60 mt-4 flex items-end justify-between border-t pt-3">
                    <span className="text-muted-foreground text-[12px] font-bold tracking-[0.15em] uppercase">
                      IGL Score
                    </span>
                    <span className="font-mono text-sm text-[12px] font-bold tabular-nums">
                      +{player.igl_score.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default IglSelector;
