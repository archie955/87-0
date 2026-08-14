import { Teams } from "../types/teamTypes";
import api from "./api";

const baseUrl = "/teams";

const getTeams = async (): Promise<Teams> => {
  const response = await api.get(baseUrl);
  return response.data;
};

export default { getTeams };
