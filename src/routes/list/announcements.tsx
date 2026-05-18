import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { announcementsData } from "@/lib/data";
export const Route = createFileRoute("/list/announcements")({ component: Page });
function Page() {
  return (
    <ListPage title="All Announcements">
      <Table columns={[{header:"Title",accessor:"title"},{header:"Class",accessor:"class"},{header:"Date",accessor:"date"}]} data={announcementsData}
        renderRow={(a) => (<tr key={a.id} className="border-t"><td className="py-3 font-medium">{a.title}</td><td className="text-xs">{a.class}</td><td className="text-xs">{a.date}</td></tr>)} />
    </ListPage>
  );
}
