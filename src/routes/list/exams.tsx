import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/ConfirmDelete";

export const Route = createFileRoute("/list/exams")({ component: Page });

type Exam = { id?: string; title: string; subject_id: string | null; class_id: string | null; exam_date: string; max_marks: number; term: string };

function Page() {
  const qc = useQueryClient();
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "teacher";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await supabase.from("exams").select("*, subjects(name), classes(name)").order("exam_date", { ascending: false })).data ?? [],
  });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects-opt"], queryFn: async () => (await supabase.from("subjects").select("id,name").order("name")).data ?? [] });
  const { data: classes = [] } = useQuery({ queryKey: ["classes-opt"], queryFn: async () => (await supabase.from("classes").select("id,name").order("name")).data ?? [] });

  const onDelete = async () => {
    if (!delId) return;
    const { error } = await supabase.from("exams").delete().eq("id", delId);
    if (error) toast.error(error.message); else { toast.success("Exam deleted"); qc.invalidateQueries({ queryKey: ["exams"] }); }
    setDelId(null);
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Exams</h2>
        {canWrite && (
          <button onClick={() => { setEditing(null); setOpen(true); }} className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add exam
          </button>
        )}
      </div>
      <table className="w-full mt-4 text-sm">
        <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Title</th><th>Subject</th><th>Class</th><th>Date</th><th>Max</th><th>Term</th><th></th></tr></thead>
        <tbody>
          {exams.map((e: any) => (
            <tr key={e.id} className="border-t">
              <td className="py-3 font-medium">{e.title}</td>
              <td>{e.subjects?.name ?? "—"}</td>
              <td>{e.classes?.name ?? "—"}</td>
              <td>{e.exam_date}</td>
              <td>{e.max_marks}</td>
              <td>{e.term}</td>
              <td>
                {canWrite && (
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(e); setOpen(true); }} className="w-7 h-7 grid place-items-center rounded-full bg-lama-sky"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={() => setDelId(e.id)} className="w-7 h-7 grid place-items-center rounded-full bg-lama-purple"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {exams.length === 0 && <p className="text-sm text-muted-foreground mt-6 text-center">No exams yet.</p>}

      {open && (
        <ExamModal
          initial={editing}
          subjects={subjects}
          classes={classes}
          onClose={() => setOpen(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["exams"] }); setOpen(false); }}
        />
      )}
      <ConfirmDelete open={!!delId} onOpenChange={(o) => !o && setDelId(null)} onConfirm={onDelete} label="this exam" />
    </div>
  );
}

function ExamModal({ initial, subjects, classes, onClose, onSaved }: any) {
  const [v, setV] = useState<Exam>(initial ?? { title: "", subject_id: null, class_id: null, exam_date: new Date().toISOString().slice(0,10), max_marks: 100, term: "Term 1" });
  const save = async () => {
    if (!v.title.trim()) return toast.error("Title is required");
    const payload = { ...v, max_marks: Number(v.max_marks) };
    const { error } = v.id
      ? await supabase.from("exams").update(payload).eq("id", v.id)
      : await supabase.from("exams").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(v.id ? "Exam updated" : "Exam created");
    onSaved();
  };
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={(e)=>e.stopPropagation()}>
        <h3 className="font-semibold mb-3">{v.id ? "Edit exam" : "New exam"}</h3>
        <div className="grid gap-2 text-sm">
          <label>Title<input className="w-full mt-1 bg-muted rounded px-2 py-1.5" value={v.title} onChange={(e)=>setV({...v,title:e.target.value})}/></label>
          <label>Subject<select className="w-full mt-1 bg-muted rounded px-2 py-1.5" value={v.subject_id ?? ""} onChange={(e)=>setV({...v,subject_id:e.target.value||null})}><option value="">—</option>{subjects.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Class<select className="w-full mt-1 bg-muted rounded px-2 py-1.5" value={v.class_id ?? ""} onChange={(e)=>setV({...v,class_id:e.target.value||null})}><option value="">—</option>{classes.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-2">
            <label>Date<input type="date" className="w-full mt-1 bg-muted rounded px-2 py-1.5" value={v.exam_date} onChange={(e)=>setV({...v,exam_date:e.target.value})}/></label>
            <label>Max marks<input type="number" className="w-full mt-1 bg-muted rounded px-2 py-1.5" value={v.max_marks} onChange={(e)=>setV({...v,max_marks:Number(e.target.value)})}/></label>
          </div>
          <label>Term<select className="w-full mt-1 bg-muted rounded px-2 py-1.5" value={v.term} onChange={(e)=>setV({...v,term:e.target.value})}><option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Final</option></select></label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md bg-muted text-sm">Cancel</button>
          <button onClick={save} className="px-3 py-1.5 rounded-md bg-lama-yellow text-sm font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}