import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AuthUser = { account: string; name: string };

type AuthCtx = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (account: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  isAuthenticated: false,
  login: () => ({ ok: false }),
  logout: () => {},
});

const KEY = "app.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }, [user]);

  const login: AuthCtx["login"] = (account, password) => {
    const a = account.trim();
    if (!a) return { ok: false, message: "请输入账号" };
    if (!password || password.length < 6) return { ok: false, message: "密码至少 6 位" };
    setUser({ account: a, name: a === "admin" ? "管理员" : a });
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <Ctx.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
