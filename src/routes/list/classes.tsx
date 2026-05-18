import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { classesData } from "@/lib/data";
export const Route = createFileRoute("/list/classes")({ component: Page });
function Page() {
  return (
    <ListPage title="All Classes">
      <Table columns={[{header:"Class",accessor:"name"},{header:"Capacity",accessor:"cap"},{header:"Grade",accessor:"grade"},{header:"Supervisor",accessor:"sup"}]} data={classesData}
        renderRow={(c) => (<tr key={c.id} className="border-t"><td className="py-3 font-medium">{c.name}</td><td className="text-xs">{c.capacity}</td><td className="text-xs">{c.grade}</td><td className="text-xs">{c.supervisor}</td></tr>)} />
    </ListPage>
  );
}
