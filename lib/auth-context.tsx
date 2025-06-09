"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/lib/types";
import { login_api } from "@/api/auth";
import { updateUserProfile } from "@/api/user";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "./utils";
import { getMyInfo } from "@/api/user";

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
      try {
        const storedUser = getFromLocalStorage("user");
        const accessToken = getFromLocalStorage("accessToken");

        if (accessToken) {
          // If there's an access token, verify it by fetching user info
          const userInfo = await getMyInfo();
          setUser(userInfo);
          setToLocalStorage("user", userInfo);
          setAccessToken(accessToken);
        } else if (storedUser) {
          // Fallback to stored user if no token (optional)
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Clear invalid credentials
        removeFromLocalStorage("user");
        removeFromLocalStorage("accessToken");
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, accessToken } = await login_api(email, password);
      setToLocalStorage("user", user);
      setToLocalStorage("accessToken", accessToken);
      setUser(user);
      setAccessToken(accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    try {
      removeFromLocalStorage("user");
      removeFromLocalStorage("accessToken");
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await updateUserProfile(data);
        const newUser = { ...user, ...data };
        setToLocalStorage("user", newUser);
        setUser(newUser);
        return updatedUser;
      } catch (error) {
        console.error("Failed to update profile:", error);
        throw error;
      }
    }
    throw new Error("User is not authenticated.");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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