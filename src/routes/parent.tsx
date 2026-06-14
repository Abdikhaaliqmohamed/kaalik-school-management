import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleGate } from "@/lib/use-role-gate";
import { useAuth } from "@/lib/auth-context";
import { Announcements } from "@/components/Announcements";

export const Route = createFileRoute("/parent")({ component: ParentPage });

function ParentPage() {
  const { allowed } = useRoleGate(["parent", "admin"]);
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = useQuery({
    queryKey: ["parent-dash", user?.id],
    queryFn: async () => {
      const me = await supabase.from("parents").select("id,name").eq("profile_id", user!.id).maybeSingle();
      const parentId = me.data?.id;
      if (!parentId) return { me: me.data, kids: [] };
      const kidsRes = await supabase.from("students").select("id,name,classes(name)").eq("parent_id", parentId);
      const kids = kidsRes.data ?? [];
      const enriched = await Promise.all(kids.map(async (k:any)=>{
        const [att, gpa, exams, results] = await Promise.all([
          supabase.from("attendance").select("status").eq("student_id", k.id),
          supabase.rpc("gpa_for_student", { _student_id: k.id }),
          supabase.from("exams").select("id,title,exam_date").gte("exam_date", today).order("exam_date").limit(3),
          supabase.from("results").select("marks,exams(title,max_marks)").eq("student_id", k.id).order("created_at",{ascending:false}).limit(3),
        ]);
        const rows = att.data ?? [];
        const present = rows.filter((r:any)=>r.status === "present" || r.status === "late").length;
        return { ...k, att: rows.length ? Math.round(present/rows.length*100) : 0, gpa: Number(gpa.data ?? 0), upcoming: exams.data ?? [], recent: results.data ?? [] };
      }));
      return { me: me.data, kids: enriched };
    },
    enabled: !!user && allowed,
  });

  if (!allowed) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5">
        <div className="text-xs text-muted-foreground">Hello</div>
        <div className="text-2xl font-bold">{data?.me?.name ?? "Parent"}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {(data?.kids ?? []).map((k:any)=>(
            <div key={k.id} className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{k.name}</div>
                  <div className="text-xs text-muted-foreground">Class {k.classes?.name ?? "—"}</div>
                </div>
                <Link to="/report-card/$studentId" params={{ studentId: k.id }} className="text-xs px-3 py-1.5 rounded-full bg-lama-sky-light">Report card</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl bg-lama-sky-light p-3"><div className="text-xs text-muted-foreground">GPA</div><div className="text-xl font-bold">{k.gpa.toFixed(2)}</div></div>
                <div className="rounded-xl bg-lama-yellow-light p-3"><div className="text-xs text-muted-foreground">Attendance</div><div className="text-xl font-bold">{k.att}%</div></div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs uppercase text-muted-foreground mb-1">Latest results</div>
                  {k.recent.length === 0 && <div className="text-xs text-muted-foreground">None yet.</div>}
                  {k.recent.map((r:any,i:number)=>(
                    <div key={i} className="flex justify-between py-0.5"><span>{r.exams?.title}</span><span className="font-medium">{r.marks}/{r.exams?.max_marks}</span></div>
                  ))}
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground mb-1">Upcoming exams</div>
                  {k.upcoming.length === 0 && <div className="text-xs text-muted-foreground">None scheduled.</div>}
                  {k.upcoming.map((e:any)=>(
                    <div key={e.id} className="flex justify-between py-0.5"><span>{e.title}</span><span className="text-xs text-muted-foreground">{e.exam_date}</span></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {(data?.kids ?? []).length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-sm text-muted-foreground">No children linked to your account yet. Please contact the school administration.</div>
          )}
        </div>
        <Announcements />
      </div>
    </div>
  );
}