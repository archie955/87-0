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
const PICK_COUNT = 5;

const Game = () => {
  const { game, isPending: gamePending, submitGame, restart } = useGame();

  const { teams, isPending: teamPending } = useTeams();

  const [teamId, setTeamId] = useState(1);
  const [selections, setSelections] = useState<string[]>(
    Array(PICK_COUNT).fill(""),
  );
  const [rerollIndex, setRerollIndex] = useState<number | null>(null);

  const [result, setResult] = useState<Result | null>(null);

  const [slides, setSlides] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);

  const [igl, setIgl] = useState<LineupRole | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [rollId, setRollId] = useState(0);

  const {
    reset: resetTeam,
    compatibility,
    selectOpener,
    selectCloser,
    selectAwper,
    selectSupport,
    createLineup,
  } = useTeamActions();

  const status = useStatus();
  const rerollStatus = useRerollStatus();

  const { startRoll, finishRoll, reset: resetRoll, reroll } = useRollActions();

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
        .filter(([, player]) => player !== null)
        .map(([role, player]) => ({
          role,
          player: player!,
        })),
    [slots],
  );

  const { setNotification } = useNotificationActions();

  const getRandomInt = (max: number): number =>
    1 + Math.floor(Math.random() * max);

  const getTeamId = (turn: number): number | null => {
    switch (turn) {
      case 1:
        return game?.team_1_id ?? null;
      case 2:
        return game?.team_2_id ?? null;
      case 3:
        return game?.team_3_id ?? null;
      case 4:
        return game?.team_4_id ?? null;
      case 5:
        return game?.team_5_id ?? null;
      case 6:
        return game?.team_6_id ?? null;
      default:
        return null;
    }
  };

  const makeSlides = (winningTeam: Team): Team[] => {
    const numberOfTeams = Object.keys(teams ?? {}).length;
    const result: Team[] = [];

    for (let i = 0; i < WINNER_INDEX; i++) {
      const randomId = getRandomInt(numberOfTeams);
      result.push(teams![randomId]);
    }

    result.push(winningTeam);

    for (let i = 0; i < 4; i++) {
      const randomId = getRandomInt(numberOfTeams);
      result.push(teams![randomId]);
    }

    return result;
  };

  const prepareRoll = (turn: number): boolean => {
    const selectedTeamId = getTeamId(turn);

    if (!selectedTeamId || !teams) {
      return false;
    }

    const selectedTeam = teams[selectedTeamId];

    if (!selectedTeam) {
      return false;
    }

    setTeam(selectedTeam);
    setSlides(makeSlides(selectedTeam));
    setRollId((current) => current + 1);

    return true;
  };

  const startRolling = (): void => {
    if (status !== "idle") return;
    if (teamId > 6) return;

    if (prepareRoll(teamId)) {
      startRoll();
    }
  };

  const handleRollComplete = (): void => {
    finishRoll();
  };

  const handleReroll = (): void => {
    if (status !== "picking") return;
    if (!rerollStatus) return;
    if (teamId >= 6) return;
    if (!team) return;

    const currentIndex = teamId - 1;

    setSelections((previous) => {
      const next = [...previous];
      next[currentIndex] = team.name;
      next.push("");
      return next;
    });

    setRerollIndex(currentIndex);

    const nextTeamId = teamId + 1;

    if (!prepareRoll(nextTeamId)) {
      return;
    }

    setTeamId(nextTeamId);
    reroll();
  };

  const handleSelectPlayer = (player: Player): void => {
    if (!team) return;
    if (!compatibility(player)) return;

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

    const selectedIndex = teamId - 1;

    setSelections((previous) => {
      const next = [...previous];
      next[selectedIndex] = team.name;
      return next;
    });

    setTeam(null);
    setTeamId((current) => current + 1);
    setRerollIndex(null);
    resetRoll();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!game) return;

    if (!igl) {
      setNotification("Select an IGL", "error");
      return;
    }

    setSubmitting(true);

    try {
      const lineup = createLineup(game.id, igl);
      const response = await submitGame(lineup);

      setResult(response);

      setSlides([]);
      setTeam(null);
      resetRoll();
      resetTeam();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setNotification(error.message, "error");
      } else {
        setNotification("Unable to submit lineup", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = async (): Promise<void> => {
    if (submitting) return;

    setSubmitting(true);

    try {
      setResult(null);
      setTeamId(1);
      setSelections(Array(PICK_COUNT).fill(""));
      setRerollIndex(null);
      setSlides([]);
      setTeam(null);
      setIgl(null);

      resetTeam();
      resetRoll();

      await restart();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setNotification(error.message, "error");
      } else {
        setNotification("Unable to start a new game", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (teamPending || !teams || gamePending || !game) {
    return <h1>Loading data...</h1>;
  }

  const playersSelected =
    opener !== null &&
    closer !== null &&
    awper !== null &&
    support !== null &&
    flex !== null;

  const showIglSelector =
    playersSelected && teamId === PICK_COUNT + 1 && result === null;

  const canSubmit = showIglSelector && igl !== null && !submitting;

  const currentProgressIndex = Math.min(teamId - 1, PICK_COUNT);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Build your lineup</h1>

        <p className="text-sm text-muted-foreground">
          Roll teams, pick 5 players, choose an IGL, submit to score.
        </p>
      </div>

      <LineupProgress
        selections={selections}
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
            pickNumber={Math.min(teamId, PICK_COUNT)}
            maxPickNumber={PICK_COUNT}
            canReroll={rerollStatus && teamId < PICK_COUNT + 1}
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
