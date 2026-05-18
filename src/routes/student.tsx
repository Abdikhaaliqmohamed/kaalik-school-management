import { createFileRoute } from "@tanstack/react-router";
import { BigCalendar } from "@/components/BigCalendar";
import { Announcements } from "@/components/Announcements";
import { EventCalendar } from "@/components/EventCalendar";
import { Performance } from "@/components/Performance";

export const Route = createFileRoute("/student")({ component: StudentPage });
function StudentPage() {
  return (
    <div className="flex flex-col xl:flex-row gap-4">
      <div className="w-full xl:w-2/3 bg-white rounded-2xl p-4 h-[700px]">
        <h2 className="font-semibold mb-3">Schedule (10A)</h2>
        <BigCalendar />
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <Performance /><EventCalendar /><Announcements />
      </div>
    </div>
  );
}
