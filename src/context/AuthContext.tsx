import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { type User } from "../types/auth";
import api from "../api/client";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (e) {
      console.error("Failed to load token", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get<User>("/users/profile");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      // logout(); // Optional: depend on how rigorous you want the check to be
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  const login = async (newToken: string) => {
    await SecureStore.setItemAsync("token", newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await api.post<{ valid: boolean }>(
        "/auth/verify-password",
        {
          userId: user.id,
          password,
        },
      );
      return response.data.valid;
    } catch (error) {
      console.error("Password verification failed:", error);
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshProfile,
        verifyPassword,
        isAuthenticated: !!token,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
