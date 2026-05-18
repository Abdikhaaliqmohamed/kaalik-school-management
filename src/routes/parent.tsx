import { createFileRoute } from "@tanstack/react-router";
import { BigCalendar } from "@/components/BigCalendar";
import { Announcements } from "@/components/Announcements";
import { EventCalendar } from "@/components/EventCalendar";
import { studentsData } from "@/lib/data";

export const Route = createFileRoute("/parent")({ component: ParentPage });
function ParentPage() {
  const kids = studentsData.slice(0, 2);
  return (
    <div className="flex flex-col xl:flex-row gap-4">
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {kids.map((k) => (
          <div key={k.id} className="bg-white rounded-2xl p-4 h-[480px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Schedule ({k.name})</h2>
              <span className="text-xs text-muted-foreground">Class {k.class}</span>
            </div>
            <BigCalendar />
          </div>
        ))}
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <EventCalendar /><Announcements />
      </div>
    </div>
  );
}
