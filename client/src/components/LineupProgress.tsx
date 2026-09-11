import { Check, CircleDot, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type LineupProgressProps = {
  selections: string[];
  current: number;
  pickNumber: number;
  reroll: number | null;
};

const LineupProgress = ({
  selections,
  current,
  pickNumber,
  reroll,
}: LineupProgressProps) => {
  const displayedTeams = selections
    .filter((_, index) => index !== reroll)
    .slice(0, 5);

  const rerolledTeam = reroll !== null ? selections[reroll] : undefined;

  const rerollDisplayIndex = reroll !== null ? reroll : -1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[9px] font-black tracking-[0.2em] uppercase">
          Draft progression
        </p>

        <p className="text-muted-foreground font-mono text-[10px]">
          {pickNumber}/5 locked
        </p>
      </div>

      <div className="w-full min-w-0">
        <div className="grid min-w-0 grid-cols-5 items-center">
          {Array.from({ length: 5 }).map((_, index) => {
            const isComplete = rerolledTeam
              ? index < current - 1
              : index < current;
            const isActive = rerolledTeam
              ? index === current - 1
              : index === current;

            return (
              <div key={index} className="relative flex min-w-0 items-center">
                <div className="relative z-10 flex w-8 shrink-0 justify-center">
                  <div
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-lg border font-mono text-[10px] font-bold transition-all",

                      isComplete &&
                        "border-primary/25 bg-primary/10 text-primary",

                      isActive &&
                        "border-primary/40 bg-primary/15 text-primary scale-105 shadow-[0_0_18px_oklch(0.78_0.16_80_/_10%)]",

                      !isComplete &&
                        !isActive &&
                        "border-border/70 bg-background/20 text-muted-foreground/50",
                    )}
                  >
                    {isActive && <CircleDot className="size-3.5" />}

                    {isComplete && !isActive && <Check className="size-3.5" />}

                    {!isActive && !isComplete && index + 1}
                  </div>
                </div>

                {index < 4 && (
                  <div className="bg-border/60 relative h-px flex-1">
                    <div
                      className={cn(
                        "h-px transition-all duration-300",
                        index < current ? "bg-primary/60 w-full" : "w-0",
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-1 grid min-w-0 grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => {
            const team = displayedTeams[index];

            return (
              <div key={index} className="min-w-0 px-1 text-left">
                <span className="text-muted-foreground block truncate text-[10px] font-medium">
                  {team}
                </span>

                {rerolledTeam && index === rerollDisplayIndex && (
                  <span className="text-destructive mt-0.5 flex min-w-0 items-center gap-0.5 truncate text-[8px] font-medium">
                    <RotateCcw className="size-2.5 shrink-0" />

                    <span className="truncate">{rerolledTeam}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LineupProgress;
