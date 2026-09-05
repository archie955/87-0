import { AnimatePresence, motion } from "motion/react";
import { Dices } from "lucide-react";
import type { Team } from "@/types/teamTypes";
import type { Player } from "@/types/playerTypes";
import { Button } from "@/components/ui/button";
import TeamRoll from "@/components/TeamRoll";
import PlayerCard from "@/components/PlayerCard";
import { teamToImg } from "@/lib/utils";

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
    <div className="relative min-h-[420px]">
      {"Stage Test"}
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center gap-6 py-16"
          >
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Dices className="size-10" />
            </div>
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-semibold">Ready to roll?</h2>
              <p className="text-sm text-muted-foreground">
                Pick {pickNumber} of {maxPickNumber} — roll to get a random team
              </p>
            </div>
            <Button onClick={onRoll} size="lg">
              <Dices className="mr-2 size-4" />
              Roll a team
            </Button>
          </motion.div>
        )}

        {status === "rolling" && slides.length > 0 && (
          <motion.div
            key={`rolling-${rollId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="py-8"
          >
            <TeamRoll
              slides={slides}
              winnerIndex={winnerIndex}
              onComplete={onRollComplete}
            />
          </motion.div>
        )}

        {status === "picking" && team && (
          <motion.div
            key={`picking-${team.id}-${rollId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={teamToImg(team.name)}
                  alt={team.name}
                  className="size-12 object-contain"
                />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Pick {pickNumber} of {maxPickNumber}
                  </p>
                  <p className="text-lg font-semibold leading-none">
                    {team.name}
                  </p>
                </div>
              </div>
              {canReroll && (
                <Button onClick={onReroll} variant="outline" size="sm">
                  Reroll team
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
