import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Send, Inbox, Mail, Trash2 } from "lucide-react";

export const Route = createFileRoute("/list/messages")({ component: Page });

function Page() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: msgs = [] } = useQuery({
    enabled: !!user,
    queryKey: ["messages", tab, user?.id],
    queryFn: async () => {
      const col = tab === "inbox" ? "recipient_id" : "sender_id";
      const { data, error } = await supabase.from("messages" as any)
        .select("id, subject, body, read_at, created_at, sender_id, recipient_id")
        .eq(col, user!.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const ids = Array.from(new Set(msgs.flatMap((m: any) => [m.sender_id, m.recipient_id])));
  const { data: people = {} } = useQuery({
    enabled: ids.length > 0,
    queryKey: ["msg-people", ids],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      return Object.fromEntries((data ?? []).map((p: any) => [p.id, p]));
    },
  });

  const markRead = async (id: string) => {
    await supabase.from("messages" as any).update({ read_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["messages"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  const del = async (id: string) => {
    const { error } = await supabase.from("messages" as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["messages"] }); }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("inbox")} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${tab === "inbox" ? "bg-lama-sky" : "bg-muted"}`}><Inbox className="w-4 h-4" /> Inbox</button>
          <button onClick={() => setTab("sent")} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${tab === "sent" ? "bg-lama-sky" : "bg-muted"}`}><Send className="w-4 h-4" /> Sent</button>
          <button onClick={() => setComposeOpen(true)} className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Compose</button>
        </div>
      </div>

      <div className="divide-y">
        {msgs.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No messages.</div>}
        {msgs.map((m: any) => {
          const other = people[tab === "inbox" ? m.sender_id : m.recipient_id];
          const unread = tab === "inbox" && !m.read_at;
          return (
            <div key={m.id} className={`py-3 px-2 flex gap-3 items-start ${unread ? "bg-lama-sky-light/40" : ""}`}>
              <Mail className={`w-4 h-4 mt-1 ${unread ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{other?.full_name ?? other?.email ?? "Unknown"}</span>
                  <span className="text-[11px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                {m.subject && <div className="text-sm">{m.subject}</div>}
                <div className="text-xs text-muted-foreground whitespace-pre-wrap mt-0.5">{m.body}</div>
              </div>
              <div className="flex flex-col gap-1">
                {unread && <button onClick={() => markRead(m.id)} className="text-[11px] text-primary hover:underline">Mark read</button>}
                <button onClick={() => del(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {composeOpen && <Compose onClose={() => setComposeOpen(false)} senderRole={role} />}
    </div>
  );
}

function Compose({ onClose, senderRole }: { onClose: () => void; senderRole: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");

  // Students can message any teacher/admin; teachers can message anyone; admin/parent can message anyone.
  const allowedRoles = senderRole === "student" ? ["teacher", "admin"]
    : senderRole === "parent" ? ["teacher", "admin"]
    : ["admin", "teacher", "student", "parent"];

  const { data: people = [] } = useQuery({
    queryKey: ["compose-people", allowedRoles, search],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("role", allowedRoles as any);
      const ids = (roles ?? []).map((r: any) => r.user_id).filter((id: string) => id !== user?.id);
      if (ids.length === 0) return [];
      let q = supabase.from("profiles").select("id, full_name, email").in("id", ids).order("full_name").limit(50);
      if (search.trim()) q = q.ilike("full_name", `%${search.trim()}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  const send = async () => {
    if (!recipientId || !body.trim()) return toast.error("Recipient and message are required");
    const { error } = await supabase.from("messages" as any).insert({
      sender_id: user!.id, recipient_id: recipientId, subject: subject || null, body,
    });
    if (error) return toast.error(error.message);
    toast.success("Message sent");
    qc.invalidateQueries({ queryKey: ["messages"] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">New message</h3>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name…"
          className="w-full px-3 py-2 border rounded-md text-sm" />
        <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
          <option value="">— Select recipient —</option>
          {people.map((p: any) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
        </select>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)"
          className="w-full px-3 py-2 border rounded-md text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message…" rows={5}
          className="w-full px-3 py-2 border rounded-md text-sm" />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm bg-muted">Cancel</button>
          <button onClick={send} className="px-3 py-1.5 rounded-md text-sm bg-lama-sky font-medium">Send</button>
        </div>
      </div>
    </div>
  );
}
