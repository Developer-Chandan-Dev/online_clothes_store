/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

export const UserContext = createContext();

const LOCAL_STORAGE_KEY = "digital_clothing";

const userFromLocalStorage = localStorage.getItem(LOCAL_STORAGE_KEY)
  ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
  : null;

const UserContextProvider = (props) => {
  const [user, setUser] = useState(userFromLocalStorage);

  const createUser = async (user) => {
    if (!user) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    setUser(user);
  };

  const value = { user, setUser, createUser };

  return (
    <UserContext.Provider value={value}>{props.children}</UserContext.Provider>
  );
};

export default UserContextProvider;
