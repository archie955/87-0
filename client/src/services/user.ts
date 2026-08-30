import api from "@/services/api";

const deleteUser = async (): Promise<void> => {
  await api.delete("/users");
};

export default { deleteUser };
