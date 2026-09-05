import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import gameService from "@/services/game";
import type { Game, Lineup } from "@/types/gameTypes";
import type { Result } from "@/types/resultTypes";

interface UseGameOutput {
  game: Game | null;
  isPending: boolean;
  isError: boolean;
  submitGame: (lineup: Lineup) => Promise<Result>;
  restart: () => Promise<void>;
}

const useGame = (): UseGameOutput => {
  const queryClient = useQueryClient();

  const gameQuery = useQuery({
    queryKey: ["game"],
    queryFn: gameService.getGame,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: gameService.submitGame,
  });

  const restart = async (): Promise<void> => {
    await queryClient.refetchQueries({
      queryKey: ["game"],
      type: "active",
    });
  };

  return {
    game: gameQuery.data ?? null,
    isPending: gameQuery.isPending,
    isError: gameQuery.isError,
    submitGame: submitMutation.mutateAsync,
    restart,
  };
};

export default useGame;
