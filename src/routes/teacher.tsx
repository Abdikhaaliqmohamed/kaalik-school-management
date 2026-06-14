import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleGate } from "@/lib/use-role-gate";
import { Announcements } from "@/components/Announcements";
import { CheckSquare, FileText, BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/teacher")({ component: TeacherPage });

function TeacherPage() {
  const { allowed } = useRoleGate(["teacher", "admin"]);
  const today = new Date().toISOString().slice(0, 10);

  const { data: stats } = useQuery({
    queryKey: ["teacher-stats", today],
    queryFn: async () => {
      const [classes, students, exams, todayAtt] = await Promise.all([
        supabase.from("classes").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("exams").select("id,title,exam_date,classes(name)").gte("exam_date", today).order("exam_date").limit(5),
        supabase.from("attendance").select("id", { count: "exact", head: true }).eq("date", today),
      ]);
      return {
        classes: classes.count ?? 0,
        students: students.count ?? 0,
        examsList: exams.data ?? [],
        todayAttendance: todayAtt.count ?? 0,
      };
    },
    enabled: allowed,
  });

  if (!allowed) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="My students" value={stats?.students ?? 0} tint="bg-lama-sky-light" />
        <StatCard icon={BookOpen} label="Classes" value={stats?.classes ?? 0} tint="bg-lama-purple-light" />
        <StatCard icon={CheckSquare} label="Today's marks" value={stats?.todayAttendance ?? 0} tint="bg-lama-yellow-light" />
        <StatCard icon={FileText} label="Upcoming exams" value={stats?.examsList.length ?? 0} tint="bg-lama-sky-light" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Quick actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/list/attendance" className="p-4 rounded-xl bg-lama-yellow-light hover:bg-lama-yellow transition">
              <div className="font-semibold flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Take attendance</div>
              <p className="text-xs text-muted-foreground mt-1">Mark present, absent or late per class.</p>
            </Link>
            <Link to="/list/results" className="p-4 rounded-xl bg-lama-sky-light hover:bg-lama-sky transition">
              <div className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4"/> Enter grades</div>
              <p className="text-xs text-muted-foreground mt-1">Record exam marks for your students.</p>
            </Link>
            <Link to="/list/exams" className="p-4 rounded-xl bg-lama-purple-light hover:bg-lama-purple transition">
              <div className="font-semibold">Schedule an exam</div>
              <p className="text-xs text-muted-foreground mt-1">Add an exam with date, class and max marks.</p>
            </Link>
            <Link to="/list/students" className="p-4 rounded-xl bg-muted hover:bg-border transition">
              <div className="font-semibold">My students</div>
              <p className="text-xs text-muted-foreground mt-1">Browse student roster.</p>
            </Link>
          </div>

          <h3 className="font-semibold mt-6 mb-3">Upcoming exams</h3>
          <div className="divide-y">
            {(stats?.examsList ?? []).map((e: any) => (
              <div key={e.id} className="py-2 flex items-center justify-between text-sm">
                <div><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.classes?.name ?? "—"}</div></div>
                <span className="text-xs text-muted-foreground">{e.exam_date}</span>
              </div>
            ))}
            {(stats?.examsList ?? []).length === 0 && <p className="text-xs text-muted-foreground py-2">No upcoming exams.</p>}
          </div>
        </div>
        <Announcements />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: any) {
  return (
    <div className={`${tint} rounded-2xl p-4`}>
      <Icon className="w-5 h-5 opacity-70" />
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}