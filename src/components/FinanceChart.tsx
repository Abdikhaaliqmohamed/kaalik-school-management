import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
const data = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 5000, expense: 3800 },
  { name: "Apr", income: 4780, expense: 3908 },
  { name: "May", income: 5890, expense: 4800 },
  { name: "Jun", income: 6390, expense: 3800 },
  { name: "Jul", income: 7490, expense: 4300 },
];
export function FinanceChart() {
  return (
    <div className="bg-white rounded-2xl p-4 h-[500px]">
      <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold">Finance</h3><span className="text-xs text-muted-foreground">…</span></div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="income" stroke="var(--lama-sky)" strokeWidth={3} />
          <Line type="monotone" dataKey="expense" stroke="var(--lama-purple)" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
