import { ReactNode } from "react";
import { TableHeader } from "./TableHeader";
import { Pagination } from "./Pagination";
export function ListPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <TableHeader title={title} />
      {children}
      <Pagination />
    </div>
  );
}
