import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, GraduationCap, Calendar, Award, Users2 } from "lucide-react";

export const Route = createFileRoute("/school")({
  head: () => ({
    meta: [
      { title: "About KAALIK Private High School" },
      { name: "description", content: "KAALIK Private High School — Mogadishu. Academic year 2026/2027, principal, campus and contact information." },
    ],
  }),
  component: SchoolPage,
});

function SchoolPage() {
  return (
    <div className="min-h-screen bg-page">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-lama-sky grid place-items-center font-bold">K</div>
            <span className="font-semibold">KAALIK</span>
          </Link>
          <Link to="/sign-in" className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium">Sign in</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-lama-sky-light to-lama-purple-light p-8 border">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Academic Year 2026 / 2027</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">KAALIK Private High School</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A premium Somali private high school dedicated to academic excellence, character formation and lifelong service. Our motto: <span className="font-medium text-foreground">Knowledge · Discipline · Service</span>.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            { icon: GraduationCap, t: "650+ Students", d: "Forms 9–12" },
            { icon: Users2, t: "42 Teachers", d: "Qualified faculty" },
            { icon: Award, t: "24 Classes", d: "Across 4 grades" },
            { icon: Calendar, t: "Founded 2015", d: "11 years of excellence" },
            { icon: MapPin, t: "Mogadishu Campus", d: "Hodan District" },
            { icon: Mail, t: "info@kaalik.edu", d: "Admissions open" },
          ].map((s) => (
            <div key={s.t} className="bg-white rounded-2xl border p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-lama-yellow-light grid place-items-center">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">{s.t}</div>
                <div className="text-xs text-muted-foreground">{s.d}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold">Principal's Message</h2>
            <p className="text-sm text-muted-foreground mt-2">
              "At KAALIK we believe every student carries the potential to shape Somalia's future. Our staff and curriculum are designed to nurture critical thinking, integrity and service to community."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lama-purple grid place-items-center font-semibold">HN</div>
              <div>
                <div className="font-medium text-sm">Mr. Hassan Nur</div>
                <div className="text-xs text-muted-foreground">Principal</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold">Contact</h2>
            <ul className="mt-3 text-sm space-y-2">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> Hodan District, Mogadishu, Somalia</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> +252 61 000 0000</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> info@kaalik.edu</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}