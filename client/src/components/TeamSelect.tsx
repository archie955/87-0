import useGame from "@/hooks/useGame";
import useTeams from "@/hooks/useTeams";
import { Player } from "@/types/playerTypes";
import { Teams, Team } from "@/types/teamTypes";
import { LineupRole } from "@/services/enum";
import { useState } from "react";
import useTeamStore, { useTeamActions } from "@/stores/teamStore";
import TeamRoll from "./TeamRoll";
import { useStatus, useRerollStatus, useRollActions } from "@/stores/rollStore";

const TeamSelect = () => {
  const { game, isPending: gamePending } = useGame();
  const { teams, isPending: teamPending } = useTeams();
  const [teamId, setTeamId] = useState(1);
  const { compatibility } = useTeamActions();
  const WINNER_INDEX = 35;
  const reroll = useRerollStatus();
  const status = useStatus();
  const { startRoll, finishRoll, Reroll } = useRollActions();
  const [slides, setSlides] = useState<number[]>([]);

  if (teamPending || gamePending || !teams || !game) {
    return <h1>Loading data...</h1>;
  }

  const getRandomInt = (max: number): number => {
    return 1 + Math.floor(Math.random() * max);
  };

  const make_slides = (id: number): number[] => {
    const slides = [];
    const n = Object.keys(teams).length;
    for (let i = 0; i < WINNER_INDEX - 1; i++) {
      const j = getRandomInt(n);
      slides.push(teams[j]["id"]);
    }
    slides.push(id);
    for (let i = 0; i < 4; i++) {
      slides.push(teams[getRandomInt(n)]["id"]);
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

  const handleSelectTeam = (turn: number): number[] => {
    const id = getTeamId(turn);
    const slides = make_slides(id);
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

  const handlePlayers = (id: number): Player[] => {
    const players = teams[id].players;
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
      <button onClick={handleReroll}>Reroll</button>
      <button onClick={makeSelection}>Make Selection</button>
    </div>
  );
};

export default TeamSelect;
