import { createFileRoute } from "@tanstack/react-router";
import { UserCard } from "@/components/UserCard";
import { CountChart } from "@/components/CountChart";
import { AttendanceChart } from "@/components/AttendanceChart";
import { FinanceChart } from "@/components/FinanceChart";
import { EventCalendar } from "@/components/EventCalendar";
import { Announcements } from "@/components/Announcements";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function useCounts() {
  return useQuery({
    queryKey: ["dashboard", "counts"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 6);
      const [s, t, p, c, att] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("parents").select("id", { count: "exact", head: true }),
        supabase.from("classes").select("id", { count: "exact", head: true }),
        supabase.from("attendance").select("present").gte("date", since.toISOString().slice(0, 10)),
      ]);
      const total = att.data?.length ?? 0;
      const present = att.data?.filter((r) => r.present).length ?? 0;
      const pct = total ? Math.round((present / total) * 100) : 0;
      return {
        students: s.count ?? 0,
        teachers: t.count ?? 0,
        parents: p.count ?? 0,
        classes: c.count ?? 0,
        attendancePct: pct,
      };
    },
  });
}

function AdminPage() {
  const { data } = useCounts();
  return (
    <div className="flex flex-col xl:flex-row gap-4">
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <UserCard type="student" count={data?.students ?? 0} />
          <UserCard type="teacher" count={data?.teachers ?? 0} />
          <UserCard type="parent" count={data?.parents ?? 0} />
          <UserCard type="staff" count={data?.classes ?? 0} label="classes" />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3"><CountChart /></div>
          <div className="w-full lg:w-2/3"><AttendanceChart /></div>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Attendance this week</h3>
            <span className="text-2xl font-bold text-lama-sky">{data?.attendancePct ?? 0}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Live from the attendance table.</p>
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
}
