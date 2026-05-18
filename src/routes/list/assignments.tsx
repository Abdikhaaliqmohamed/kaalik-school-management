import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { assignmentsData } from "@/lib/data";
export const Route = createFileRoute("/list/assignments")({ component: Page });
function Page() {
  return (
    <ListPage title="All Assignments">
      <Table columns={[{header:"Subject",accessor:"subject"},{header:"Class",accessor:"class"},{header:"Teacher",accessor:"teacher"},{header:"Due",accessor:"due"}]} data={assignmentsData}
        renderRow={(a) => (<tr key={a.id} className="border-t"><td className="py-3 font-medium">{a.subject}</td><td className="text-xs">{a.class}</td><td className="text-xs">{a.teacher}</td><td className="text-xs">{a.dueDate}</td></tr>)} />
    </ListPage>
  );
}
