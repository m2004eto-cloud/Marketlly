import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  authApi,
  type FrontendPermissions,
  type SessionUser,
} from "@marketly/core";

type AuthResult = { ok: boolean; error?: string; role?: string };

type AuthContextValue = {
  user: SessionUser | null;
  permissions: FrontendPermissions | null;
  loading: boolean;
  can: (key: keyof FrontendPermissions) => boolean;
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
    role: "customer" | "dealer";
    tradeLicense?: string;
    vatTrn?: string;
  }) => Promise<AuthResult>;
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
    // Refresh session when admin mutates accounts (permissions, ban, profile, etc.)
    return authApi.subscribeAuth(() => {
      setUser(authApi.getSessionSync());
    });
  }, []);

  const signIn = useCallback(async (input: { email: string; password: string }): Promise<AuthResult> => {
    const res = await authApi.login(input);
    if (res.ok) {
      setUser(res.data);
      return { ok: true, role: res.data.role };
    }
    return { ok: false, error: res.error };
  }, []);

  const signUp = useCallback(async (input: {
    email: string;
    password: string;
    name: string;
    role: "customer" | "dealer";
    tradeLicense?: string;
    vatTrn?: string;
  }): Promise<AuthResult> => {
    const res = await authApi.signup(input);
    if (res.ok) {
      setUser(res.data);
      return { ok: true, role: res.data.role };
    }
    return { ok: false, error: res.error };
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const can = useCallback(
    (key: keyof FrontendPermissions) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      const val = user.permissions[key];
      return typeof val === "boolean" ? val : Boolean(val);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      permissions: user?.permissions ?? null,
      loading,
      can,
      signIn,
      signUp,
      logout,
    }),
    [user, loading, can, signIn, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
