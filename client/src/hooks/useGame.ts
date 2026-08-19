import { useQuery } from "@tanstack/react-query";
import gameService from "@/services/game";
import { Game } from "@/types/gameTypes";

interface useGameResult {
  game: Game;
  isPending: boolean;
}

const useGame = (): useGameResult => {
  const result = useQuery({
    queryKey: ["game"],
    queryFn: gameService.getGame,
    refetchOnWindowFocus: false,
    initialData: <Game>{},
  });

  return {
    game: result.data,
    isPending: result.isPending,
  };
};

export default useGame;
