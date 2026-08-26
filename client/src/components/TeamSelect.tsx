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
} from "@/stores/teamStore";
import TeamRoll from "./TeamRoll";
import { useStatus, useRerollStatus, useRollActions } from "@/stores/rollStore";

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
  const WINNER_INDEX = 35;
  const reroll = useRerollStatus();
  const status = useStatus();
  const { startRoll, finishRoll, Reroll } = useRollActions();
  const [slides, setSlides] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
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

  const make_slides = (team: Team): Team[] => {
    const slides = [];
    const n = Object.keys(teams).length;
    for (let i = 0; i < WINNER_INDEX; i++) {
      const j = getRandomInt(n);
      slides.push(teams[j]);
    }
    slides.push(team);
    for (let i = 0; i < 4; i++) {
      slides.push(teams[getRandomInt(n)]);
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

  const handleSelectTeam = (turn: number): Team[] => {
    const id = getTeamId(turn);
    const team = teams[id];
    const slides = make_slides(team);
    setTeam(team);
    return slides;
  };

  const handleReroll = () => {
    if (status === "picking" && reroll) {
      setTeamId(teamId + 1);
      Reroll();
      setSlides(handleSelectTeam(teamId));
    }
  };

  const makeSelection = () => {
    if (
      status === "picking" &&
      ((reroll && teamId < 5) || (!reroll && teamId < 6))
    ) {
      setTeamId(teamId + 1);
    }
  };

  const handlePlayers = (): Player[] | void => {
    if (!team) {
      return;
    }
    const players = team.players;
    return players;
  };

  const handleAvailability = (p: Player): LineupRole[] => {
    return compatibility(p);
  };

  const handleRollComplete = () => {
    finishRoll();
  };

  const startRolling = () => {
    setSlides(handleSelectTeam(teamId));
    startRoll();
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
    makeSelection();
  };

  return (
    <div>
      <button onClick={startRolling}>Start</button>
      {slides && (
        <TeamRoll
          slides={slides}
          winnerIndex={WINNER_INDEX}
          onComplete={handleRollComplete}
        />
      )}
      {status === "picking" &&
        team &&
        team.players.map((player) => (
          <div key={player.id}>
            <button onClick={() => handleSelectPlayer(player)}>
              {player.name}
            </button>
          </div>
        ))}
      <button onClick={handleReroll}>Reroll</button>
      <div>
        <div>opener = {(opener && opener.name) || "None"}</div>
        <div>closer = {(closer && closer.name) || "None"}</div>
        <div>awper = {(awper && awper.name) || "None"}</div>
        <div>support = {(support && support.name) || "None"}</div>
        <div>flex = {(flex && flex.name) || "None"}</div>
      </div>
    </div>
  );
};

export default TeamSelect;
