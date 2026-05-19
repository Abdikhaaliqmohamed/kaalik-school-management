import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AttendanceChart() {
  const { data = [] } = useQuery({
    queryKey: ["attendance", "week"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 6);
      const { data, error } = await supabase.from("attendance")
        .select("date,present").gte("date", since.toISOString().slice(0, 10));
      if (error) throw error;
      const buckets: Record<string, { present: number; absent: number }> = {};
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        buckets[d.toISOString().slice(0, 10)] = { present: 0, absent: 0 };
      }
      for (const r of data ?? []) {
        const b = buckets[r.date]; if (!b) continue;
        if (r.present) b.present++; else b.absent++;
      }
      return Object.entries(buckets).map(([date, v]) => ({
        name: days[new Date(date).getDay()], ...v,
      }));
    },
  });
  return (
    <div className="bg-white rounded-2xl p-4 h-[420px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Attendance (last 7 days)</h3>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "transparent" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="present" fill="var(--lama-sky)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="absent" fill="var(--lama-yellow)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
