import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CountChart() {
  const { data } = useQuery({
    queryKey: ["counts", "students-teachers"],
    queryFn: async () => {
      const [s, t] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
      ]);
      return { students: s.count ?? 0, teachers: t.count ?? 0 };
    },
  });
  const students = data?.students ?? 0;
  const teachers = data?.teachers ?? 0;
  const total = students + teachers;
  const chart = [
    { name: "Total", count: Math.max(total, 1), fill: "white" },
    { name: "Teachers", count: teachers, fill: "var(--lama-yellow)" },
    { name: "Students", count: students, fill: "var(--lama-sky)" },
  ];
  return (
    <div className="bg-white rounded-2xl p-4 h-[420px]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">People</h3>
      </div>
      <div className="relative h-[300px]">
        <ResponsiveContainer>
          <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={32} data={chart}>
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center text-center text-sm text-muted-foreground">
          <div><div className="text-2xl font-semibold text-foreground">{total}</div>Total</div>
        </div>
      </div>
      <div className="flex justify-around mt-2 text-xs">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-lama-sky" /> Students ({students})</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-lama-yellow" /> Teachers ({teachers})</div>
      </div>
    </div>
  );
}
