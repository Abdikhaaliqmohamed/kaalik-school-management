import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleGate } from "@/lib/use-role-gate";
import { useAuth } from "@/lib/auth-context";
import { Announcements } from "@/components/Announcements";
import { GraduationCap, CheckSquare, FileText, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/student")({ component: StudentPage });

function StudentPage() {
  const { allowed } = useRoleGate(["student", "admin"]);
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = useQuery({
    queryKey: ["student-dash", user?.id],
    queryFn: async () => {
      const me = await supabase.from("students").select("id,name,classes(name)").eq("profile_id", user!.id).maybeSingle();
      const studentId = me.data?.id;
      if (!studentId) return { me: me.data, att: 0, gpa: 0, upcoming: [], recent: [] };
      const [att, gpa, exams, results] = await Promise.all([
        supabase.from("attendance").select("status").eq("student_id", studentId),
        supabase.rpc("gpa_for_student", { _student_id: studentId }),
        supabase.from("exams").select("id,title,exam_date,subjects(name)").gte("exam_date", today).order("exam_date").limit(5),
        supabase.from("results").select("marks,exams(title,max_marks,exam_date,subjects(name))").eq("student_id", studentId).order("created_at",{ascending:false}).limit(5),
      ]);
      const rows = att.data ?? [];
      const present = rows.filter((r:any)=>r.status === "present" || r.status === "late").length;
      const pct = rows.length ? Math.round((present/rows.length)*100) : 0;
      return { me: me.data, att: pct, gpa: Number(gpa.data ?? 0), upcoming: exams.data ?? [], recent: results.data ?? [] };
    },
    enabled: !!user && allowed,
  });

  if (!allowed) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5">
        <div className="text-xs text-muted-foreground">Welcome back</div>
        <div className="text-2xl font-bold">{data?.me?.name ?? "Student"}</div>
        <div className="text-xs text-muted-foreground">Class {(data?.me as any)?.classes?.name ?? "—"}</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={TrendingUp} label="GPA" value={(data?.gpa ?? 0).toFixed(2)} tint="bg-lama-sky-light" />
        <Stat icon={CheckSquare} label="Attendance" value={`${data?.att ?? 0}%`} tint="bg-lama-yellow-light" />
        <Stat icon={FileText} label="Upcoming exams" value={data?.upcoming.length ?? 0} tint="bg-lama-purple-light" />
        <Stat icon={GraduationCap} label="Latest results" value={data?.recent.length ?? 0} tint="bg-lama-sky-light" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Latest results</h3>
            <Link to="/list/results" className="text-xs text-lama-sky">View all</Link>
          </div>
          <div className="divide-y">
            {(data?.recent ?? []).map((r:any,i:number)=>{
              const pct = r.exams?.max_marks ? Math.round((r.marks/r.exams.max_marks)*100) : 0;
              return (
                <div key={i} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{r.exams?.title}</div>
                    <div className="text-xs text-muted-foreground">{r.exams?.subjects?.name ?? ""} · {r.exams?.exam_date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{r.marks} / {r.exams?.max_marks}</div>
                    <div className="text-xs text-muted-foreground">{pct}%</div>
                  </div>
                </div>
              );
            })}
            {(data?.recent ?? []).length === 0 && <p className="text-xs text-muted-foreground py-2">No results yet.</p>}
          </div>

          <h3 className="font-semibold mt-6 mb-3">Upcoming exams</h3>
          <div className="divide-y">
            {(data?.upcoming ?? []).map((e:any)=>(
              <div key={e.id} className="py-2 flex items-center justify-between text-sm">
                <div><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.subjects?.name ?? ""}</div></div>
                <span className="text-xs text-muted-foreground">{e.exam_date}</span>
              </div>
            ))}
            {(data?.upcoming ?? []).length === 0 && <p className="text-xs text-muted-foreground py-2">Nothing scheduled.</p>}
          </div>
        </div>
        <Announcements />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tint }: any) {
  return (
    <div className={`${tint} rounded-2xl p-4`}>
      <Icon className="w-5 h-5 opacity-70" />
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}