import React, { createContext, useState, useEffect, useContext } from "react";
import { loginAdmin, getAdminMe } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          const adminData = await getAdminMe();
          setAdmin(adminData);
        } catch (error) {
          console.error(
            "Failed to verify token on initialization:",
            error.message,
          );
          localStorage.removeItem("admin_token");
          setAdmin(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await loginAdmin(username, password);
      localStorage.setItem("admin_token", data.token);
      setAdmin(data.admin);
      setLoading(false);
      return data.admin;
    } catch (error) {
      setLoading(false);
      throw new Error(
        error.response?.data?.message || "Login failed. Try again.",
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{ admin, loading, login, logout, isAuthenticated: !!admin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
