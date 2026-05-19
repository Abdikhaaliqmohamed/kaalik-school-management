import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Announcements() {
  const colors = ["bg-lama-sky-light","bg-lama-purple-light","bg-lama-yellow-light"];
  const { data = [], isLoading } = useQuery({
    queryKey: ["announcements", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements")
        .select("*").order("date", { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="bg-white rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Announcements</h3>
        <span className="text-xs text-muted-foreground">{data.length} recent</span>
      </div>
      {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
        <div className="flex flex-col gap-3">
          {data.map((a, i) => (
            <div key={a.id} className={`p-3 rounded-xl ${colors[i % colors.length]}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{a.title}</h4>
                <span className="text-[11px] bg-white/70 px-2 py-0.5 rounded-full">{a.date}</span>
              </div>
              {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
            </div>
          ))}
          {data.length === 0 && <p className="text-xs text-muted-foreground">No announcements yet.</p>}
        </div>
      )}
    </div>
  );
}
