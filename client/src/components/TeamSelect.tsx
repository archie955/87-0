import useGame from "@/hooks/useGame";
import useTeams from "@/hooks/useTeams";
import { Teams } from "@/types/teamTypes";

const TeamSelect = () => {
    const { game, isPending: gamePending } = useGame();
    const { teams, isPending: teamPending} = useTeams();

    const team_length = (teams: Teams): number => {
        return Object.keys(teams).length;
    }

    if (teamPending) {
        return <h1>Loading data...</h1>;
    }

    const getRandomInt = (max: number): number => {
        return Math.floor(Math.random() * max);
    };

    const init_carousel = (id: number): Array<number> => {
        const carousel = [];
        const n = Object.keys(teams).length;
        for (let i = 0; i < 65; i++) {
            carousel.push(teams[getRandomInt(n)]);
        }
        carousel.push(teams[game["team_1_id"]]);
        for (let i = 0; i < 4; i++) {
            carousel.push(teams[getRandomInt(n)]);
        }
        return carousel;
    };
};