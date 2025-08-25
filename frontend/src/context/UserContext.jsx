/* eslint-disable react/prop-types */
import { createContext, useState } from "react";

export const UserContext = createContext();

const STORAGE_KEY = "online_clothing";

const userFromLocalStorage = localStorage.getItem(STORAGE_KEY)
  ? JSON.parse(localStorage.getItem(STORAGE_KEY))
  : null;

const UserContextProvider = (props) => {
  const [user, setUser] = useState(userFromLocalStorage);

  const createUser = async (userData) => {
    if (!userData) return;
    
    // Store only _id, username, and email in localStorage
    const localStorageData = {
      _id: userData._id,
      username: userData.name || userData.username,
      email: userData.email
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageData));
    
    // Store full user object in cookie
    document.cookie = `${STORAGE_KEY}=${JSON.stringify(userData)}; path=/;`;
    
    setUser(userData);
  };

  const getUser = () => {
    // Try to get user from state first
    if (user) return user;
    
    // Try to get user from localStorage
    const localStorageUser = localStorage.getItem(STORAGE_KEY);
    if (localStorageUser) {
      const parsedUser = JSON.parse(localStorageUser);
      setUser(parsedUser);
      return parsedUser;
    }
    
    // Try to get user from cookie
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find(cookie => cookie.startsWith(STORAGE_KEY));
    if (sessionCookie) {
      const cookieValue = sessionCookie.split("=")[1];
      if (cookieValue) {
        const parsedUser = JSON.parse(decodeURIComponent(cookieValue));
        // Store only _id, username, and email in localStorage
        const localStorageData = {
          _id: parsedUser._id,
          username: parsedUser.name || parsedUser.username,
          email: parsedUser.email
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageData));
        setUser(parsedUser);
        return parsedUser;
      }
    }
    
    return null;
  };

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    
    // Remove session cookie
    document.cookie = `${STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    setUser(null);
  };

  // Fallback mechanism to restore user session
  const restoreUserSession = () => {
    try {
      // Check if we have a valid user
      const currentUser = getUser();
      if (currentUser) {
        return currentUser;
      }
      
      // Try to restore from any available source
      // This could involve making an API call to verify the user's session
      // For now, we'll just clear any corrupted data
      clearUser();
      return null;
    } catch (error) {
      console.error("Error restoring user session:", error);
      clearUser();
      return null;
    }
  };

  const value = { user, setUser, createUser, getUser, clearUser, restoreUserSession };

  return (
    <UserContext.Provider value={value}>{props.children}</UserContext.Provider>
  );
};

export default UserContextProvider;
