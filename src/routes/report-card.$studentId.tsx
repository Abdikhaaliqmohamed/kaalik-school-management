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
        supabase.from("students").select("name,grade,photo_url,classes(name)").eq("id", studentId).maybeSingle(),
        supabase.from("results").select("marks,exams(title,max_marks,term,exam_date,subjects(name))").eq("student_id", studentId).order("created_at"),
        supabase.rpc("gpa_for_student", { _student_id: studentId }),
        supabase.from("attendance").select("status").eq("student_id", studentId),
      ]);
      // Compute rank: count of students with strictly higher GPA + 1
      const peers = await supabase.from("students").select("id");
      let rank = 1, cohort = peers.data?.length ?? 0;
      if (peers.data && gpa.data != null) {
        const myGpa = Number(gpa.data);
        const others = await Promise.all(
          peers.data.filter((p) => p.id !== studentId).map((p) =>
            supabase.rpc("gpa_for_student", { _student_id: p.id }).then((r) => Number(r.data ?? 0))
          )
        );
        rank = 1 + others.filter((g) => g > myGpa).length;
      }
      const a = att.data ?? [];
      const present = a.filter((r: any) => r.status === "present" || r.status === "late").length;
      return {
        student: stu.data,
        results: res.data ?? [],
        gpa: Number(gpa.data ?? 0),
        attPct: a.length ? Math.round((present / a.length) * 100) : 0,
        rank, cohort,
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

        <header className="border-b pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-lama-sky grid place-items-center font-bold text-2xl">K</div>
            <div>
              <div className="font-bold text-lg leading-tight">KAALIK Private High School</div>
              <div className="text-xs text-muted-foreground">Knowledge · Discipline · Service</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Academic Year 2026 / 2027 · Mogadishu, Somalia</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Official Report Card</div>
            <div className="text-xs text-muted-foreground">Issued {new Date().toLocaleDateString()}</div>
          </div>
        </header>

        <section className="mt-6 flex gap-5 items-start">
          <div className="w-24 h-28 rounded-xl border bg-muted overflow-hidden grid place-items-center text-2xl font-bold text-muted-foreground shrink-0">
            {(data?.student as any)?.photo_url
              ? <img src={(data?.student as any).photo_url} alt={(data?.student as any)?.name ?? ""} className="w-full h-full object-cover" />
              : ((data?.student as any)?.name?.charAt(0) ?? "?")}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm flex-1">
            <div><div className="text-xs text-muted-foreground">Student Name</div><div className="font-semibold">{(data?.student as any)?.name ?? "—"}</div></div>
            <div><div className="text-xs text-muted-foreground">Class</div><div className="font-semibold">{(data?.student as any)?.classes?.name ?? (data?.student as any)?.grade ?? "—"}</div></div>
            <div><div className="text-xs text-muted-foreground">GPA (4.0)</div><div className="font-semibold text-lama-sky text-xl">{(data?.gpa ?? 0).toFixed(2)}</div></div>
            <div><div className="text-xs text-muted-foreground">Class Rank</div><div className="font-semibold text-xl">{data?.rank ?? "—"} <span className="text-xs text-muted-foreground font-normal">/ {data?.cohort ?? "—"}</span></div></div>
            <div className="col-span-2"><div className="text-xs text-muted-foreground">Attendance</div><div className="font-semibold text-xl">{data?.attPct ?? 0}%</div></div>
          </div>
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

        <footer className="mt-10 grid grid-cols-2 gap-10 text-xs">
          <div>
            <div className="h-10 border-b border-dashed" />
            <div className="mt-1 text-muted-foreground">Class Teacher</div>
            <div className="font-medium text-foreground">Ms. Maryan Ismail</div>
          </div>
          <div>
            <div className="h-10 border-b border-dashed" />
            <div className="mt-1 text-muted-foreground">Principal</div>
            <div className="font-medium text-foreground">Mr. Hassan Nur</div>
          </div>
        </footer>
        <div className="mt-6 text-center text-[10px] text-muted-foreground print:block">
          KAALIK Private High School · Hodan District, Mogadishu · info@kaalik.edu
        </div>
      </div>
    </div>
  );
}