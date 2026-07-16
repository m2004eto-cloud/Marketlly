import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type SessionUser, type UserRole } from "@marketly/core";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (input: { email: string; password: string; name?: string; role: UserRole }) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => authApi.getSessionSync());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    authApi.getSession().then((res) => {
      if (!alive) return;
      if (res.ok) setUser(res.data);
      setLoading(false);
    });
    return authApi.subscribeAuth(() => setUser(authApi.getSessionSync()));
  }, []);

  const login = useCallback(async (input: { email: string; password: string; name?: string; role: UserRole }) => {
    const res = await authApi.login(input);
    if (res.ok) {
      setUser(res.data);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
