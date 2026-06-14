import { createFileRoute } from "@tanstack/react-router";
import { Table } from "@/components/Table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { PersonFormModal, PersonValue } from "@/components/PersonFormModal";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { toast } from "sonner";
import { useRoleGate } from "@/lib/use-role-gate";

const PAGE = 10;

export const Route = createFileRoute("/list/students")({ component: Page });

function Page() {
  const { allowed } = useRoleGate(["admin", "teacher"]);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<PersonValue | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["students", search, page],
    queryFn: async () => {
      let q = supabase.from("students")
        .select("*, classes(name), parents(name)", { count: "exact" })
        .order("name").range(page * PAGE, page * PAGE + PAGE - 1);
      if (search.trim()) q = q.ilike("name", `%${search.trim()}%`);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-opt"],
    queryFn: async () => (await supabase.from("classes").select("id,name").order("name")).data ?? [],
  });
  const { data: parents = [] } = useQuery({
    queryKey: ["parents-opt"],
    queryFn: async () => (await supabase.from("parents").select("id,name").order("name")).data ?? [],
  });

  const total = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  if (!allowed) return null;

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("students").delete().eq("id", deleteId);
    if (error) toast.error(error.message); else { toast.success("Student deleted"); qc.invalidateQueries({ queryKey: ["students"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["counts"] }); }
    setDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">All Students</h2>
        <div className="flex items-center gap-2 flex-1 md:flex-none md:ml-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm w-full md:w-[240px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(0); }}
              placeholder="Search by name…" className="bg-transparent outline-none flex-1 text-sm" />
          </div>
          <button onClick={()=>{ setEditing(null); setModalOpen(true); }}
            className="px-3 py-1.5 rounded-full bg-lama-yellow text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <Table
        columns={[
          {header:"Info",accessor:"info"},
          {header:"Class",accessor:"class",className:"hidden md:table-cell"},
          {header:"Parent",accessor:"parent",className:"hidden md:table-cell"},
          {header:"Phone",accessor:"phone",className:"hidden lg:table-cell"},
          {header:"Address",accessor:"address",className:"hidden lg:table-cell"},
          {header:"Actions",accessor:"actions"},
        ]}
        data={data?.rows ?? []}
        renderRow={(s: any) => (
          <tr key={s.id} className="border-t hover:bg-lama-purple-light/40">
            <td className="py-3">
              <div className="flex items-center gap-3">
                {s.photo_url
                  ? <img src={s.photo_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                  : <div className="w-10 h-10 rounded-full bg-lama-sky grid place-items-center text-sm font-semibold">{s.name.charAt(0)}</div>}
                <div><div className="font-medium text-sm">{s.name}</div><div className="text-xs text-muted-foreground">{s.email ?? "—"}</div></div>
              </div>
            </td>
            <td className="hidden md:table-cell text-xs">{s.classes?.name ?? s.grade ?? "—"}</td>
            <td className="hidden md:table-cell text-xs">{s.parents?.name ?? "—"}</td>
            <td className="hidden lg:table-cell text-xs">{s.phone ?? "—"}</td>
            <td className="hidden lg:table-cell text-xs">{s.address ?? "—"}</td>
            <td>
              <div className="flex gap-2">
                <button onClick={()=>{ setEditing({ id: s.id, name: s.name, email: s.email, phone: s.phone, address: s.address, photo_url: s.photo_url, grade: s.grade, class_id: s.class_id, parent_id: s.parent_id }); setModalOpen(true); }}
                  className="w-7 h-7 grid place-items-center rounded-full bg-lama-sky"><Pencil className="w-3.5 h-3.5"/></button>
                <button onClick={()=>setDeleteId(s.id)} className="w-7 h-7 grid place-items-center rounded-full bg-lama-purple"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            </td>
          </tr>
        )}
      />

      {isLoading && <p className="text-xs text-muted-foreground mt-3">Loading…</p>}
      {!isLoading && data?.rows.length === 0 && <p className="text-sm text-muted-foreground mt-6 text-center">No students found.</p>}

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>{total} students</span>
        <div className="flex items-center gap-2">
          <button disabled={page === 0} onClick={()=>setPage(p=>p-1)} className="px-3 py-1.5 rounded-md border disabled:opacity-40">Prev</button>
          <span>Page {page + 1} / {pages}</span>
          <button disabled={page + 1 >= pages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 rounded-md border disabled:opacity-40">Next</button>
        </div>
      </div>

      <PersonFormModal open={modalOpen} onOpenChange={setModalOpen} kind="student"
        initial={editing} classes={classes} parents={parents}
        onSaved={()=>{ qc.invalidateQueries({ queryKey: ["students"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["counts"] }); }} />
      <ConfirmDelete open={!!deleteId} onOpenChange={(o)=>!o && setDeleteId(null)} onConfirm={onDelete} label="this student" />
    </div>
  );
}
