import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/list/results")({ component: Page });

function Page() {
  const { role, loading } = useAuth();
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (role === "teacher" || role === "admin") return <StaffResults />;
  if (role === "student") return <StudentResults />;
  if (role === "parent") return <ParentResults />;
  return null;
}

/* Staff: pick exam → enter marks for each student in that exam's class */
function StaffResults() {
  const qc = useQueryClient();
  const [examId, setExamId] = useState<string>("");
  const [marks, setMarks] = useState<Record<string, string>>({});

  const { data: exams = [] } = useQuery({
    queryKey: ["exams-opt"],
    queryFn: async () => (await supabase.from("exams").select("id,title,max_marks,class_id,classes(name)").order("exam_date", { ascending: false })).data ?? [],
  });
  const exam = exams.find((e: any) => e.id === examId) as any;

  const { data: roster = [] } = useQuery({
    queryKey: ["res-roster", examId],
    queryFn: async () => {
      if (!exam) return [];
      const [stu, res] = await Promise.all([
        supabase.from("students").select("id,name").eq("class_id", exam.class_id).order("name"),
        supabase.from("results").select("student_id,marks").eq("exam_id", examId),
      ]);
      const existing: Record<string, string> = {};
      (res.data ?? []).forEach((r: any) => { existing[r.student_id] = String(r.marks); });
      setMarks(existing);
      return stu.data ?? [];
    },
    enabled: !!exam,
  });

  const save = async () => {
    if (!exam) return;
    const rows = Object.entries(marks)
      .filter(([_, v]) => v !== "" && !isNaN(Number(v)))
      .map(([student_id, v]) => ({ exam_id: examId, student_id, marks: Number(v) }));
    if (rows.length === 0) return toast.error("Nothing to save");
    const { error } = await supabase.from("results").upsert(rows, { onConflict: "exam_id,student_id" });
    if (error) return toast.error(error.message);
    toast.success(`Saved ${rows.length} marks`);
    qc.invalidateQueries({ queryKey: ["res-roster"] });
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-semibold mr-auto">Enter results</h2>
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className="text-sm bg-muted rounded-md px-3 py-1.5 border border-border">
          <option value="">Select exam…</option>
          {exams.map((e: any) => <option key={e.id} value={e.id}>{e.title} · {e.classes?.name ?? "—"}</option>)}
        </select>
        <button onClick={save} disabled={!exam} className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium disabled:opacity-40">Save marks</button>
      </div>
      {!exam && <p className="text-sm text-muted-foreground mt-6 text-center">Select an exam to begin.</p>}
      {exam && roster.length === 0 && <p className="text-sm text-muted-foreground mt-6 text-center">No students in this class.</p>}

      <div className="mt-4 divide-y">
        {roster.map((s: any) => (
          <div key={s.id} className="py-2 flex items-center gap-3">
            <div className="flex-1 text-sm font-medium">{s.name}</div>
            <input type="number" min={0} max={exam?.max_marks ?? 100} value={marks[s.id] ?? ""}
              onChange={(e) => setMarks((m) => ({ ...m, [s.id]: e.target.value }))}
              className="w-24 bg-muted rounded px-2 py-1 text-sm text-right" placeholder="—" />
            <span className="text-xs text-muted-foreground">/ {exam?.max_marks}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentResults() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["my-results", user?.id],
    queryFn: async () => {
      const me = await supabase.from("students").select("id,name").eq("profile_id", user!.id).maybeSingle();
      if (!me.data) return { rows: [], gpa: 0, id: null, name: "" };
      const [res, gpa] = await Promise.all([
        supabase.from("results").select("marks,comment,exams(title,max_marks,exam_date,term,subjects(name))").eq("student_id", me.data.id).order("created_at",{ascending:false}),
        supabase.rpc("gpa_for_student", { _student_id: me.data.id }),
      ]);
      return { rows: res.data ?? [], gpa: Number(gpa.data ?? 0), id: me.data.id, name: me.data.name };
    },
  });
  return <ResultsView title={`My results${data?.name ? ` · ${data.name}` : ""}`} gpa={data?.gpa ?? 0} rows={data?.rows ?? []} reportCardId={data?.id ?? null} />;
}

function ParentResults() {
  const { user } = useAuth();
  const { data: kids = [] } = useQuery({
    queryKey: ["my-kids-res", user?.id],
    queryFn: async () => {
      const me = await supabase.from("parents").select("id").eq("profile_id", user!.id).maybeSingle();
      if (!me.data) return [];
      return (await supabase.from("students").select("id,name").eq("parent_id", me.data.id)).data ?? [];
    },
  });
  const [kidId, setKidId] = useState<string>("");
  const currentId = kidId || (kids[0] as any)?.id;
  const { data } = useQuery({
    queryKey: ["kid-results", currentId],
    queryFn: async () => {
      if (!currentId) return { rows: [], gpa: 0 };
      const [res, gpa] = await Promise.all([
        supabase.from("results").select("marks,comment,exams(title,max_marks,exam_date,term,subjects(name))").eq("student_id", currentId).order("created_at",{ascending:false}),
        supabase.rpc("gpa_for_student", { _student_id: currentId }),
      ]);
      return { rows: res.data ?? [], gpa: Number(gpa.data ?? 0) };
    },
    enabled: !!currentId,
  });
  return (
    <div className="flex flex-col gap-3">
      {kids.length > 1 && (
        <select value={currentId} onChange={(e) => setKidId(e.target.value)} className="self-start text-sm bg-white rounded-md px-3 py-1.5 border border-border">
          {kids.map((k: any) => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
      )}
      <ResultsView title="Child results" gpa={data?.gpa ?? 0} rows={data?.rows ?? []} reportCardId={currentId ?? null} />
    </div>
  );
}

function ResultsView({ title, gpa, rows, reportCardId }: { title: string; gpa: number; rows: any[]; reportCardId: string | null }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="text-right"><div className="text-xs text-muted-foreground">GPA</div><div className="text-2xl font-bold text-lama-sky">{gpa.toFixed(2)}</div></div>
          {reportCardId && (
            <Link to="/report-card/$studentId" params={{ studentId: reportCardId }} className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium">Report card</Link>
          )}
        </div>
      </div>
      {rows.length === 0 && <p className="text-sm text-muted-foreground mt-6">No results yet.</p>}
      <table className="w-full mt-4 text-sm">
        <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Exam</th><th>Subject</th><th>Term</th><th>Date</th><th className="text-right">Marks</th><th className="text-right">%</th></tr></thead>
        <tbody>
          {rows.map((r: any, i: number) => {
            const pct = r.exams?.max_marks ? Math.round((r.marks / r.exams.max_marks) * 100) : 0;
            return (
              <tr key={i} className="border-t">
                <td className="py-2 font-medium">{r.exams?.title}</td>
                <td>{r.exams?.subjects?.name ?? "—"}</td>
                <td>{r.exams?.term}</td>
                <td>{r.exams?.exam_date}</td>
                <td className="text-right">{r.marks} / {r.exams?.max_marks}</td>
                <td className="text-right">{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}