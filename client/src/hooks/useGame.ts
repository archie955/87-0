import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import gameService from "@/services/game";
import type { Game, Lineup } from "@/types/gameTypes";
import type { Result } from "@/types/resultTypes";

interface useGameOutput {
  game: Game | null;
  isPending: boolean;
  isError: boolean;
  submitGame: (lineup: Lineup) => Promise<Result>;
  restart: () => Promise<void>;
}

const useGame = (): useGameOutput => {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ["game"],
    queryFn: () => gameService.getGame(),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const submitGameMutation = useMutation({
    mutationFn: async (lineup: Lineup): Promise<Result> =>
      await gameService.submitGame(lineup),
  });

  const restartGame = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["game"] });
  };

  return {
    game: result.data ?? null,

    isPending: result.isPending,
    isError: result.isError,

    submitGame: (lineup: Lineup): Promise<Result> =>
      submitGameMutation.mutateAsync(lineup),

    restart: (): Promise<void> => restartGame(),
  };
};

export default useGame;
