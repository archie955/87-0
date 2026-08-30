import type { PersistentUser } from "@/types/userTypes";

const getUser = (): PersistentUser | null => {
  const token = window.localStorage.getItem("JSONUser");
  const username = window.localStorage.getItem("username");

  if (!token || !username) {
    return null;
  }

  return { username: username, token: token };
};

const saveUser = (user: PersistentUser): void => {
  window.localStorage.setItem("JSONUser", user.token);
  window.localStorage.setItem("username", user.username);
};

const updateUser = (username: string): void => {
  window.localStorage.setItem("username", username);
};

const removeUser = (): void => {
  window.localStorage.removeItem("JSONUser");
  window.localStorage.removeItem("username");
};

export default { getUser, saveUser, removeUser, updateUser };
