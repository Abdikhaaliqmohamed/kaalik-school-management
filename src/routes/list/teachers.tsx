import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/components/ListPage";
import { Table } from "@/components/Table";
import { teachersData } from "@/lib/data";
import { Eye, Trash2 } from "lucide-react";
export const Route = createFileRoute("/list/teachers")({ component: Page });
function Page() {
  return (
    <ListPage title="All Teachers">
      <Table
        columns={[{header:"Info",accessor:"info"},{header:"Teacher ID",accessor:"id",className:"hidden md:table-cell"},{header:"Subjects",accessor:"subjects",className:"hidden md:table-cell"},{header:"Classes",accessor:"classes",className:"hidden md:table-cell"},{header:"Phone",accessor:"phone",className:"hidden lg:table-cell"},{header:"Actions",accessor:"actions"}]}
        data={teachersData}
        renderRow={(t) => (
          <tr key={t.id} className="border-t hover:bg-lama-purple-light/40">
            <td className="py-3 flex items-center gap-3"><img src={t.photo} className="w-10 h-10 rounded-full object-cover" /><div><div className="font-medium text-sm">{t.name}</div><div className="text-xs text-muted-foreground">{t.email}</div></div></td>
            <td className="hidden md:table-cell text-xs">{t.id}</td>
            <td className="hidden md:table-cell text-xs">{t.subjects.join(", ")}</td>
            <td className="hidden md:table-cell text-xs">{t.classes.join(", ")}</td>
            <td className="hidden lg:table-cell text-xs">{t.phone}</td>
            <td><div className="flex gap-2"><button className="w-7 h-7 grid place-items-center rounded-full bg-lama-sky"><Eye className="w-3.5 h-3.5"/></button><button className="w-7 h-7 grid place-items-center rounded-full bg-lama-purple"><Trash2 className="w-3.5 h-3.5"/></button></div></td>
          </tr>
        )}
      />
    </ListPage>
  );
}
