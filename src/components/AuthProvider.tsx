"use client";

import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  name: string;
  role: "user" | "admin";
  isPremium: boolean;
  activeProfile?: { id: string; name: string; avatarSeed: string } | null;
}

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthUser | null {
  return useContext(AuthContext);
}
