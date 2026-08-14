import { PersistentUser } from "../types/userTypes";

const getUser = (): PersistentUser | null => {
  const token = window.localStorage.getItem("JSONUser");
  const username = window.localStorage.getItem("username");
  const email = window.localStorage.getItem("email");

  if (!token || !username || !email) {
    return null;
  }

  return { username: username, email: email, token: token };
};

const saveUser = (user: PersistentUser): void => {
  window.localStorage.setItem("JSONUser", user.token);
  window.localStorage.setItem("username", user.username);
  window.localStorage.setItem("email", user.email);
};

const updateUser = (username: string, email: string): void => {
  window.localStorage.setItem("username", username);
  window.localStorage.setItem("email", email);
};

const removeUser = (): void => {
  window.localStorage.removeItem("JSONUser");
  window.localStorage.removeItem("username");
  window.localStorage.removeItem("email");
};

export default { getUser, saveUser, removeUser, updateUser };
