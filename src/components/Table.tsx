import { ReactNode } from "react";
export function Table<T>({ columns, data, renderRow }: { columns: { header: string; accessor: string; className?: string }[]; data: T[]; renderRow: (item: T) => ReactNode; }) {
  return (
    <table className="w-full mt-4 text-sm">
      <thead><tr className="text-left text-muted-foreground">{columns.map((c) => <th key={c.accessor} className={`py-3 font-medium ${c.className ?? ""}`}>{c.header}</th>)}</tr></thead>
      <tbody>{data.map(renderRow)}</tbody>
    </table>
  );
}
