import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { useRoleGate } from "@/lib/use-role-gate";

type FieldType = "text" | "textarea" | "date" | "time" | "select" | "class" | "subject" | "teacher";
export type CrudField = { name: string; label: string; type?: FieldType; required?: boolean; options?: string[] };
export type CrudColumn = { header: string; accessor: string };

const PAGE = 10;

export function CrudList({
  table, title, fields, columns, searchField = "title",
}: {
  table: string;
  title: string;
  fields: CrudField[];
  columns: CrudColumn[];
  searchField?: string;
}) {
  useRoleGate(["admin", "teacher", "student", "parent"]); // anyone signed in can view list; writes gated by RLS
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({ queryKey: ["opt-classes"], queryFn: async () => (await supabase.from("classes").select("id,name").order("name")).data ?? [] });
  const { data: subjects = [] } = useQuery({ queryKey: ["opt-subjects"], queryFn: async () => (await supabase.from("subjects").select("id,name").order("name")).data ?? [] });
  const { data: teachers = [] } = useQuery({ queryKey: ["opt-teachers"], queryFn: async () => (await supabase.from("teachers").select("id,name").order("name")).data ?? [] });

  const lookup = (type?: FieldType) =>
    type === "class" ? classes : type === "subject" ? subjects : type === "teacher" ? teachers : [];

  const { data } = useQuery({
    queryKey: [table, search, page],
    queryFn: async () => {
      let q = (supabase.from(table as any) as any).select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
      if (search.trim()) q = q.ilike(searchField, `%${search.trim()}%`);
      const { data, count, error } = await q;
      if (error) throw error;
      return { rows: (data as any[]) ?? [], count: count ?? 0 };
    },
  });

  const rows = data?.rows ?? [];
  const pages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE));

  const display = (row: any, col: CrudColumn) => {
    const v = row[col.accessor];
    if (v != null && v !== "") return String(v);
    // Try to resolve _id columns
    if (col.accessor === "class") return classes.find((c: any) => c.id === row.class_id)?.name ?? "—";
    if (col.accessor === "subject") return subjects.find((s: any) => s.id === row.subject_id)?.name ?? "—";
    if (col.accessor === "teacher") return teachers.find((t: any) => t.id === row.teacher_id)?.name ?? "—";
    return "—";
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", deleteId);
    if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: [table] }); }
    setDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2 flex-1 md:flex-none md:ml-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm w-full md:w-[240px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder={`Search ${title.toLowerCase()}…`} className="bg-transparent outline-none flex-1 text-sm" />
          </div>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground">{columns.map((c) => <th key={c.header} className="py-2 pr-3">{c.header}</th>)}<th></th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="py-8 text-center text-muted-foreground">No records.</td></tr>}
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                {columns.map((c) => <td key={c.header} className="py-3 pr-3 text-xs">{display(r, c)}</td>)}
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(r); setOpen(true); }} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-muted text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>Page {page + 1} / {pages}</span>
        <div className="flex gap-1">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded bg-muted disabled:opacity-50">Prev</button>
          <button disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded bg-muted disabled:opacity-50">Next</button>
        </div>
      </div>

      {open && <FormModal table={table} fields={fields} initial={editing} lookup={lookup} onClose={() => setOpen(false)} onSaved={() => { qc.invalidateQueries({ queryKey: [table] }); setOpen(false); }} />}
      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={onDelete} />
    </div>
  );
}

function FormModal({ table, fields, initial, lookup, onClose, onSaved }: any) {
  const [vals, setVals] = useState<any>(() => {
    const v: any = {};
    for (const f of fields) v[f.name] = initial?.[f.name] ?? "";
    return v;
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = {};
    for (const f of fields) payload[f.name] = vals[f.name] === "" ? null : vals[f.name];
    const op = initial?.id
      ? (supabase.from(table) as any).update(payload).eq("id", initial.id)
      : (supabase.from(table) as any).insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial?.id ? "Updated" : "Created");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">{initial?.id ? "Edit" : "New"}</h3>
        {fields.map((f: any) => {
          const opts = lookup(f.type);
          const common = "w-full px-3 py-2 border rounded-md text-sm";
          return (
            <label key={f.name} className="block">
              <span className="block text-xs text-muted-foreground mb-1">{f.label}{f.required && " *"}</span>
              {f.type === "textarea" ? (
                <textarea required={f.required} value={vals[f.name] ?? ""} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} rows={3} className={common} />
              ) : f.type === "select" ? (
                <select value={vals[f.name] ?? ""} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} className={common}>
                  <option value="">—</option>
                  {f.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : ["class", "subject", "teacher"].includes(f.type) ? (
                <select value={vals[f.name] ?? ""} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} className={common}>
                  <option value="">—</option>
                  {opts.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              ) : (
                <input type={f.type || "text"} required={f.required} value={vals[f.name] ?? ""} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} className={common} />
              )}
            </label>
          );
        })}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-md text-sm bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-md text-sm bg-lama-sky font-medium">{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}