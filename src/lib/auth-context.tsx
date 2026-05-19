import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Role } from "./data";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  setRole: (r: Role) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, session: null, role: "admin", loading: true,
  setRole: () => {}, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) {
        // fetch primary role (defer to avoid deadlock with the listener)
        setTimeout(async () => {
          const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id).limit(1).maybeSingle();
          if (data?.role) setRole(data.role as Role);
        }, 0);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setUser(data.session?.user ?? null); setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, session, role, loading, setRole, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);