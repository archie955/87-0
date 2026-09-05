import { Check, X } from "lucide-react";
import { cn, teamToImg } from "@/lib/utils";

type LineupProgressProps = {
  selections: string[];
  current: number;
  reroll: number | null;
};

const LineupProgress = ({
  selections,
  current,
  reroll,
}: LineupProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {selections.map((team, index) => {
        const isRerolled = index === reroll;
        const isComplete = index < current && !isRerolled;
        const isActive = index === current;

        return (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                isComplete && "border-green-500 bg-green-500/10",
                isRerolled && "border-red-500 bg-red-500/10",
                isActive && "scale-110 border-primary bg-primary/5",
                !isComplete &&
                  !isRerolled &&
                  !isActive &&
                  "border-muted bg-muted/30",
              )}
            >
              {team !== "" && (
                <img
                  src={teamToImg(team)}
                  alt={team}
                  className="size-7 object-contain"
                />
              )}

              {isComplete && (
                <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-green-500 text-white">
                  <Check className="size-3" />
                </div>
              )}

              {isRerolled && (
                <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white">
                  <X className="size-3" />
                </div>
              )}
            </div>

            {index < selections.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 transition-colors",
                  index < current && !isRerolled ? "bg-green-500" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LineupProgress;
