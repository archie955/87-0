import api from "@/services/api";
import type { TokenReturned } from "@/types/userTypes";

const createAccount = async (): Promise<TokenReturned> => {
  const response = await api.get("/steam");
  return response.data;
};

const login = async (): Promise<TokenReturned> => {
  const response = await api.get("/steam/login");
  return response.data;
};

export default { createAccount, login };
