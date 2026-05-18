import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { lessonsData } from "@/lib/data";
export const Route = createFileRoute("/list/lessons")({ component: Page });
function Page() {
  return (
    <ListPage title="All Lessons">
      <Table columns={[{header:"Subject",accessor:"subject"},{header:"Class",accessor:"class"},{header:"Teacher",accessor:"teacher"}]} data={lessonsData}
        renderRow={(l) => (<tr key={l.id} className="border-t"><td className="py-3 font-medium">{l.subject}</td><td className="text-xs">{l.class}</td><td className="text-xs">{l.teacher}</td></tr>)} />
    </ListPage>
  );
}
