import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { subjectsData } from "@/lib/data";
export const Route = createFileRoute("/list/subjects")({ component: Page });
function Page() {
  return (
    <ListPage title="All Subjects">
      <Table columns={[{header:"Subject",accessor:"name"},{header:"Teachers",accessor:"teachers"}]} data={subjectsData}
        renderRow={(s) => (<tr key={s.id} className="border-t"><td className="py-3 font-medium">{s.name}</td><td className="text-xs">{s.teachers.join(", ")}</td></tr>)} />
    </ListPage>
  );
}
