/* eslint-disable @typescript-eslint/no-misused-promises */
import useTeams from "@/hooks/useTeams";
import type { Player } from "@/types/playerTypes";
import type { Team } from "@/types/teamTypes";
import { lineupRoles, Roles } from "@/services/enum";
import type { LineupRole } from "@/services/enum";
import { useState } from "react";
import {
  useTeamActions,
  useOpener,
  useCloser,
  useAwper,
  useSupport,
  useFlex,
} from "@/stores/teamStore";
import TeamRoll from "@/components/TeamRoll";
import { useStatus, useRerollStatus, useRollActions } from "@/stores/rollStore";
import { useNotificationActions } from "@/stores/notificationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Result } from "@/types/resultTypes";
import { Dialog } from "@/components/ui/dialog";
import PlayerCard from "@/components/PlayerCard";
import useGame from "@/hooks/useGame";

const WINNER_INDEX = 35;

const Game = () => {
  const { game, isPending: gamePending, submitGame, restart } = useGame();
  const [result, setResult] = useState<Result>();
  const { teams, isPending: teamPending } = useTeams();
  const [teamId, setTeamId] = useState(1);
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
  const rerollStatus = useRerollStatus();
  const status = useStatus();
  const { startRoll, finishRoll, resetRoll, reroll } = useRollActions();
  const [slides, setSlides] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [igl, setIgl] = useState<LineupRole | null>(null);
  const [rollId, setRollId] = useState(0);
  const opener = useOpener();
  const closer = useCloser();
  const awper = useAwper();
  const support = useSupport();
  const flex = useFlex();
  const { setNotification } = useNotificationActions();

  if (teamPending || !teams || gamePending || !game) {
    return <h1>Loading data...</h1>;
  }

  const getRandomInt = (max: number): number => {
    return 1 + Math.floor(Math.random() * max);
  };

  const makeSlides = (team: Team): Team[] => {
    const slides: Team[] = [];
    const numberOfTeams = Object.keys(teams).length;

    for (let i = 0; i < WINNER_INDEX; i++) {
      const randomId = getRandomInt(numberOfTeams);
      slides.push(teams[randomId]);
    }

    slides.push(team);
    for (let i = 0; i < 4; i++) {
      const randomId = getRandomInt(numberOfTeams);
      slides.push(teams[randomId]);
    }

    return slides;
  };

  const getTeamId = (turn: number): number | void => {
    if (!game) {
      return;
    }
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

      default:
        return game.team_6_id;
    }
  };

  const prepareRoll = (turn: number): void => {
    const selectedTeamId = getTeamId(turn);
    if (!selectedTeamId) {
      return;
    }
    const selectedTeam = teams[selectedTeamId];

    const slides = makeSlides(selectedTeam);

    setTeam(selectedTeam);
    setSlides(slides);
    setRollId((current) => current + 1);
  };

  const startRolling = (): void => {
    if (status !== "idle") {
      return;
    }

    prepareRoll(teamId);
    startRoll();
  };

  const handleReroll = (): void => {
    if (status !== "picking" || !rerollStatus) {
      return;
    }

    const nextTeamId = teamId + 1;

    if (nextTeamId > 6) {
      return;
    }

    setTeamId(nextTeamId);
    prepareRoll(nextTeamId);

    reroll();
  };

  const handleRollComplete = () => {
    finishRoll();
  };

  const handleSelectPlayer = (player: Player) => {
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

    setTeam(null);
    setTeamId((current) => current + 1);
    resetRoll();
  };

  const handleSelectIgl = (p: LineupRole): (() => void) => {
    return () => setIgl(p);
  };

  const handleSubmit = async () => {
    if (igl !== null) {
      selectIgl(igl);
    }
    if (!game) {
      return;
    }

    const lineup = createLineup(game.id);

    try {
      const response = await submitGame(lineup);
      setResult(response);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setNotification(e.message, "error");
      }
    } finally {
      setSlides([]);
      setIgl(null);
      finishGame();
    }
  };

  const handleRestart = async (): Promise<void> => {
    if (!result) {
      return;
    }

    try {
      await restart();
      setResult(undefined);
    } catch (error) {
      if (error instanceof Error) {
        setNotification(error.message, "error");
      } else {
        setNotification("Error starting new game", "error");
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Build your lineup</h1>
        <p className="text-sm text-muted-foreground">
          Roll teams, pick 5 players, choose an IGL, submit to score.
        </p>
      </div>
      {result && <Dialog>Score is {result.score}</Dialog>}
      {result && <Button onClick={handleRestart}>Start New Game</Button>}
      {game && status === "idle" && teamId <= 6 && (
        <Button onClick={startRolling}>Roll</Button>
      )}

      {game && slides.length > 0 && (
        <TeamRoll
          key={rollId}
          slides={slides}
          winnerIndex={WINNER_INDEX}
          onComplete={handleRollComplete}
        />
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-ends gap-4">
          <CardTitle className="text-lg">Choose your team</CardTitle>
          <CardTitle className="text-lg">Test card description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
            {status === "picking" &&
              team &&
              team.players.map((player) => (
                <div key={player.id}>
                  <PlayerCard
                    player={player}
                    selected={!compatibility(player)}
                    onSelect={() => handleSelectPlayer(player)}
                  />
                </div>
              ))}
            {status === "picking" && rerollStatus && teamId < 6 && (
              <Button onClick={handleReroll}>Reroll</Button>
            )}
            <div>
              <div>
                opener = {(opener && opener.name) || "None"}{" "}
                {opener &&
                  (igl === lineupRoles.opener ? (
                    "IGL"
                  ) : (
                    <Button onClick={handleSelectIgl(lineupRoles.opener)}>
                      Make IGL
                    </Button>
                  ))}
              </div>
              <div>
                closer = {(closer && closer.name) || "None"}{" "}
                {closer &&
                  (igl === lineupRoles.closer ? (
                    "IGL"
                  ) : (
                    <Button onClick={handleSelectIgl(lineupRoles.closer)}>
                      Make IGL
                    </Button>
                  ))}
              </div>
              <div>
                awper = {(awper && awper.name) || "None"}{" "}
                {awper &&
                  (igl === lineupRoles.awper ? (
                    "IGL"
                  ) : (
                    <Button onClick={handleSelectIgl(lineupRoles.awper)}>
                      Make IGL
                    </Button>
                  ))}
              </div>
              <div>
                support = {(support && support.name) || "None"}{" "}
                {support &&
                  (igl === lineupRoles.support ? (
                    "IGL"
                  ) : (
                    <Button onClick={handleSelectIgl(lineupRoles.support)}>
                      Make IGL
                    </Button>
                  ))}
              </div>
              <div>
                flex = {(flex && flex.name) || "None"}{" "}
                {flex &&
                  (igl === lineupRoles.flex ? (
                    "IGL"
                  ) : (
                    <Button onClick={handleSelectIgl(lineupRoles.flex)}>
                      Make IGL
                    </Button>
                  ))}
              </div>
            </div>
            {opener && closer && awper && support && flex && (
              <Button onClick={handleSubmit}>Submit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Game;
