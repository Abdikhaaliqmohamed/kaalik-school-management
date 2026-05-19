import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/sign-in")({ component: SignIn });

function SignIn() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/admin" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/admin` }
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-lama-sky-light to-lama-purple-light p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-lama-sky grid place-items-center font-bold">K</div>
          <span className="font-semibold">KAALIK</span>
        </div>
        <h1 className="text-xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signin" ? "Welcome back." : "First account becomes the admin."}
        </p>
        {mode === "signup" && (
          <label className="block mt-4 text-sm">Full name
            <input required value={fullName} onChange={(e)=>setFullName(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-muted/40" />
          </label>
        )}
        <label className="block mt-3 text-sm">Email
          <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-muted/40" />
        </label>
        <label className="block mt-3 text-sm">Password
          <input required type="password" minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-muted/40" />
        </label>
        <button disabled={busy} className="mt-5 w-full py-2.5 rounded-lg bg-lama-sky font-medium disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button type="button" onClick={()=>setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "Need an account? Sign up" : "Already have one? Sign in"}
        </button>
      </form>
    </div>
  );
}
