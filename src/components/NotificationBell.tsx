import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@tanstack/react-router";

export function NotificationBell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: items = [] } = useQuery({
    enabled: !!user,
    queryKey: ["notifications", user?.id],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data } = await supabase.from("notifications" as any).select("*").order("created_at", { ascending: false }).limit(20);
      return (data as any[]) ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("notif-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const unread = items.filter((i: any) => !i.read_at).length;

  const markAll = async () => {
    await supabase.from("notifications" as any).update({ read_at: new Date().toISOString() })
      .is("read_at", null).eq("user_id", user!.id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="w-8 h-8 grid place-items-center rounded-full bg-muted relative">
        <Bell className="w-4 h-4" />
        {unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] grid place-items-center">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-white border rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-medium text-sm">Notifications</span>
              {unread > 0 && <button onClick={markAll} className="text-xs text-primary hover:underline">Mark all read</button>}
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y">
              {items.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No notifications.</div>}
              {items.map((n: any) => (
                <Link key={n.id} to={n.link || "/"} onClick={() => setOpen(false)}
                  className={`block p-3 hover:bg-muted/60 ${!n.read_at ? "bg-lama-sky-light/40" : ""}`}>
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}