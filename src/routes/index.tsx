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
    <div className="min-h-screen bg-gradient-to-br from-lama-sky-light via-white to-lama-purple-light">
      <header className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-lama-sky grid place-items-center text-xl font-bold shadow-sm">K</div>
          <div className="leading-tight">
            <div className="font-semibold">KAALIK Private High School</div>
            <div className="text-[11px] text-muted-foreground">Academic Year 2026 / 2027</div>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/school" className="text-muted-foreground hover:text-foreground">About</Link>
          <Link to="/sign-in" className="px-4 py-2 rounded-xl bg-foreground text-background font-medium">Sign in</Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-10 pb-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider bg-white/70 border rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lama-sky" /> Premium Private High School
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Excellence Through Education.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg">
            KAALIK is a modern administration, attendance and academic performance platform built for Somali private high schools — empowering admins, teachers, students and parents from one place.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link to="/sign-in" className="px-5 py-2.5 rounded-xl bg-lama-sky font-medium">Enter the Portal</Link>
            <Link to="/school" className="px-5 py-2.5 rounded-xl bg-white border font-medium">About the School</Link>
          </div>
          <dl className="mt-10 grid grid-cols-4 gap-3 text-center">
            {[
              ["650+", "Students"],
              ["42", "Teachers"],
              ["24", "Classes"],
              ["1", "Campus"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white border p-3">
                <div className="text-2xl font-semibold">{n}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</div>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-tr from-lama-sky/40 to-lama-purple/40 blur-3xl rounded-full" />
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border bg-white">
            <img
              alt="KAALIK classroom"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=70"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Our Motto</div>
                <div className="font-semibold text-sm">Knowledge · Discipline · Service</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-lama-yellow grid place-items-center font-bold">K</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-4">
        {[
          { t: "School Administration", d: "Students, teachers, parents, classes and subjects — managed from one secure dashboard." },
          { t: "Attendance Management", d: "Teachers take live attendance; students and parents track history in real time." },
          { t: "Academic Performance", d: "Exams, grade entry, GPA on a 4.0 scale and printable report cards." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl bg-white border p-5">
            <div className="font-semibold">{c.t}</div>
            <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© 2026 KAALIK Private High School. All rights reserved.</span>
          <span>Mogadishu, Somalia · info@kaalik.edu</span>
        </div>
      </footer>
    </div>
  );
}
