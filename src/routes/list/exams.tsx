import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { examsData } from "@/lib/data";
export const Route = createFileRoute("/list/exams")({ component: Page });
function Page() {
  return (
    <ListPage title="All Exams">
      <Table columns={[{header:"Subject",accessor:"subject"},{header:"Class",accessor:"class"},{header:"Teacher",accessor:"teacher"},{header:"Date",accessor:"date"}]} data={examsData}
        renderRow={(e) => (<tr key={e.id} className="border-t"><td className="py-3 font-medium">{e.subject}</td><td className="text-xs">{e.class}</td><td className="text-xs">{e.teacher}</td><td className="text-xs">{e.date}</td></tr>)} />
    </ListPage>
  );
}
