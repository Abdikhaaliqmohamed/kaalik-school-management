import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/list/attendance")({ component: Page });

type Status = "present" | "absent" | "late";

function Page() {
  const { role, user, loading } = useAuth();
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (role === "teacher" || role === "admin") return <StaffAttendance />;
  if (role === "student") return <StudentAttendance />;
  if (role === "parent") return <ParentAttendance />;
  return null;
}

/* ===== Teacher / Admin: take + edit attendance ===== */
function StaffAttendance() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-opt"],
    queryFn: async () => (await supabase.from("classes").select("id,name").order("name")).data ?? [],
  });

  const { data: students = [], isFetching } = useQuery({
    queryKey: ["att-roster", classId, date],
    queryFn: async () => {
      if (!classId) return [];
      const [stu, att] = await Promise.all([
        supabase.from("students").select("id,name,photo_url").eq("class_id", classId).order("name"),
        supabase.from("attendance").select("student_id,status").eq("date", date).eq("class_id", classId),
      ]);
      const existing: Record<string, Status> = {};
      (att.data ?? []).forEach((r: any) => { existing[r.student_id] = r.status; });
      setMarks(existing);
      return stu.data ?? [];
    },
    enabled: !!classId,
  });

  const counts = useMemo(() => {
    const all = students.length;
    const p = Object.values(marks).filter((s) => s === "present").length;
    const a = Object.values(marks).filter((s) => s === "absent").length;
    const l = Object.values(marks).filter((s) => s === "late").length;
    return { all, p, a, l, unset: all - p - a - l };
  }, [marks, students]);

  const save = async () => {
    if (!classId) return toast.error("Pick a class");
    const rows = students.filter((s: any) => marks[s.id]).map((s: any) => ({
      student_id: s.id,
      class_id: classId,
      date,
      status: marks[s.id],
      present: marks[s.id] !== "absent",
    }));
    if (rows.length === 0) return toast.error("Nothing to save");
    // delete-then-insert to upsert per (student,date)
    const ids = rows.map((r) => r.student_id);
    await supabase.from("attendance").delete().eq("date", date).in("student_id", ids);
    const { error } = await supabase.from("attendance").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Saved ${rows.length} records`);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["att-roster"] });
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-semibold mr-auto">Take attendance</h2>
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="text-sm bg-muted rounded-md px-3 py-1.5 border border-border">
          <option value="">Select class…</option>
          {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm bg-muted rounded-md px-3 py-1.5 border border-border" />
        <button onClick={save} className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium flex items-center gap-1">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      {classId && (
        <div className="flex gap-3 mt-3 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-lama-sky-light">Present {counts.p}</span>
          <span className="px-2 py-0.5 rounded-full bg-lama-yellow-light">Late {counts.l}</span>
          <span className="px-2 py-0.5 rounded-full bg-lama-purple-light">Absent {counts.a}</span>
          <span className="px-2 py-0.5 rounded-full bg-muted">Unset {counts.unset}</span>
        </div>
      )}

      {!classId && <p className="text-sm text-muted-foreground mt-6 text-center">Pick a class and date to begin.</p>}
      {classId && isFetching && <p className="text-sm text-muted-foreground mt-6">Loading roster…</p>}
      {classId && !isFetching && students.length === 0 && <p className="text-sm text-muted-foreground mt-6 text-center">No students in this class.</p>}

      <div className="mt-4 divide-y">
        {students.map((s: any) => (
          <div key={s.id} className="py-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-lama-sky grid place-items-center text-sm font-semibold">{s.name.charAt(0)}</div>
            <div className="flex-1 text-sm font-medium">{s.name}</div>
            <div className="flex gap-1">
              {(["present", "late", "absent"] as Status[]).map((st) => {
                const active = marks[s.id] === st;
                const tint = st === "present" ? "bg-lama-sky" : st === "late" ? "bg-lama-yellow" : "bg-lama-purple";
                return (
                  <button key={st} onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                    className={`text-xs px-3 py-1 rounded-full capitalize ${active ? tint : "bg-muted text-muted-foreground"}`}>
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Student: view own attendance ===== */
function StudentAttendance() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["my-att", user?.id],
    queryFn: async () => {
      const me = await supabase.from("students").select("id,name").eq("profile_id", user!.id).maybeSingle();
      if (!me.data) return { rows: [], pct: 0, name: "" };
      const att = await supabase.from("attendance").select("date,status").eq("student_id", me.data.id).order("date", { ascending: false });
      const rows = att.data ?? [];
      const present = rows.filter((r: any) => r.status === "present" || r.status === "late").length;
      return { rows, pct: rows.length ? Math.round((present / rows.length) * 100) : 0, name: me.data.name };
    },
  });
  return <HistoryCard title={`My attendance${data?.name ? ` · ${data.name}` : ""}`} pct={data?.pct ?? 0} rows={data?.rows ?? []} />;
}

/* ===== Parent: per-child ===== */
function ParentAttendance() {
  const { user } = useAuth();
  const { data: kids = [] } = useQuery({
    queryKey: ["my-kids", user?.id],
    queryFn: async () => {
      const me = await supabase.from("parents").select("id").eq("profile_id", user!.id).maybeSingle();
      if (!me.data) return [];
      const k = await supabase.from("students").select("id,name").eq("parent_id", me.data.id);
      return k.data ?? [];
    },
  });
  const [kidId, setKidId] = useState<string>("");
  const currentId = kidId || (kids[0] as any)?.id;
  const { data } = useQuery({
    queryKey: ["kid-att", currentId],
    queryFn: async () => {
      if (!currentId) return { rows: [], pct: 0 };
      const att = await supabase.from("attendance").select("date,status").eq("student_id", currentId).order("date", { ascending: false });
      const rows = att.data ?? [];
      const present = rows.filter((r: any) => r.status === "present" || r.status === "late").length;
      return { rows, pct: rows.length ? Math.round((present / rows.length) * 100) : 0 };
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
      <HistoryCard title="Child attendance" pct={data?.pct ?? 0} rows={data?.rows ?? []} />
    </div>
  );
}

function HistoryCard({ title, pct, rows }: { title: string; pct: number; rows: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-3xl font-bold text-lama-sky">{pct}%</div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{rows.length} records total</p>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No records yet.</p>}
      <div className="divide-y">
        {rows.map((r, i) => (
          <div key={i} className="py-2 flex items-center justify-between text-sm">
            <span>{r.date}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              r.status === "present" ? "bg-lama-sky-light" : r.status === "late" ? "bg-lama-yellow-light" : "bg-lama-purple-light"
            }`}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}