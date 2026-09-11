import { AnimatePresence, motion } from "motion/react";
import { Dices, FastForward, RotateCcw, Sparkles } from "lucide-react";

import type { Team } from "@/types/teamTypes";
import type { Player } from "@/types/playerTypes";

import { Button } from "@/components/ui/button";
import TeamRoll from "@/components/TeamRoll";
import PlayerCard from "@/components/PlayerCard";

type Status = "idle" | "rolling" | "picking";

type GameStageProps = {
  status: Status;
  team: Team | null;
  slides: Team[];
  rollId: number;
  winnerIndex: number;
  pickNumber: number;
  maxPickNumber: number;
  canReroll: boolean;
  canPick: (player: Player) => boolean;
  onRoll: () => void;
  onRollComplete: () => void;
  onPick: (player: Player) => void;
  onReroll: () => void;
};

const GameStage = ({
  status,
  team,
  slides,
  rollId,
  winnerIndex,
  pickNumber,
  maxPickNumber,
  canReroll,
  canPick,
  onRoll,
  onRollComplete,
  onPick,
  onReroll,
}: GameStageProps) => {
  return (
    <div className="relative min-h-[470px]">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex min-h-[470px] flex-col items-center justify-center px-4 py-10 text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="border-primary/20 bg-primary/10 text-primary relative mb-7 flex size-24 items-center justify-center rounded-3xl border shadow-[0_0_50px_oklch(0.78_0.16_80_/_10%)]"
            >
              <div className="border-primary/20 absolute inset-3 rounded-2xl border" />
              <Dices className="size-10" />
            </motion.div>

            <div className="max-w-md">
              <p className="text-primary/80 mb-2 text-[10px] font-bold tracking-[0.22em] uppercase">
                Round {pickNumber} of {maxPickNumber}
              </p>
              <h2 className="text-2xl font-black tracking-tight">
                Ready to roll?
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Open your next team
              </p>
            </div>

            <Button
              onClick={onRoll}
              size="lg"
              className="mt-7 h-12 rounded-xl px-6 font-bold"
            >
              <Dices className="mr-2 size-4" />
              Roll a team
            </Button>
          </motion.div>
        )}

        {status === "rolling" && slides.length > 0 && (
          <motion.div
            key={`rolling-${rollId}`}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-[470px] flex-col justify-center"
          >
            <div className="text-muted-foreground mb-6 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
              <FastForward className="text-primary size-3.5" />
              Searching the pool
            </div>

            <TeamRoll
              slides={slides}
              winnerIndex={winnerIndex}
              onComplete={onRollComplete}
            />

            <div className="text-muted-foreground mt-7 flex items-center justify-center gap-2 text-xs">
              <Sparkles className="text-primary size-3.5" />
              The marker decides your team
            </div>
          </motion.div>
        )}

        {status === "picking" && team && (
          <motion.div
            key={`picking-${team.id}-${rollId}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="border-primary/20 bg-primary/[0.06] relative overflow-hidden rounded-2xl border p-5">
              <div className="bg-primary/10 pointer-events-none absolute -top-10 -right-10 size-32 rounded-full blur-2xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-primary/80 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Team acquired
                  </p>
                  <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
                    <h3 className="text-2xl font-black tracking-tight">
                      {team.name}
                    </h3>
                    <span className="text-muted-foreground pb-0.5 text-xs">
                      Pick a player
                    </span>
                  </div>
                </div>

                {canReroll && (
                  <Button
                    onClick={onReroll}
                    variant="outline"
                    size="sm"
                    className="border-primary/20 bg-background/30 rounded-lg"
                  >
                    <RotateCcw className="mr-2 size-3.5" />
                    Reroll
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {team.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  selectable={canPick(player)}
                  onSelect={() => onPick(player)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameStage;
