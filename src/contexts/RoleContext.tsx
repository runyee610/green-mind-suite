import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "gov" | "ent";

type RoleCtx = {
  role: Role;
  setRole: (r: Role) => void;
};

const Ctx = createContext<RoleCtx>({ role: "gov", setRole: () => {} });

const KEY = "app.role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window === "undefined") return "gov";
    return (localStorage.getItem(KEY) as Role) || "gov";
  });
  useEffect(() => {
    localStorage.setItem(KEY, role);
  }, [role]);
  return <Ctx.Provider value={{ role, setRole: setRoleState }}>{children}</Ctx.Provider>;
}

export const useRole = () => useContext(Ctx);
