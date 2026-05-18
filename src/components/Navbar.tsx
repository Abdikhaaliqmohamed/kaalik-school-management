import { Search, MessageCircle, Bell } from "lucide-react";
import { useRole } from "@/lib/role-context";

export function Navbar() {
  const { role } = useRole();
  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-4">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm w-[280px] max-w-[40vw]">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input placeholder="Search..." className="bg-transparent outline-none flex-1 text-sm" />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button className="w-8 h-8 grid place-items-center rounded-full bg-muted relative">
          <MessageCircle className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 grid place-items-center rounded-full bg-muted relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] grid place-items-center">3</span>
        </button>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-medium capitalize">{role} User</span>
          <span className="text-[11px] text-muted-foreground capitalize">{role}</span>
        </div>
        <img src="https://i.pravatar.cc/40?img=12" className="w-9 h-9 rounded-full object-cover" alt="" />
      </div>
    </header>
  );
}
