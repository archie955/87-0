import { useState } from "react";
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

const WINNER_INDEX = 45;

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

  const [lastSyncedGameId, setLastSyncedGameId] = useState<string | undefined>(
    undefined,
  );

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
    const teamsData = teams;
    if (!teamsData) return [winningTeam];

    const teamIds = Object.keys(teamsData).map(Number);
    if (teamIds.length === 0) return [winningTeam];

    const randomTeam = (): Team => {
      const id = teamIds[Math.floor(Math.random() * teamIds.length)];
      return teamsData[id];
    };

    const slides: Team[] = [];
    for (let i = 0; i < WINNER_INDEX; i++) slides.push(randomTeam());
    slides.push(winningTeam);
    for (let i = 0; i < 4; i++) slides.push(randomTeam());

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
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Something went wrong loading the game.
          </p>
          <Button
            onClick={() => {
              retryTeams();
              void handleRestart();
            }}
            disabled={isStartingNewGame}
          >
            {isStartingNewGame ? "Retrying…" : "Try again"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const showIglSelector = builder.isComplete && result === null;
  const canSubmit = showIglSelector && builder.igl !== null && !isSubmitting;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="mx-auto flex w-full max-w-3xl flex-row justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Build your lineup</h1>
          <p className="text-sm text-muted-foreground">
            Roll teams, pick 5 players, choose an IGL, submit to score.
          </p>
        </div>
        <RuleChange />
      </div>

      <LineupProgress
        selections={builder.slotHistory}
        current={builder.slotNumber - 1}
        reroll={builder.rerolledAtIndex}
      />

      <LineupSlots slots={builder.lineup} />

      <Card>
        <CardContent className="p-6">
          {(!showIglSelector && (
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
          )) || (
            <IglSelector
              candidates={builder.iglCandidates}
              selected={builder.igl}
              onSelect={builder.selectIgl}
            />
          )}
        </CardContent>
      </Card>

      {canSubmit && (
        <Button
          onClick={() => void handleSubmit()}
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting…" : "Submit lineup"}
        </Button>
      )}

      <GameResultDialog
        result={result}
        onRestart={() => void handleRestart()}
        isRestarting={isStartingNewGame}
      />
    </div>
  );
};

export default Game;
