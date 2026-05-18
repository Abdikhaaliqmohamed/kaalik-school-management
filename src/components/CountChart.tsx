import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
const data = [
  { name: "Total", count: 106, fill: "white" },
  { name: "Girls", count: 53, fill: "var(--lama-yellow)" },
  { name: "Boys", count: 53, fill: "var(--lama-sky)" },
];
export function CountChart() {
  return (
    <div className="bg-white rounded-2xl p-4 h-[420px]">
      <div className="flex items-center justify-between"><h3 className="text-base font-semibold">Students</h3><span className="text-xs text-muted-foreground">…</span></div>
      <div className="relative h-[300px]">
        <ResponsiveContainer><RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={32} data={data}><RadialBar background dataKey="count" /></RadialBarChart></ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center text-center text-sm text-muted-foreground">
          <div><div className="text-2xl font-semibold text-foreground">106</div>Total</div>
        </div>
      </div>
      <div className="flex justify-around mt-2 text-xs">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-lama-sky" /> Boys (50%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-lama-yellow" /> Girls (50%)</div>
      </div>
    </div>
  );
}
