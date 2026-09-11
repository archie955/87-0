import { useState } from "react";
import {
  Users,
  Dices,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import type { Team } from "@/types/teamTypes";
import type { Result } from "@/types/resultTypes";

import useTeams from "@/hooks/useTeams";
import useGame from "@/hooks/useGame";
import useLineupBuilder from "@/hooks/useLineupBuilder";
import { createLineupPayload, PICK_COUNT } from "@/lib/lineupBuilder";
import { getErrorMessage } from "@/lib/errors";

import { useNotificationActions } from "@/stores/notificationStore";

import LineupProgress from "@/components/LineupProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LineupSlots from "@/components/LineupSlots";
import IglSelector from "@/components/IglSelector";
import GameStage from "@/components/GameStage";
import GameResultDialog from "@/components/GameResultDialog";
import Loading from "@/components/Loading";
import RuleChange from "@/components/RuleChange";

const WINNER_INDEX = 65;

const Game = () => {
  const {
    game,
    isLoading: gameLoading,
    isError: gameErrored,
    startNewGame,
    isStartingNewGame,
    submitLineup,
    isSubmitting,
  } = useGame();

  const {
    teams,
    isLoading: teamsLoading,
    isError: teamsErrored,
    retry: retryTeams,
  } = useTeams();

  const builder = useLineupBuilder();
  const [result, setResult] = useState<Result | null>(null);

  const { setNotification } = useNotificationActions();
  const [lastSyncedGameId, setLastSyncedGameId] = useState<
    string | undefined
  >();

  if (game && game.id !== lastSyncedGameId) {
    setLastSyncedGameId(game.id);
    builder.reset();
    setResult(null);
  }

  const teamIdsBySlot = game
    ? [
        game.team_1_id,
        game.team_2_id,
        game.team_3_id,
        game.team_4_id,
        game.team_5_id,
        game.team_6_id,
      ]
    : [];

  const rollTeamForSlot = (slotNumber: number): Team | null => {
    const teamId = teamIdsBySlot[slotNumber - 1];
    if (teamId === undefined || !teams) return null;
    return teams[teamId] ?? null;
  };

  const makeSlides = (winningTeam: Team): Team[] => {
    if (!teams) return [winningTeam];

    const teamIds = Object.keys(teams).map(Number);
    if (teamIds.length === 0) return [winningTeam];

    const randomTeam = (): Team =>
      teams[teamIds[Math.floor(Math.random() * teamIds.length)]];

    const slides: Team[] = [];

    for (let i = 0; i < WINNER_INDEX; i += 1) {
      slides.push(randomTeam());
    }

    slides.push(winningTeam);

    for (let i = 0; i < 4; i += 1) {
      slides.push(randomTeam());
    }

    return slides;
  };

  const startRolling = (): void => {
    if (!builder.canRoll) return;

    const team = rollTeamForSlot(builder.slotNumber);
    if (!team) return;

    builder.roll(team, makeSlides(team));
  };

  const handleReroll = (): void => {
    if (!builder.canReroll) return;

    const team = rollTeamForSlot(builder.slotNumber + 1);
    if (!team) return;

    builder.reroll(team, makeSlides(team));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!game) return;

    const lineup = createLineupPayload(builder.lineup, builder.igl, game.id);

    if (!lineup) {
      setNotification(
        builder.igl ? "Your lineup isn't complete yet" : "Select an IGL",
        "error",
      );
      return;
    }

    try {
      const response = await submitLineup(lineup);
      setResult(response);
    } catch (error: unknown) {
      setNotification(
        getErrorMessage(error, "Unable to submit lineup"),
        "error",
      );
    }
  };

  const handleRestart = async (): Promise<void> => {
    try {
      await startNewGame();
    } catch (error: unknown) {
      setNotification(
        getErrorMessage(error, "Unable to start a new game"),
        "error",
      );
    }
  };

  if (gameLoading || teamsLoading) {
    return <Loading />;
  }

  if (gameErrored || teamsErrored || !game || !teams) {
    return (
      <Card className="game-panel game-glow mx-auto w-full max-w-xl">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <div className="border-destructive/20 bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl border">
            <ShieldCheck className="size-7" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Unable to load your draft</p>
            <p className="text-muted-foreground text-sm">
              The game data did not arrive correctly. Try starting the session
              again.
            </p>
          </div>
          <Button
            onClick={() => {
              retryTeams();
              void handleRestart();
            }}
            disabled={isStartingNewGame}
          >
            <RotateCcw className="mr-2 size-4" />
            {isStartingNewGame ? "Retrying…" : "Try again"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const showIglSelector = builder.isComplete && result === null;
  const canSubmit = showIglSelector && builder.igl !== null && !isSubmitting;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="game-panel game-grid-bg game-glow relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="bg-primary/10 pointer-events-none absolute -top-24 -right-24 size-64 rounded-full blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-primary/80 flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase">
              <span className="bg-primary size-1.5 rounded-full shadow-[0_0_12px_var(--primary)]" />
              Draft lobby
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Build your <span className="text-primary">5-stack</span>.
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                Roll a team, lock in a player, repeat until you have a full
                roster. Assign IGL responsibility, and submit.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="border-border/70 bg-background/40 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-2 text-xs backdrop-blur">
              <Gauge className="size-3.5" />
              {builder.pickNumber > PICK_COUNT
                ? PICK_COUNT
                : builder.pickNumber}
              /{PICK_COUNT}
            </div>
            <div className="border-border/70 bg-background/40 rounded-full border px-5 py-3 backdrop-blur">
              <RuleChange />
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="space-y-5 xl:sticky xl:top-5">
          <section className="game-panel game-glow rounded-2xl p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="mt-1 text-lg font-bold tracking-tight">
                  Your roster
                </h2>
              </div>
              <div className="border-primary/20 bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl border">
                <Users className="size-4" />
              </div>
            </div>

            <LineupSlots slots={builder.lineup} />

            <div className="border-border/60 mt-5 border-t pt-4">
              <LineupProgress
                selections={builder.slotHistory}
                current={builder.slotNumber - 1}
                pickNumber={
                  builder.canReroll
                    ? builder.pickNumber
                    : builder.pickNumber - 1
                }
                reroll={builder.rerolledAtIndex}
              />
            </div>
          </section>
        </aside>

        <main className="min-w-0">
          <section className="game-panel game-glow overflow-hidden rounded-2xl">
            <div className="border-border/60 bg-background/20 border-b px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl shadow-[0_0_24px_oklch(0.78_0.16_80_/_18%)]">
                    {showIglSelector ? (
                      <Trophy className="size-5" />
                    ) : (
                      <Dices className="size-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-primary/80 text-[10px] font-bold tracking-[0.2em] uppercase">
                      {showIglSelector ? "Final decision" : "Live draft"}
                    </p>
                    <h2 className="mt-0.5 text-lg font-bold">
                      {showIglSelector
                        ? "Choose your IGL"
                        : "Make your next pick"}
                    </h2>
                  </div>
                </div>

                <div className="border-border/60 bg-background/30 text-muted-foreground hidden rounded-full border px-3 py-1.5 text-[11px] font-medium sm:block">
                  {showIglSelector
                    ? "One last choice"
                    : `Pick ${builder.pickNumber}`}
                </div>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 lg:p-7">
              {showIglSelector ? (
                <IglSelector
                  candidates={builder.iglCandidates}
                  selected={builder.igl}
                  onSelect={builder.selectIgl}
                />
              ) : (
                <GameStage
                  status={builder.phase}
                  team={builder.rolledTeam}
                  slides={builder.rollSlides}
                  rollId={builder.rollSequence}
                  winnerIndex={WINNER_INDEX}
                  pickNumber={builder.pickNumber}
                  maxPickNumber={PICK_COUNT}
                  canReroll={builder.canReroll}
                  canPick={builder.canPick}
                  onRoll={startRolling}
                  onRollComplete={builder.rollComplete}
                  onPick={builder.pick}
                  onReroll={handleReroll}
                />
              )}
            </CardContent>
          </section>

          {canSubmit && (
            <div className="mt-5">
              <Button
                onClick={() => void handleSubmit()}
                size="lg"
                className="h-12 w-full rounded-xl text-sm font-bold tracking-wide uppercase shadow-[0_0_30px_oklch(0.78_0.16_80_/_16%)]"
                disabled={isSubmitting}
              >
                <Trophy className="mr-2 size-4" />
                {isSubmitting ? "Evaluating lineup…" : "Evaluate lineup"}
              </Button>
            </div>
          )}
        </main>
      </div>

      <GameResultDialog
        result={result}
        onRestart={() => void handleRestart()}
        isRestarting={isStartingNewGame}
      />
    </div>
  );
};

export default Game;
