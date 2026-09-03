import api from "@/services/api";
import type {
  Credentials,
  UserReturned,
  RegisterUser,
  UpdatedUser,
} from "@/types/userTypes";

const createAccount = async (credentials: RegisterUser): Promise<void> => {
  await api.post("/email", credentials);
};

const login = async (credentials: Credentials): Promise<void> => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);

  await api.post("/email/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

const update = async (
  updated_credentials: UpdatedUser,
): Promise<UserReturned> => {
  const response = await api.put("/email", updated_credentials);
  return response.data;
};

const deleteUser = async (): Promise<void> => {
  await api.delete("/email");
};

export default { createAccount, login, update, deleteUser };
