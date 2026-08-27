import useGame from "@/hooks/useGame";
import useTeams from "@/hooks/useTeams";
import { Player } from "@/types/playerTypes";
import { Teams, Team } from "@/types/teamTypes";
import { LineupRole, Role, Roles } from "@/services/enum";
import { useState } from "react";
import useTeamStore, {
  useTeamActions,
  useOpener,
  useCloser,
  useAwper,
  useSupport,
  useFlex,
  Pick,
} from "@/stores/teamStore";
import TeamRoll from "./TeamRoll";
import { useStatus, useRerollStatus, useRollActions } from "@/stores/rollStore";

const WINNER_INDEX = 35;

const TeamSelect = () => {
  const { game, isPending: gamePending } = useGame();
  const { teams, isPending: teamPending } = useTeams();
  const [teamId, setTeamId] = useState(1);
  const {
    compatibility,
    selectOpener,
    selectCloser,
    selectAwper,
    selectSupport,
    selectIgl,
    submit,
  } = useTeamActions();
  const rerollStatus = useRerollStatus();
  const status = useStatus();
  const { startRoll, finishRoll, resetRoll, reroll } = useRollActions();
  const [slides, setSlides] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [igl, setIgl] = useState<Pick>(Pick.opener);
  const [rollId, setRollId] = useState(0);
  const opener = useOpener();
  const closer = useCloser();
  const awper = useAwper();
  const support = useSupport();
  const flex = useFlex();

  if (teamPending || gamePending || !teams || !game) {
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

  const getTeamId = (turn: number): number => {
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

  const prepareRoll = (turn: number) => {
    const selectedTeamId = getTeamId(turn);
    const selectedTeam = teams[selectedTeamId];

    const slides = makeSlides(selectedTeam);

    setTeam(selectedTeam);
    setSlides(slides);
    setRollId((current) => current + 1);
  };

  const startRolling = () => {
    if (status !== "idle") {
      return;
    }

    prepareRoll(teamId);
    startRoll();
  };

  const handleReroll = () => {
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

  const handleSelectIgl = (p: Pick): (() => void) => {
    return () => setIgl(p);
  };

  const handleSubmit = () => {
    selectIgl(igl);
    submit(game.id);
  };

  return (
    <div>
      {status === "idle" && teamId <= 6 && (
        <button onClick={startRolling}>Start</button>
      )}

      {slides.length > 0 && (
        <TeamRoll
          key={rollId}
          slides={slides}
          winnerIndex={WINNER_INDEX}
          onComplete={handleRollComplete}
        />
      )}

      <div>
        {status === "picking" &&
          team &&
          team.players.map((player) => (
            <div key={player.id}>
              <button
                onClick={() => handleSelectPlayer(player)}
                disabled={!compatibility(player)}
              >
                {player.name}
              </button>
            </div>
          ))}

        {status === "picking" && rerollStatus && teamId < 6 && (
          <button onClick={handleReroll}>Reroll</button>
        )}
        <div>
          <div>
            opener = {(opener && opener.name) || "None"}{" "}
            {opener &&
              (igl === Pick.opener ? (
                "IGL"
              ) : (
                <button onClick={handleSelectIgl(Pick.opener)}>Make IGL</button>
              ))}
          </div>

          <div>
            closer = {(closer && closer.name) || "None"}{" "}
            {closer &&
              (igl === Pick.closer ? (
                "IGL"
              ) : (
                <button onClick={handleSelectIgl(Pick.closer)}>Make IGL</button>
              ))}
          </div>

          <div>
            awper = {(awper && awper.name) || "None"}{" "}
            {awper &&
              (igl === Pick.awper ? (
                "IGL"
              ) : (
                <button onClick={handleSelectIgl(Pick.awper)}>Make IGL</button>
              ))}
          </div>

          <div>
            support = {(support && support.name) || "None"}{" "}
            {support &&
              (igl === Pick.support ? (
                "IGL"
              ) : (
                <button onClick={handleSelectIgl(Pick.support)}>
                  Make IGL
                </button>
              ))}
          </div>

          <div>
            flex = {(flex && flex.name) || "None"}{" "}
            {flex &&
              (igl === Pick.flex ? (
                "IGL"
              ) : (
                <button onClick={handleSelectIgl(Pick.flex)}>Make IGL</button>
              ))}
          </div>
        </div>
        {opener && closer && awper && support && flex && (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default TeamSelect;
