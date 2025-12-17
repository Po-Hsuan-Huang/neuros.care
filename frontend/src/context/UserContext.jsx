// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_URL;
const UserContext = createContext();
export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshUser = () => setRefreshKey(k => k + 1);

  // Fetch username from backend if logged in
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/current_user`, {
        credentials: "include", // send Flask session cookie [web:5]
      });
      const data = await res.json();
      if (data.user) {
        setUsername(data.user.username);
        setEmail(data.user.email);
      } else {
        setUsername(null);
        setEmail(null);
      }
    } catch (e) {
      console.error("Failed to load user", e);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [refreshKey]);

  return (
    <UserContext.Provider value={{ username, email, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};