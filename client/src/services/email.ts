import api from "@/services/api";
import type { Credentials, RegisterUser } from "@/types/userTypes";

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

export default { createAccount, login };
