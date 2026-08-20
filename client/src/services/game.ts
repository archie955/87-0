import api from "@/services/api";
import { Game, Lineup } from "@/types/gameTypes";
import { Result } from "@/types/resultTypes";

const baseUrl = "/games";

const getGame = async (): Promise<Game> => {
  const response = await api.get(baseUrl);
  return response.data;
};

const submitGame = async (lineup: Lineup): Promise<Result> => {
  const response = await api.post(`${baseUrl}/${lineup.game_id}/user`, lineup);
  return response.data;
};

export default { getGame, submitGame };
