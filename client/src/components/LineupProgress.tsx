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

      <div className="flex items-center">
        {selections.map((team, index) => {
          const isRerolled = index === reroll;
          const isComplete = index < current && !isRerolled;
          const isActive = index === current;

          return (
            <div key={index} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className={cn(
                    "relative flex size-8 items-center justify-center rounded-lg border font-mono text-[10px] font-bold transition-all",
                    isComplete &&
                      "border-primary/25 bg-primary/10 text-primary",
                    isRerolled &&
                      "border-destructive/25 bg-destructive/10 text-destructive",
                    isActive &&
                      "border-primary/40 bg-primary/15 text-primary scale-105 shadow-[0_0_18px_oklch(0.78_0.16_80_/_10%)]",
                    !isComplete &&
                      !isRerolled &&
                      !isActive &&
                      "border-border/70 bg-background/20 text-muted-foreground/50",
                  )}
                >
                  {isActive && <CircleDot className="size-3.5" />}
                  {isComplete && <Check className="size-3.5" />}
                  {isRerolled && <RotateCcw className="size-3.5" />}
                  {!isActive && !isComplete && !isRerolled && index + 1}
                </div>

                <span className="text-muted-foreground mt-1.5 w-full truncate px-1 text-center text-[8px] font-medium">
                  {team}
                </span>
              </div>

              {index < selections.length - 1 && (
                <div className="bg-border/60 mx-1 h-px flex-1">
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
    </div>
  );
};

export default LineupProgress;
