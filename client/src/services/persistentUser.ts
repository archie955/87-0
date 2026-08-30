import type { PersistentUser } from "@/types/userTypes";

const getUser = (): PersistentUser | null => {
  const token = window.localStorage.getItem("JSONUser");
  const username = window.localStorage.getItem("username");
  const displayname = window.localStorage.getItem("display");

  if (!token || !username || !displayname) {
    return null;
  }

  return { username: username, display: displayname, token: token };
};

const saveUser = (user: PersistentUser): void => {
  window.localStorage.setItem("JSONUser", user.token);
  window.localStorage.setItem("username", user.username);
  window.localStorage.setItem("display", user.display);
};

const updateUser = (username: string): void => {
  window.localStorage.setItem("display", username);
};

const removeUser = (): void => {
  window.localStorage.removeItem("JSONUser");
  window.localStorage.removeItem("username");
  window.localStorage.removeItem("display");
};

export default { getUser, saveUser, removeUser, updateUser };
