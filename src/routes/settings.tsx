import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, Bell, Globe, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const PREF_KEY = "kaalik.prefs.v1";
type Prefs = { theme: "light" | "dark"; language: "en" | "so" | "ar"; emailNotif: boolean; messageNotif: boolean };
const DEFAULT: Prefs = { theme: "light", language: "en", emailNotif: true, messageNotif: true };

export const Route = createFileRoute("/settings")({ component: Page });

function Page() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    try { const raw = localStorage.getItem(PREF_KEY); if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) }); } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    document.documentElement.classList.toggle("dark", prefs.theme === "dark");
    document.documentElement.lang = prefs.language;
  }, [prefs]);

  const changePassword = async () => {
    if (pwd.length < 6) return toast.error("Password must be at least 6 characters");
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) toast.error(error.message); else { toast.success("Password updated"); setPwd(""); }
  };

  return (
    <div className="bg-white rounded-2xl p-6 max-w-3xl space-y-8">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Section icon={<Sun className="w-4 h-4" />} title="Appearance" desc="Choose how KAALIK looks on this device.">
        <div className="flex gap-2">
          <Toggle active={prefs.theme === "light"} onClick={() => setPrefs(p => ({ ...p, theme: "light" }))}>
            <Sun className="w-4 h-4" /> Light
          </Toggle>
          <Toggle active={prefs.theme === "dark"} onClick={() => setPrefs(p => ({ ...p, theme: "dark" }))}>
            <Moon className="w-4 h-4" /> Dark
          </Toggle>
        </div>
      </Section>

      <Section icon={<Globe className="w-4 h-4" />} title="Language" desc="Interface language.">
        <select value={prefs.language} onChange={(e) => setPrefs(p => ({ ...p, language: e.target.value as any }))}
          className="px-3 py-2 rounded-md border text-sm bg-white">
          <option value="en">English</option>
          <option value="so">Soomaali</option>
          <option value="ar">العربية</option>
        </select>
      </Section>

      <Section icon={<Bell className="w-4 h-4" />} title="Notifications" desc="Control what you get notified about.">
        <Check label="Email me important updates" checked={prefs.emailNotif} onChange={(v) => setPrefs(p => ({ ...p, emailNotif: v }))} />
        <Check label="Notify me when I receive a new message" checked={prefs.messageNotif} onChange={(v) => setPrefs(p => ({ ...p, messageNotif: v }))} />
      </Section>

      <Section icon={<Lock className="w-4 h-4" />} title="Account" desc={user?.email ?? "Not signed in"}>
        <div className="flex gap-2 items-end max-w-md">
          <label className="flex-1">
            <span className="block text-xs text-muted-foreground mb-1">New password</span>
            <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm" placeholder="Min 6 characters" />
          </label>
          <button onClick={changePassword} className="px-4 py-2 rounded-md bg-lama-sky text-sm font-medium">Update</button>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, desc, children }: any) {
  return (
    <section className="border-t pt-6 first:border-0 first:pt-0">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h2 className="font-semibold flex items-center gap-2">{icon}{title}</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">{desc}</p>
        </div>
        <div className="space-y-2">{children}</div>
      </div>
    </section>
  );
}
function Toggle({ active, onClick, children }: any) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 border ${active ? "bg-lama-sky border-lama-sky" : "bg-white"}`}>{children}</button>;
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}
