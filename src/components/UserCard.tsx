import { MoreHorizontal } from "lucide-react";

const palette: Record<string, string> = {
  student: "bg-lama-sky",
  teacher: "bg-lama-purple",
  parent: "bg-lama-yellow",
  staff: "bg-lama-sky-light",
};

export function UserCard({ type, count, label }: { type: keyof typeof palette; count: number; label?: string }) {
  return (
    <div className={`rounded-2xl p-4 flex-1 min-w-[150px] ${palette[type]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] bg-white/70 px-2 py-1 rounded-full">2026/27</span>
        <MoreHorizontal className="w-4 h-4" />
      </div>
      <h2 className="text-2xl font-semibold my-3">{count.toLocaleString()}</h2>
      <p className="text-sm capitalize text-foreground/70">{label ?? `${type}s`}</p>
    </div>
  );
}
