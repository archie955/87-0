import type { PersistentUser } from "@/types/userTypes";

const getUser = (): PersistentUser | null => {
  const username = window.localStorage.getItem("username");
  const authname = window.localStorage.getItem("authname");

  if (!username || !authname) {
    return null;
  }

  return { username: username, authname: authname };
};

const saveUser = (user: PersistentUser): void => {
  window.localStorage.setItem("username", user.username);
  window.localStorage.setItem("authname", user.authname);
};

const updateUser = (username: string): void => {
  window.localStorage.setItem("username", username);
};

const removeUser = (): void => {
  window.localStorage.removeItem("username");
  window.localStorage.removeItem("authname");
};

export default { getUser, saveUser, removeUser, updateUser };
