import { Search, SlidersHorizontal, ArrowUpDown, Plus } from "lucide-react";
export function TableHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h2 className="text-lg font-semibold hidden md:block">{title}</h2>
      <div className="flex items-center gap-2 flex-1 md:flex-none md:ml-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm w-full md:w-[220px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input placeholder="Search..." className="bg-transparent outline-none flex-1 text-sm" />
        </div>
        <button className="w-8 h-8 rounded-full bg-lama-yellow grid place-items-center"><SlidersHorizontal className="w-4 h-4" /></button>
        <button className="w-8 h-8 rounded-full bg-lama-yellow grid place-items-center"><ArrowUpDown className="w-4 h-4" /></button>
        <button className="w-8 h-8 rounded-full bg-lama-yellow grid place-items-center"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
