import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
const data = [
  { name: "Mon", present: 60, absent: 40 },
  { name: "Tue", present: 70, absent: 30 },
  { name: "Wed", present: 90, absent: 10 },
  { name: "Thu", present: 75, absent: 25 },
  { name: "Fri", present: 80, absent: 20 },
];
export function AttendanceChart() {
  return (
    <div className="bg-white rounded-2xl p-4 h-[420px]">
      <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold">Attendance</h3><span className="text-xs text-muted-foreground">…</span></div>
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
