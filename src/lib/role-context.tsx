// Back-compat shim: role state now lives in AuthProvider.
import { ReactNode } from "react";
import { useAuth } from "./auth-context";
export function RoleProvider({ children }: { children: ReactNode }) { return <>{children}</>; }
export const useRole = () => {
  const { role, setRole } = useAuth();
  return { role, setRole };
};
