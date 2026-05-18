import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { resultsData } from "@/lib/data";
export const Route = createFileRoute("/list/results")({ component: Page });
function Page() {
  return (
    <ListPage title="All Results">
      <Table columns={[{header:"Subject",accessor:"subject"},{header:"Student",accessor:"student"},{header:"Score",accessor:"score"},{header:"Teacher",accessor:"teacher"},{header:"Class",accessor:"class"},{header:"Type",accessor:"type"},{header:"Date",accessor:"date"}]} data={resultsData}
        renderRow={(r) => (<tr key={r.id} className="border-t"><td className="py-3 font-medium">{r.subject}</td><td className="text-xs">{r.student}</td><td><span className="text-xs px-2 py-0.5 rounded-full bg-lama-sky-light">{r.score}</span></td><td className="text-xs">{r.teacher}</td><td className="text-xs">{r.class}</td><td className="text-xs">{r.type}</td><td className="text-xs">{r.date}</td></tr>)} />
    </ListPage>
  );
}
