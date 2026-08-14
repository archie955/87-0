import api from "./api";
import { Game } from "../types/gameTypes";

const baseUrl = "/games";

const getGame = async (): Promise<Game> => {
  const response = await api.get(baseUrl);
  return response.data;
};

export default { getGame };
