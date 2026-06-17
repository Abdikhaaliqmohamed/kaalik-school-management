import { Search, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "./NotificationBell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { role, user } = useAuth();
  const name = (user?.user_metadata as any)?.full_name || user?.email?.split("@")[0] || "User";
  const { data: unreadMsgs = 0 } = useQuery({
    enabled: !!user,
    queryKey: ["unread-messages", user?.id],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { count } = await supabase.from("messages" as any).select("id", { count: "exact", head: true })
        .eq("recipient_id", user!.id).is("read_at", null);
      return count ?? 0;
    },
  });
  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-4">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm w-[280px] max-w-[40vw]">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input placeholder="Search..." className="bg-transparent outline-none flex-1 text-sm" />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Link to="/list/messages" className="w-8 h-8 grid place-items-center rounded-full bg-muted relative" aria-label="Messages">
          <MessageCircle className="w-4 h-4" />
          {unreadMsgs > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] grid place-items-center">{unreadMsgs}</span>}
        </Link>
        <NotificationBell />
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-[11px] text-muted-foreground capitalize">{role}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-lama-purple grid place-items-center font-semibold text-sm">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
