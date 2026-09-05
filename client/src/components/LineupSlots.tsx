import { motion } from "motion/react";
import { Crosshair, Shield, Target, Wrench } from "lucide-react";
import type { LineupRole } from "@/services/enum";
import { lineupRoles } from "@/services/enum";
import type { Player } from "@/types/playerTypes";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<
  LineupRole,
  React.ComponentType<{ className?: string }>
> = {
  [lineupRoles.opener]: Crosshair,
  [lineupRoles.closer]: Shield,
  [lineupRoles.awper]: Target,
  [lineupRoles.support]: Wrench,
  [lineupRoles.flex]: Shield,
};

const ROLE_LABELS: Record<LineupRole, string> = {
  [lineupRoles.opener]: "Opener",
  [lineupRoles.closer]: "Closer",
  [lineupRoles.awper]: "AWPer",
  [lineupRoles.support]: "Support",
  [lineupRoles.flex]: "Flex",
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

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {order.map((role) => {
        const player = slots[role];
        const Icon = ROLE_ICONS[role];

        return (
          <motion.div
            key={role}
            layout
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-colors",
              player
                ? "border-primary bg-primary/5"
                : "border-dashed border-muted-foreground/30 bg-muted/20",
            )}
          >
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Icon className="size-3" />
              {ROLE_LABELS[role]}
            </div>
            {player ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="space-y-0.5"
              >
                <p className="font-semibold text-sm leading-tight">
                  {player.name}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {player.hltv.toFixed(2)}
                </p>
              </motion.div>
            ) : (
              <p className="text-xs text-muted-foreground/50">Empty</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default LineupSlots;
