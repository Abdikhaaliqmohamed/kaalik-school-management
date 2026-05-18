import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { eventsData } from "@/lib/data";
export const Route = createFileRoute("/list/events")({ component: Page });
function Page() {
  return (
    <ListPage title="All Events">
      <Table columns={[{header:"Title",accessor:"title"},{header:"Class",accessor:"class"},{header:"Date",accessor:"date"},{header:"Start",accessor:"start"},{header:"End",accessor:"end"}]} data={eventsData}
        renderRow={(e) => (<tr key={e.id} className="border-t"><td className="py-3 font-medium">{e.title}</td><td className="text-xs">{e.class}</td><td className="text-xs">{e.date}</td><td className="text-xs">{e.startTime}</td><td className="text-xs">{e.endTime}</td></tr>)} />
    </ListPage>
  );
}
