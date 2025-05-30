"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/lib/types";
import { login_api } from "@/api/auth";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "./utils";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = getFromLocalStorage("user");
      const accessToken = getFromLocalStorage("accessToken");
      if (storedUser) {
        setUser(storedUser);
      }
      if (accessToken) {
        console.log("Access Token found:", accessToken);
      } else {
        console.log("No access token found");
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user, accessToken } = await login_api(email, password);
    console.log("Login successful:", user, accessToken);
    setToLocalStorage("user", user);
    setToLocalStorage("accessToken", accessToken);
    setUser(user);
    setAccessToken(accessToken);
  };

  const logout = () => {
    removeFromLocalStorage("user");
    removeFromLocalStorage("accessToken");
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, isLoading, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
