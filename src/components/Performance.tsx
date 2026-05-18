import { PieChart, Pie, ResponsiveContainer } from "recharts";
const data = [{ name: "Group A", value: 92, fill: "var(--lama-sky)" }, { name: "Group B", value: 8, fill: "var(--lama-yellow)" }];
export function Performance() {
  return (
    <div className="bg-white rounded-2xl p-4 h-[240px] relative">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Performance</h3><span className="text-xs text-muted-foreground">…</span></div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart><Pie data={data} dataKey="value" innerRadius={60} outerRadius={90} startAngle={180} endAngle={0} /></PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center mt-2">
        <div className="text-center"><div className="text-2xl font-semibold">9.2</div><div className="text-xs text-muted-foreground">of 10 max LTS</div></div>
      </div>
      <p className="text-xs text-center text-muted-foreground absolute bottom-3 left-0 right-0">1st Semester · 2nd Semester</p>
    </div>
  );
}
