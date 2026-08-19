import api from "@/services/api";
import {
  Credentials,
  UserReturned,
  TokenReturned,
  RegisterUser,
  UpdatedUser,
} from "@/types/userTypes";

const createAccount = async (
  credentials: RegisterUser,
): Promise<UserReturned> => {
  const response = await api.post("/users", credentials);
  return response.data;
};

const login = async (credentials: Credentials): Promise<TokenReturned> => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);

  const response = await api.post("/users/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

const update = async (
  updated_credentials: UpdatedUser,
): Promise<UserReturned> => {
  const response = await api.put("/users", updated_credentials);
  return response.data;
};

const deleteUser = async (): Promise<void> => {
  await api.delete("/users");
};

export default { createAccount, login, update, deleteUser };
