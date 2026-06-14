import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/report-card/$studentId")({ component: Page });

function gradeLetter(pct: number) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  if (pct >= 40) return "E";
  return "F";
}

function Page() {
  const { studentId } = useParams({ from: "/report-card/$studentId" });

  const { data } = useQuery({
    queryKey: ["report-card", studentId],
    queryFn: async () => {
      const [stu, res, gpa, att] = await Promise.all([
        supabase.from("students").select("name,grade,classes(name)").eq("id", studentId).maybeSingle(),
        supabase.from("results").select("marks,exams(title,max_marks,term,exam_date,subjects(name))").eq("student_id", studentId).order("created_at"),
        supabase.rpc("gpa_for_student", { _student_id: studentId }),
        supabase.from("attendance").select("status").eq("student_id", studentId),
      ]);
      const a = att.data ?? [];
      const present = a.filter((r: any) => r.status === "present" || r.status === "late").length;
      return {
        student: stu.data,
        results: res.data ?? [],
        gpa: Number(gpa.data ?? 0),
        attPct: a.length ? Math.round((present / a.length) * 100) : 0,
      };
    },
  });

  return (
    <div className="bg-page min-h-screen p-4 print:p-0 print:bg-white">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl print:rounded-none p-8 shadow-sm print:shadow-none">
        <div className="flex items-center justify-between print:hidden mb-4">
          <h1 className="text-lg font-semibold">Report card</h1>
          <button onClick={() => window.print()} className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium flex items-center gap-1">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        <header className="text-center border-b pb-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-lama-sky grid place-items-center font-bold">K</div>
            <div className="text-left">
              <div className="font-bold text-lg">KAALIK Private High School</div>
              <div className="text-xs text-muted-foreground">Academic Performance Report</div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div><div className="text-xs text-muted-foreground">Student</div><div className="font-semibold">{data?.student?.name ?? "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Class</div><div className="font-semibold">{(data?.student as any)?.classes?.name ?? data?.student?.grade ?? "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">GPA (4.0)</div><div className="font-semibold text-lama-sky text-xl">{(data?.gpa ?? 0).toFixed(2)}</div></div>
          <div><div className="text-xs text-muted-foreground">Attendance</div><div className="font-semibold text-xl">{data?.attPct ?? 0}%</div></div>
        </section>

        <section className="mt-6">
          <h2 className="font-semibold mb-2">Results</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground border-b">
              <tr><th className="py-2">Subject</th><th>Exam</th><th>Term</th><th>Date</th><th className="text-right">Marks</th><th className="text-right">%</th><th className="text-right">Grade</th></tr>
            </thead>
            <tbody>
              {(data?.results ?? []).map((r: any, i: number) => {
                const pct = r.exams?.max_marks ? Math.round((r.marks / r.exams.max_marks) * 100) : 0;
                return (
                  <tr key={i} className="border-b">
                    <td className="py-2">{r.exams?.subjects?.name ?? "—"}</td>
                    <td>{r.exams?.title}</td>
                    <td>{r.exams?.term}</td>
                    <td>{r.exams?.exam_date}</td>
                    <td className="text-right">{r.marks} / {r.exams?.max_marks}</td>
                    <td className="text-right">{pct}%</td>
                    <td className="text-right font-semibold">{gradeLetter(pct)}</td>
                  </tr>
                );
              })}
              {(data?.results ?? []).length === 0 && <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">No results recorded.</td></tr>}
            </tbody>
          </table>
        </section>

        <footer className="mt-8 grid grid-cols-2 gap-6 text-xs text-muted-foreground">
          <div className="border-t pt-2">Class Teacher signature</div>
          <div className="border-t pt-2">Principal signature</div>
        </footer>
      </div>
    </div>
  );
}