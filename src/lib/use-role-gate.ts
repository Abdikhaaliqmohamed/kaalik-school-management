import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./auth-context";
import type { Role } from "./data";

const homeForRole: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
};

/** Redirects away if current role is not in the allowed list. */
export function useRoleGate(allow: Role[]) {
  const { role, loading, user } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (loading || !user) return;
    if (!allow.includes(role)) nav({ to: homeForRole[role] as any, replace: true });
  }, [role, loading, user, allow, nav]);
  return { allowed: !loading && !!user && allow.includes(role), role, loading };
}

export { homeForRole };