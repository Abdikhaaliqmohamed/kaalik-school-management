import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { parentsData } from "@/lib/data";
import { Eye, Trash2 } from "lucide-react";
export const Route = createFileRoute("/list/parents")({ component: Page });
function Page() {
  return (
    <ListPage title="All Parents">
      <Table
        columns={[{header:"Info",accessor:"info"},{header:"Students",accessor:"students",className:"hidden md:table-cell"},{header:"Phone",accessor:"phone",className:"hidden md:table-cell"},{header:"Address",accessor:"address",className:"hidden lg:table-cell"},{header:"Actions",accessor:"actions"}]}
        data={parentsData}
        renderRow={(p) => (
          <tr key={p.id} className="border-t hover:bg-lama-purple-light/40">
            <td className="py-3"><div className="font-medium text-sm">{p.name}</div><div className="text-xs text-muted-foreground">{p.email}</div></td>
            <td className="hidden md:table-cell text-xs">{p.students.join(", ")}</td>
            <td className="hidden md:table-cell text-xs">{p.phone}</td>
            <td className="hidden lg:table-cell text-xs">{p.address}</td>
            <td><div className="flex gap-2"><button className="w-7 h-7 grid place-items-center rounded-full bg-lama-sky"><Eye className="w-3.5 h-3.5"/></button><button className="w-7 h-7 grid place-items-center rounded-full bg-lama-purple"><Trash2 className="w-3.5 h-3.5"/></button></div></td>
          </tr>
        )}
      />
    </ListPage>
  );
}
