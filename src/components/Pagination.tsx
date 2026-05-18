export function Pagination() {
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <button className="px-3 py-1 rounded-md bg-muted text-muted-foreground">Prev</button>
      <div className="flex gap-2">{[1,2,3,"…",10].map((n,i)=>(<button key={i} className={`w-7 h-7 rounded-md ${n===1?"bg-lama-sky":""}`}>{n}</button>))}</div>
      <button className="px-3 py-1 rounded-md bg-muted text-muted-foreground">Next</button>
    </div>
  );
}
