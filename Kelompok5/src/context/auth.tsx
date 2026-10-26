import { createContext, useContext, useState, type ReactNode } from "react";
import { type UserRole, type User } from "@/mock/auth";

type AuthUser = Omit<User, "password">;

type AuthValue = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login: (u) => setUser(u),
        logout: () => setUser(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
