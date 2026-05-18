import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { studentsData } from "@/lib/data";
import { Eye, Trash2 } from "lucide-react";
export const Route = createFileRoute("/list/students")({ component: Page });
function Page() {
  return (
    <ListPage title="All Students">
      <Table
        columns={[{header:"Info",accessor:"info"},{header:"Student ID",accessor:"id",className:"hidden md:table-cell"},{header:"Grade",accessor:"grade",className:"hidden md:table-cell"},{header:"Phone",accessor:"phone",className:"hidden lg:table-cell"},{header:"Address",accessor:"address",className:"hidden lg:table-cell"},{header:"Actions",accessor:"actions"}]}
        data={studentsData}
        renderRow={(s) => (
          <tr key={s.id} className="border-t hover:bg-lama-purple-light/40">
            <td className="py-3 flex items-center gap-3"><img src={s.photo} className="w-10 h-10 rounded-full object-cover" /><div><div className="font-medium text-sm">{s.name}</div><div className="text-xs text-muted-foreground">{s.class}</div></div></td>
            <td className="hidden md:table-cell text-xs">{s.id}</td>
            <td className="hidden md:table-cell text-xs">{s.grade}</td>
            <td className="hidden lg:table-cell text-xs">{s.phone}</td>
            <td className="hidden lg:table-cell text-xs">{s.address}</td>
            <td><div className="flex gap-2"><button className="w-7 h-7 grid place-items-center rounded-full bg-lama-sky"><Eye className="w-3.5 h-3.5"/></button><button className="w-7 h-7 grid place-items-center rounded-full bg-lama-purple"><Trash2 className="w-3.5 h-3.5"/></button></div></td>
          </tr>
        )}
      />
    </ListPage>
  );
}
