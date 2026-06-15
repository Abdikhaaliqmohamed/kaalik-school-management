import { createFileRoute, Link } from "@tanstack/react-router";
import { UserCard } from "@/components/UserCard";
import { CountChart } from "@/components/CountChart";
import { AttendanceChart } from "@/components/AttendanceChart";
import { Announcements } from "@/components/Announcements";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleGate } from "@/lib/use-role-gate";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function useCounts() {
  return useQuery({
    queryKey: ["dashboard", "counts"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 6);
      const [s, t, p, c, att] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("parents").select("id", { count: "exact", head: true }),
        supabase.from("classes").select("id", { count: "exact", head: true }),
        supabase.from("attendance").select("present").gte("date", since.toISOString().slice(0, 10)),
      ]);
      const total = att.data?.length ?? 0;
      const present = att.data?.filter((r) => r.present).length ?? 0;
      const pct = total ? Math.round((present / total) * 100) : 0;
      return {
        students: s.count ?? 0,
        teachers: t.count ?? 0,
        parents: p.count ?? 0,
        classes: c.count ?? 0,
        attendancePct: pct,
      };
    },
  });
}

function AdminPage() {
  const { allowed } = useRoleGate(["admin"]);
  const { data } = useCounts();
  const { data: exams = [] } = useQuery({
    queryKey: ["admin", "upcoming-exams"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("exams")
        .select("id,title,exam_date,term,subjects(name)")
        .gte("exam_date", today)
        .order("exam_date")
        .limit(5);
      return data ?? [];
    },
  });
  if (!allowed) return null;
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-gradient-to-r from-lama-sky-light via-white to-lama-purple-light border p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Academic Year 2026 / 2027</div>
          <h1 className="text-xl md:text-2xl font-semibold mt-0.5">KAALIK Private High School</h1>
          <p className="text-sm text-muted-foreground">Excellence Through Education · Administration Console</p>
        </div>
        <div className="flex gap-2 text-center">
          {[
            ["650", "Students"],
            ["42", "Teachers"],
            ["24", "Classes"],
            ["1", "Campus"],
          ].map(([n, l]) => (
            <div key={l} className="bg-white border rounded-xl px-4 py-2 min-w-[78px]">
              <div className="font-semibold">{n}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col xl:flex-row gap-4">
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <UserCard type="student" count={data?.students ?? 0} />
          <UserCard type="teacher" count={data?.teachers ?? 0} />
          <UserCard type="parent" count={data?.parents ?? 0} />
          <UserCard type="staff" count={data?.classes ?? 0} label="classes" />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3"><CountChart /></div>
          <div className="w-full lg:w-2/3"><AttendanceChart /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Attendance this week</h3>
              <span className="text-2xl font-bold text-lama-sky">{data?.attendancePct ?? 0}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Live from the attendance table.</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Academic performance</h3>
              <Link to="/list/results" className="text-xs text-lama-sky">View results →</Link>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per-student GPA & rankings on the 4.0 scale.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Quick links</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/list/students" className="px-3 py-1.5 rounded-full bg-lama-sky-light">Students</Link>
            <Link to="/list/teachers" className="px-3 py-1.5 rounded-full bg-lama-purple-light">Teachers</Link>
            <Link to="/list/parents" className="px-3 py-1.5 rounded-full bg-lama-yellow-light">Parents</Link>
            <Link to="/list/classes" className="px-3 py-1.5 rounded-full bg-lama-sky-light">Classes</Link>
            <Link to="/list/attendance" className="px-3 py-1.5 rounded-full bg-lama-yellow-light">Attendance</Link>
            <Link to="/list/exams" className="px-3 py-1.5 rounded-full bg-lama-sky-light">Exams</Link>
            <Link to="/list/results" className="px-3 py-1.5 rounded-full bg-lama-purple-light">Results</Link>
            <Link to="/list/announcements" className="px-3 py-1.5 rounded-full bg-lama-yellow-light">Announcements</Link>
          </div>
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Upcoming Exams</h3>
            <Link to="/list/exams" className="text-xs text-lama-sky">All →</Link>
          </div>
          <div className="flex flex-col gap-2">
            {exams.map((e: any) => (
              <div key={e.id} className="p-3 rounded-xl bg-lama-sky-light">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{e.title}</div>
                  <span className="text-[11px] bg-white/70 px-2 py-0.5 rounded-full">{e.exam_date}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{e.subjects?.name ?? ""} · {e.term ?? "Term"}</div>
              </div>
            ))}
            {exams.length === 0 && <p className="text-xs text-muted-foreground">No upcoming exams scheduled.</p>}
          </div>
        </div>
        <Announcements />
      </div>
      </div>
    </div>
  );
}
