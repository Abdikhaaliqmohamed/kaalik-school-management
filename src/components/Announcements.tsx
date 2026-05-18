import { announcementsData } from "@/lib/data";
export function Announcements() {
  const colors = ["bg-lama-sky-light","bg-lama-purple-light","bg-lama-yellow-light"];
  return (
    <div className="bg-white rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Announcements</h3><span className="text-xs text-muted-foreground cursor-pointer">View All</span></div>
      <div className="flex flex-col gap-3">
        {announcementsData.slice(0,3).map((a,i) => (
          <div key={a.id} className={`p-3 rounded-xl ${colors[i % colors.length]}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{a.title}</h4>
              <span className="text-[11px] bg-white/70 px-2 py-0.5 rounded-full">{a.date}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
