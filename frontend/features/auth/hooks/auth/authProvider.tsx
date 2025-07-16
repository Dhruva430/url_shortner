"use client";

import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

type User = {
  id: number;
  username: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchMe(): Promise<User> {
  const res = await fetch("/api/protected/me", { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    retry: false, // Avoid retrying on auth error
  });

  const isAuthenticated = !isLoading && !isError && !!user;

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
