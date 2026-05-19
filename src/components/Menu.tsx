import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { roleLinks } from "@/lib/data";
import {
  Home, Users, GraduationCap, UserCog, BookOpen, Layers, CalendarDays,
  FileText, ClipboardList, BarChart3, CheckSquare, Megaphone, Mail, User, Settings, LogOut
} from "lucide-react";

const iconFor: Record<string, any> = {
  Home, Teachers: Users, Students: GraduationCap, Parents: UserCog,
  Subjects: BookOpen, Classes: Layers, Lessons: CalendarDays, Exams: FileText,
  Assignments: ClipboardList, Results: BarChart3, Attendance: CheckSquare,
  Events: CalendarDays, Messages: Mail, Announcements: Megaphone, Children: GraduationCap,
};

export function Menu() {
  const { role, setRole, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const links = roleLinks[role];

  return (
    <aside className="hidden md:flex md:flex-col w-[230px] shrink-0 bg-white border-r border-border px-3 py-4 gap-1 overflow-y-auto">
      <Link to="/admin" className="flex items-center gap-2 px-2 py-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-lama-sky grid place-items-center font-bold text-primary-foreground">K</div>
        <span className="font-semibold tracking-tight">KAALIK</span>
      </Link>

      <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 mb-1">Menu</div>
      <nav className="flex flex-col gap-0.5">
        {links.map((l) => {
          const Icon = iconFor[l.label] ?? Home;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              to={l.href}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors ${
                active ? "bg-lama-sky-light text-foreground font-medium" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 mt-4 mb-1">Other</div>
      <nav className="flex flex-col gap-0.5">
        <Link to="/profile" className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted">
          <User className="w-4 h-4" /> Profile
        </Link>
        <Link to="/settings" className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button
          onClick={async () => { await signOut(); nav({ to: "/sign-in" }); }}
          className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted text-left"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </nav>

      <div className="mt-auto p-2">
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">View as</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="mt-1 w-full text-sm bg-muted rounded-md px-2 py-1.5 border border-border"
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
      </div>
    </aside>
  );
}
