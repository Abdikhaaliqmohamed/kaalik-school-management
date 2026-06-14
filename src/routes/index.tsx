import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { homeForRole } from "@/lib/use-role-gate";
export const Route = createFileRoute("/")({ component: Landing });
function Landing() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && user) nav({ to: homeForRole[role] as any, replace: true });
  }, [loading, user, role, nav]);
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-lama-sky-light via-white to-lama-purple-light p-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-lama-sky grid place-items-center text-2xl font-bold mb-6">K</div>
        <h1 className="text-4xl font-semibold tracking-tight">KAALIK Private High School</h1>
        <p className="mt-3 text-muted-foreground">A premium school administration, attendance and academic performance platform.</p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link to="/sign-in" className="px-5 py-2.5 rounded-xl bg-lama-sky font-medium">Sign in</Link>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-white border p-4"><div className="font-medium">Administration</div><div className="text-xs text-muted-foreground">Students, teachers, parents, classes.</div></div>
          <div className="rounded-xl bg-white border p-4"><div className="font-medium">Attendance</div><div className="text-xs text-muted-foreground">Live taking, history & analytics.</div></div>
          <div className="rounded-xl bg-white border p-4"><div className="font-medium">Performance</div><div className="text-xs text-muted-foreground">Exams, GPA & report cards.</div></div>
        </div>
      </div>
    </div>
  );
}
