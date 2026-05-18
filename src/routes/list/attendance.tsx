import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { attendanceData } from "@/lib/data";
export const Route = createFileRoute("/list/attendance")({ component: Page });
function Page() {
  return (
    <ListPage title="Attendance">
      <Table columns={[{header:"Student",accessor:"student"},{header:"Class",accessor:"class"},{header:"Date",accessor:"date"},{header:"Status",accessor:"status"}]} data={attendanceData}
        renderRow={(a) => (<tr key={a.id} className="border-t"><td className="py-3 font-medium">{a.student}</td><td className="text-xs">{a.class}</td><td className="text-xs">{a.date}</td><td><span className={`text-xs px-2 py-0.5 rounded-full ${a.present?"bg-lama-sky-light":"bg-lama-yellow-light"}`}>{a.present?"Present":"Absent"}</span></td></tr>)} />
    </ListPage>
  );
}
