import { createContext, useContext, useState, ReactNode } from "react";
import type { Role } from "./data";

type Ctx = { role: Role; setRole: (r: Role) => void };
const RoleCtx = createContext<Ctx>({ role: "admin", setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>;
}
export const useRole = () => useContext(RoleCtx);
