import api from "@/services/api";

const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export default { logout };
