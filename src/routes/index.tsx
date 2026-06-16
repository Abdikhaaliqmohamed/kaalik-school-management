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

  const portals = [
    { t: "Admin Portal", d: "Manage the entire school system", to: "/admin", color: "bg-[#c0392b]", bar: "bg-[#c0392b]" },
    { t: "Teacher Portal", d: "Lessons, attendance and grading", to: "/teacher", color: "bg-[#c79a1f]", bar: "bg-[#c79a1f]" },
    { t: "Student Portal", d: "Courses, results and assignments", to: "/student", color: "bg-[#2563eb]", bar: "bg-[#2563eb]" },
    { t: "Parent Portal", d: "Track student progress and updates", to: "/parent", color: "bg-[#2f9e44]", bar: "bg-[#2f9e44]" },
  ];
  const stats = [
    ["650", "Students"],
    ["42", "Teachers"],
    ["24", "Classes"],
    ["1", "Campus"],
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top brand bar */}
      <header className="bg-[#0f2a5f] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-white grid place-items-center shadow-md">
              <span className="text-[#0f2a5f] font-black text-lg">K</span>
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-extrabold tracking-wide text-lg truncate">KAALIK</div>
              <div className="text-[11px] text-white/70 truncate">School Management System</div>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
            <a href="#home" className="hidden sm:inline hover:text-[#f5c518]">Home</a>
            <Link to="/school" className="hidden sm:inline hover:text-[#f5c518]">About</Link>
            <a href="#portals" className="hover:text-[#f5c518]">Portals</a>
            <a href="#contact" className="hidden sm:inline hover:text-[#f5c518]">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative min-h-[78vh] flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,20,50,0.62), rgba(10,20,50,0.62)), url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-20 text-white w-full">
          <span className="inline-block bg-[#f5c518] text-[#0f2a5f] font-semibold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full">
            Modern Academic Platform
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-black leading-[1.05] max-w-4xl drop-shadow">
            Excellence in Education Through Technology
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl">
            KAALIK Private High School delivers a modern digital environment for administrators,
            teachers, students and parents — built around <strong>Knowledge · Discipline · Service</strong>.
          </p>
          <div className="mt-3 text-sm text-white/75">Academic Year 2026 / 2027</div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/sign-in"
              className="px-7 py-3 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold shadow-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/admin"
              className="px-7 py-3 rounded-lg bg-[#c0392b] hover:bg-[#a5311f] text-white font-semibold shadow-lg transition"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Academic Portals */}
      <section id="portals" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-[#0f2a5f]">Academic Portals</h2>
            <p className="mt-3 text-slate-600">Access specialized dashboards designed for every role.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((p) => (
              <Link
                key={p.t}
                to={p.to as any}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-slate-100"
              >
                <div className={`h-2 ${p.bar}`} />
                <div className="p-7">
                  <div className={`w-14 h-14 rounded-2xl ${p.color} grid place-items-center text-white font-black text-2xl shadow`}>
                    K
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-[#0f2a5f]">{p.t}</h3>
                  <p className="mt-2 text-slate-500 text-sm leading-relaxed">{p.d}</p>
                  <div className="mt-6 text-[#2563eb] font-semibold text-sm group-hover:translate-x-1 transition">
                    Open Dashboard →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-[#0f2a5f]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(([n, l]) => (
            <div
              key={l}
              className="bg-white/5 border border-white/10 rounded-2xl py-10 text-center backdrop-blur"
            >
              <div className="text-5xl md:text-6xl font-black text-[#f5c518]">{n}</div>
              <div className="mt-2 text-white/80 font-medium tracking-wide">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#0a1733] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white grid place-items-center">
                <span className="text-[#0f2a5f] font-black text-lg">K</span>
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-lg">KAALIK</div>
                <div className="text-xs text-white/60">School Management System</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              Building modern education environments with technology, collaboration and academic excellence.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li><a href="#home" className="hover:text-[#f5c518]">Home</a></li>
              <li><Link to="/school" className="hover:text-[#f5c518]">About</Link></li>
              <li><a href="#portals" className="hover:text-[#f5c518]">Dashboards</a></li>
              <li><a href="#contact" className="hover:text-[#f5c518]">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li>Mogadishu, Somalia</li>
              <li>info@kaalik.edu.so</li>
              <li>+252 61 0000000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 text-center text-xs text-white/60">
            © 2026 KAALIK Private High School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
