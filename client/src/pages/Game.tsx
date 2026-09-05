/* eslint-disable @typescript-eslint/no-misused-promises */

import { useMemo, useState } from "react";
import type { Player } from "@/types/playerTypes";
import type { Team } from "@/types/teamTypes";
import type { Result } from "@/types/resultTypes";
import type { LineupRole } from "@/services/enum";
import { lineupRoles, Roles } from "@/services/enum";
import useTeams from "@/hooks/useTeams";
import useGame from "@/hooks/useGame";
import {
  useTeamActions,
  useOpener,
  useCloser,
  useAwper,
  useSupport,
  useFlex,
} from "@/stores/teamStore";
import { useStatus, useRerollStatus, useRollActions } from "@/stores/rollStore";
import { useNotificationActions } from "@/stores/notificationStore";
import LineupProgress from "@/components/LineupProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LineupSlots from "@/components/LineupSlots";
import IglSelector from "@/components/IglSelector";
import GameStage from "@/components/GameStage";
import GameResultDialog from "@/components/GameResultDialog";

const WINNER_INDEX = 35;

const Game = () => {
  const { game, isPending: gamePending, submitGame, restart } = useGame();

  const { teams, isPending: teamPending } = useTeams();

  const [teamId, setTeamId] = useState(1);

  const [selections, setSelections] = useState<string[]>(["", "", "", "", ""]);

  const [rerollIndex, setRerollIndex] = useState<number | null>(null);

  const [result, setResult] = useState<Result | null>(null);
  const [slides, setSlides] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [igl, setIgl] = useState<LineupRole | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [rollId, setRollId] = useState(0);

  const {
    finishGame,
    compatibility,
    selectOpener,
    selectCloser,
    selectAwper,
    selectSupport,
    selectIgl,
    createLineup,
  } = useTeamActions();

  const status = useStatus();
  const rerollStatus = useRerollStatus();

  const { startRoll, finishRoll, resetRoll, reroll } = useRollActions();

  const opener = useOpener();
  const closer = useCloser();
  const awper = useAwper();
  const support = useSupport();
  const flex = useFlex();

  const slots = useMemo<Record<LineupRole, Player | null>>(
    () => ({
      [lineupRoles.opener]: opener,
      [lineupRoles.closer]: closer,
      [lineupRoles.awper]: awper,
      [lineupRoles.support]: support,
      [lineupRoles.flex]: flex,
    }),
    [opener, closer, awper, support, flex],
  );

  const iglCandidates = useMemo(
    () =>
      (Object.entries(slots) as [LineupRole, Player | null][])
        .filter(([, p]) => p !== null)
        .map(([role, player]) => ({ role, player: player! })),
    [slots],
  );

  const { setNotification } = useNotificationActions();

  if (teamPending || !teams || gamePending || !game) {
    return <h1>Loading data...</h1>;
  }

  const getRandomInt = (max: number): number => {
    return 1 + Math.floor(Math.random() * max);
  };

  const makeSlides = (winningTeam: Team): Team[] => {
    const slides: Team[] = [];
    const numberOfTeams = Object.keys(teams).length;

    for (let i = 0; i < WINNER_INDEX; i++) {
      const randomId = getRandomInt(numberOfTeams);
      slides.push(teams[randomId]);
    }

    slides.push(winningTeam);

    for (let i = 0; i < 4; i++) {
      const randomId = getRandomInt(numberOfTeams);
      slides.push(teams[randomId]);
    }

    return slides;
  };

  const getTeamId = (turn: number): number | void => {
    switch (turn) {
      case 1:
        return game.team_1_id;

      case 2:
        return game.team_2_id;

      case 3:
        return game.team_3_id;

      case 4:
        return game.team_4_id;

      case 5:
        return game.team_5_id;

      case 6:
        return game.team_6_id;

      default:
        return;
    }
  };

  const prepareRoll = (turn: number): void => {
    const selectedTeamId = getTeamId(turn);

    if (!selectedTeamId) {
      return;
    }

    const selectedTeam = teams[selectedTeamId];

    if (!selectedTeam) {
      return;
    }

    const newSlides = makeSlides(selectedTeam);

    setTeam(selectedTeam);
    setSlides(newSlides);
    setRollId((current) => current + 1);
  };

  const startRolling = (): void => {
    if (status !== "idle") {
      return;
    }

    if (teamId > 6) {
      return;
    }

    prepareRoll(teamId);
    startRoll();
  };

  const handleReroll = (): void => {
    if (status !== "picking" || !rerollStatus) {
      return;
    }

    if (teamId >= 6) {
      return;
    }

    if (!team) {
      return;
    }

    const currentIndex = teamId - 1;

    setSelections((previous) => {
      const next = [...previous];

      next[currentIndex] = team.name;
      next.push("");

      return next;
    });

    setRerollIndex(currentIndex);

    const nextTeamId = teamId + 1;

    setTeamId(nextTeamId);

    prepareRoll(nextTeamId);

    reroll();
  };

  const handleRollComplete = (): void => {
    finishRoll();
  };

  const handleSelectPlayer = (player: Player): void => {
    switch (player.role) {
      case Roles.AWPER:
        selectAwper(player);
        break;

      case Roles.CLOSER:
        selectCloser(player);
        break;

      case Roles.OPENER:
        selectOpener(player);
        break;

      case Roles.SUPPORT:
        selectSupport(player);
        break;
    }

    if (team) {
      const selectedIndex = teamId - 1;

      setSelections((previous) => {
        const next = [...previous];

        next[selectedIndex] = team.name;

        return next;
      });
    }

    setTeam(null);

    setTeamId((current) => current + 1);

    resetRoll();
  };

  const handleSubmit = async (): Promise<void> => {
    if (igl !== null) {
      selectIgl(igl);
    }

    if (!game) {
      return;
    }

    setSubmitting(true);

    const lineup = createLineup(game.id);

    try {
      const response = await submitGame(lineup);

      setResult(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setNotification(error.message, "error");
      }
    } finally {
      setSlides([]);
      setIgl(null);
      finishGame();
      setSubmitting(false);
    }
  };

  const handleRestart = async (): Promise<void> => {
    if (!result) {
      return;
    }

    try {
      await restart();

      setResult(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setNotification(error.message, "error");
      } else {
        setNotification("Error starting new game", "error");
      }
    }
  };

  const currentProgressIndex = teamId - 1;

  const progressSelections =
    rerollIndex === null ? selections.slice(0, 5) : selections;

  const showIglSelector =
    (teamId === 5 && rerollStatus) || (teamId === 6 && rerollStatus);

  const canSubmit = showIglSelector && !result && !submitting;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Build your lineup</h1>

        <p className="text-sm text-muted-foreground">
          Roll teams, pick 5 players, choose an IGL, submit to score.
        </p>
      </div>

      <LineupProgress
        selections={progressSelections}
        current={currentProgressIndex}
        reroll={rerollIndex}
      />

      <LineupSlots slots={slots} />

      <Card>
        <CardContent className="p-6">
          <GameStage
            status={status}
            team={team}
            slides={slides}
            rollId={rollId}
            winnerIndex={WINNER_INDEX}
            pickNumber={teamId}
            maxPickNumber={selections.length}
            canReroll={rerollStatus && teamId < 6}
            canPick={compatibility}
            onRoll={startRolling}
            onRollComplete={handleRollComplete}
            onPick={handleSelectPlayer}
            onReroll={handleReroll}
          />
        </CardContent>
      </Card>

      {showIglSelector && (
        <IglSelector
          candidates={iglCandidates}
          selected={igl}
          onSelect={setIgl}
        />
      )}

      {canSubmit && (
        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit lineup"}
        </Button>
      )}

      <GameResultDialog result={result} onRestart={handleRestart} />
    </div>
  );
};

export default Game;
