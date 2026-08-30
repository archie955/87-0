import api from "@/services/api";
import type { TokenReturned, Username } from "@/types/userTypes";

const createAccount = async (username: Username): Promise<TokenReturned> => {
  const response = await api.post("/steam", username);
  return response.data;
};

const login = async (): Promise<TokenReturned> => {
  const response = await api.get("/steam/login");
  return response.data;
};

export default { createAccount, login };
