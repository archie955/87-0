import { useMutation, useQuery } from "@tanstack/react-query";

import gameService from "@/services/game";
import type { Game, Lineup } from "@/types/gameTypes";
import type { Result } from "@/types/resultTypes";
import { getErrorMessage } from "@/lib/errors";

interface UseGameOutput {
  game: Game | null;
  isLoading: boolean;
  isError: boolean;
  /** True while a background refetch (i.e. starting a new game) is in flight. */
  isStartingNewGame: boolean;
  /** Fetches a brand new active game, replacing whatever is currently active. */
  startNewGame: () => Promise<void>;
  submitLineup: (lineup: Lineup) => Promise<Result>;
  isSubmitting: boolean;
}

const useGame = (): UseGameOutput => {
  const gameQuery = useQuery({
    queryKey: ["game"],
    queryFn: gameService.getGame,
    refetchOnWindowFocus: false,
    staleTime: 900000, // 15 minutes
    refetchOnMount: "always",
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (lineup: Lineup) => gameService.submitGame(lineup),
  });

  const startNewGame = async (): Promise<void> => {
    const result = await gameQuery.refetch();

    if (result.isError) {
      throw new Error(
        getErrorMessage(result.error, "Unable to start a new game"),
      );
    }
  };

  return {
    game: gameQuery.data ?? null,
    isLoading: gameQuery.isLoading,
    isError: gameQuery.isError,
    isStartingNewGame: gameQuery.isFetching,
    startNewGame,
    submitLineup: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
};

export default useGame;
