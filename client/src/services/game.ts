import api from "@/services/api";
import type { Game, Lineup } from "@/types/gameTypes";
import type { Result } from "@/types/resultTypes";

const baseUrl = "/games";

const getGame = async (): Promise<Game> => {
  const response = await api.post<Game>(baseUrl);
  return response.data;
};

const submitGame = async (lineup: Lineup): Promise<Result> => {
  const response = await api.post<Result>(
    `${baseUrl}/${lineup.game_id}`,
    lineup,
  );
  return response.data;
};

export default { getGame, submitGame };
