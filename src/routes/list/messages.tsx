import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { messagesData } from "@/lib/data";
export const Route = createFileRoute("/list/messages")({ component: Page });
function Page() {
  return (
    <ListPage title="Messages">
      <Table columns={[{header:"From",accessor:"from"},{header:"To",accessor:"to"},{header:"Subject",accessor:"subject"},{header:"Date",accessor:"date"}]} data={messagesData}
        renderRow={(m) => (<tr key={m.id} className="border-t"><td className="py-3 font-medium">{m.from}</td><td className="text-xs">{m.to}</td><td className="text-xs">{m.subject}</td><td className="text-xs">{m.date}</td></tr>)} />
    </ListPage>
  );
}
