import { useState } from "react";
import { eventsData } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";

function Cal({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const start = new Date(value.getFullYear(), value.getMonth(), 1);
  const end = new Date(value.getFullYear(), value.getMonth() + 1, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < start.getDay(); i++) days.push(null);
  for (let d = 1; d <= end.getDate(); d++) days.push(new Date(value.getFullYear(), value.getMonth(), d));
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() - 1, 1))}>‹</button>
        <span className="font-medium">{value.toLocaleString("default", { month: "long", year: "numeric" })}</span>
        <button onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() + 1, 1))}>›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-muted-foreground mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, i) => (
          <div key={i} className={`aspect-square grid place-items-center rounded-md ${d && d.toDateString() === new Date().toDateString() ? "bg-lama-sky font-semibold" : ""}`}>
            {d ? d.getDate() : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventCalendar() {
  const [date, setDate] = useState(new Date());
  return (
    <div className="bg-white rounded-2xl p-4">
      <Cal value={date} onChange={setDate} />
      <div className="flex items-center justify-between mt-4 mb-2">
        <h3 className="font-semibold">Events</h3><MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-3">
        {eventsData.slice(0, 3).map((e, i) => (
          <div key={e.id} className={`p-3 rounded-xl border-l-4 ${i % 2 === 0 ? "border-lama-sky" : "border-lama-purple"} bg-muted/40`}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{e.title}</h4>
              <span className="text-[11px] text-muted-foreground">{e.startTime}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{e.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
