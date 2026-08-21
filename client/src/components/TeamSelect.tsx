import useGame from "@/hooks/useGame";
import useTeams from "@/hooks/useTeams";
import { Player } from "@/types/playerTypes";
import { Teams, Team } from "@/types/teamTypes";
import { LineupRole } from "@/services/enum";
import { useState } from "react";
import useTeamStore, { useTeamActions } from "@/stores/teamStore";
import Example from "./carousel-standard-1";

const TeamSelect = () => {
  const { game, isPending: gamePending } = useGame();
  const { teams, isPending: teamPending } = useTeams();
  const [teamId, setTeamId] = useState(1);
  const { compatibility } = useTeamActions();

  if (teamPending || gamePending) {
    return <h1>Loading data...</h1>;
  }

  const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
  };

  const make_carousel = (id: number): number[] => {
    const carousel = [];
    const n = Object.keys(teams).length;
    for (let i = 0; i < 65; i++) {
      carousel.push(teams[getRandomInt(n)]["id"]);
    }
    carousel.push(id);
    for (let i = 0; i < 4; i++) {
      carousel.push(teams[getRandomInt(n)]["id"]);
    }
    return carousel;
  };

  const handleSelectTeam = (turn: number): number[] => {
    let id: number;
    switch (turn) {
      case 1:
        id = game.team_1_id;
        break;
      case 2:
        id = game.team_2_id;
        break;
      case 3:
        id = game.team_3_id;
        break;
      case 4:
        id = game.team_4_id;
        break;
      case 5:
        id = game.team_5_id;
        break;
      default:
        id = game.team_6_id;
    }
    const carousel = make_carousel(id);
    return carousel;
  };

  const handlePlayers = (id: number): Player[] => {
    const players = teams[id].players;
    return players;
  };

  const handleAvailability = (p: Player): LineupRole[] => {
    return compatibility(p);
  };
  console.log(teams);
  return <Example />;
};

export default TeamSelect;
