import api from "@/services/api";
import persistentUserService from "@/services/persistentUser";
import type { PersistentUser, UpdatedUser, UserReturned } from "@/types/userTypes";

const deleteUser = async (): Promise<void> => {
  await api.delete("/users");
};

const updateUser = async (updated: UpdatedUser): Promise<UserReturned> => {
  const response = await api.put<UserReturned>("/users", updated);
  return response.data;
};

const getUser = async (): Promise<UserReturned> => {
  const response = await api.get<UserReturned>("/users");
  const data = response.data;

  let username = "?";
  if (data.email_login) {
    username = data.email_login.email;
  } else if (data.steam_login) {
    username = data.steam_login.profile_name;
  }
  
  const user: PersistentUser = {
    username: data.username,
    authname: username
  }
  persistentUserService.saveUser(user)
  return data;
}

export default { deleteUser, updateUser, getUser };
