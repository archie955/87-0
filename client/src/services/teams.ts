import type { Teams } from "@/types/teamTypes";
import api from "@/services/api";

const baseUrl = "/teams";

const getTeams = async (): Promise<Teams> => {
  const response = await api.get<Teams>(baseUrl);
  return response.data;
};

export default { getTeams };
