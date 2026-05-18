import { createFileRoute } from "@tanstack/react-router";
import { UserCard } from "@/components/UserCard";
import { CountChart } from "@/components/CountChart";
import { AttendanceChart } from "@/components/AttendanceChart";
import { FinanceChart } from "@/components/FinanceChart";
import { EventCalendar } from "@/components/EventCalendar";
import { Announcements } from "@/components/Announcements";

export const Route = createFileRoute("/admin")({ component: AdminPage });
function AdminPage() {
  return (
    <div className="flex flex-col xl:flex-row gap-4">
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <UserCard type="student" count={1234} />
          <UserCard type="teacher" count={84} />
          <UserCard type="parent" count={920} />
          <UserCard type="staff" count={32} />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3"><CountChart /></div>
          <div className="w-full lg:w-2/3"><AttendanceChart /></div>
        </div>
        <FinanceChart />
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
}
