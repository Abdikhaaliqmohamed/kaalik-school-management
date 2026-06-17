import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: Page });

function Page() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    enabled: !!user,
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone((profile as any).phone ?? "");
      setPhotoUrl((profile as any).photo_url ?? "");
    }
  }, [profile]);

  const onUpload = async (file: File) => {
    if (!user) return;
    const path = `avatars/${user.id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    toast.success("Photo uploaded — remember to save.");
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ full_name: fullName, phone, photo_url: photoUrl } as any)
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  if (!user) return <div className="p-6">Please sign in.</div>;

  return (
    <div className="bg-white rounded-2xl p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">My Profile</h1>
      <p className="text-xs text-muted-foreground mb-6 capitalize">Signed in as {role}</p>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || user.email || "U")}`}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover bg-muted"
        />
        <label className="text-sm px-3 py-1.5 rounded-full bg-muted cursor-pointer hover:bg-accent">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        </label>
      </div>

      <div className="grid gap-4">
        <Field label="Full name"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" /></Field>
        <Field label="Email"><input value={user.email ?? ""} disabled className="input bg-muted" /></Field>
        <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" /></Field>
        <Field label="Role"><input value={role} disabled className="input bg-muted capitalize" /></Field>
      </div>

      <button onClick={save} disabled={saving} className="mt-6 px-4 py-2 rounded-md bg-lama-sky font-medium text-sm">
        {saving ? "Saving…" : "Save changes"}
      </button>

      <style>{`.input{width:100%;padding:.5rem .75rem;border:1px solid hsl(var(--border));border-radius:.5rem;font-size:.875rem;background:white}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs text-muted-foreground mb-1">{label}</span>{children}</label>;
}
