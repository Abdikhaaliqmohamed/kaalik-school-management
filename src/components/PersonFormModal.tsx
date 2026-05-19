import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export type PersonKind = "student" | "teacher";

export type PersonValue = {
  id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  // student-only
  grade?: string | null;
  class_id?: string | null;
  parent_id?: string | null;
  // teacher-only
  subjects?: string[];
};

type ClassOpt = { id: string; name: string };
type ParentOpt = { id: string; name: string };

export function PersonFormModal({
  open, onOpenChange, kind, initial, onSaved,
  classes = [], parents = [], subjects = [],
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kind: PersonKind;
  initial?: PersonValue | null;
  onSaved: () => void;
  classes?: ClassOpt[];
  parents?: ParentOpt[];
  subjects?: { id: string; name: string }[];
}) {
  const [v, setV] = useState<PersonValue>({
    name: "", email: "", phone: "", address: "", photo_url: "",
    grade: "", class_id: null, parent_id: null, subjects: [],
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setV(initial ?? {
        name: "", email: "", phone: "", address: "", photo_url: "",
        grade: "", class_id: null, parent_id: null, subjects: [],
      });
    }
  }, [open, initial]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${kind}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("photos").getPublicUrl(path);
      setV((p) => ({ ...p, photo_url: data.publicUrl }));
      toast.success("Photo uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!v.name.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    try {
      const table = kind === "student" ? "students" : "teachers";
      const payload: any = {
        name: v.name.trim(),
        email: v.email || null,
        phone: v.phone || null,
        address: v.address || null,
        photo_url: v.photo_url || null,
      };
      if (kind === "student") {
        payload.grade = v.grade || null;
        payload.class_id = v.class_id || null;
        payload.parent_id = v.parent_id || null;
      } else {
        payload.subjects = v.subjects ?? [];
      }
      const { error } = v.id
        ? await supabase.from(table).update(payload).eq("id", v.id)
        : await supabase.from(table).insert(payload);
      if (error) throw error;
      toast.success(v.id ? "Updated" : "Created");
      onSaved(); onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{v.id ? "Edit" : "Add"} {kind}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2 flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted overflow-hidden grid place-items-center">
              {v.photo_url ? <img src={v.photo_url} className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
            </div>
            <label className="text-xs px-3 py-2 rounded-md bg-lama-sky-light cursor-pointer">
              {uploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" hidden onChange={handlePhoto} />
            </label>
          </div>
          <Field label="Name" value={v.name} onChange={(s)=>setV({...v, name: s})} required />
          <Field label="Email" type="email" value={v.email ?? ""} onChange={(s)=>setV({...v, email: s})} />
          <Field label="Phone" value={v.phone ?? ""} onChange={(s)=>setV({...v, phone: s})} />
          <Field label="Address" value={v.address ?? ""} onChange={(s)=>setV({...v, address: s})} />
          {kind === "student" ? (
            <>
              <Select label="Class" value={v.class_id ?? ""} onChange={(s)=>{
                const cls = classes.find(c => c.id === s);
                setV({...v, class_id: s || null, grade: cls?.name ?? v.grade});
              }} options={[{value:"",label:"—"}, ...classes.map(c => ({value:c.id, label:c.name}))]} />
              <Select label="Parent" value={v.parent_id ?? ""} onChange={(s)=>setV({...v, parent_id: s || null})}
                options={[{value:"",label:"—"}, ...parents.map(p => ({value:p.id, label:p.name}))]} />
            </>
          ) : (
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Subjects</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {subjects.map(s => {
                  const on = v.subjects?.includes(s.name);
                  return (
                    <button key={s.id} type="button"
                      onClick={()=>setV({...v, subjects: on ? v.subjects!.filter(x=>x!==s.name) : [...(v.subjects??[]), s.name]})}
                      className={`text-xs px-2.5 py-1 rounded-full border ${on ? "bg-lama-sky border-lama-sky" : "bg-white"}`}>
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={()=>onOpenChange(false)} className="px-3 py-1.5 rounded-md text-sm border">Cancel</button>
          <button disabled={busy} onClick={save} className="px-3 py-1.5 rounded-md text-sm bg-lama-sky font-medium disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (s: string)=>void; type?: string; required?: boolean }) {
  return (
    <label className="text-xs text-muted-foreground">{label}{required && " *"}
      <input type={type} value={value} required={required}
        onChange={(e)=>onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-md border bg-white text-foreground text-sm" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (s: string)=>void; options: {value:string;label:string}[] }) {
  return (
    <label className="text-xs text-muted-foreground">{label}
      <select value={value} onChange={(e)=>onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-md border bg-white text-foreground text-sm">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}