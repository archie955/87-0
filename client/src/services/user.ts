import api from "@/services/api";
import type { UpdatedUser, UserReturned } from "@/types/userTypes";

const deleteUser = async (): Promise<void> => {
  await api.delete("/users");
};

const updateUser = async (updated: UpdatedUser): Promise<UserReturned> => {
  const response = await api.put("/users", updated);
  return response.data;
};

const getUser = async (): Promise<UserReturned> => {
  const response = await api.get("/users");
  return response.data;
}

export default { deleteUser, updateUser, getUser };
