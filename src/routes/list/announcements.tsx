import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/CrudList";
export const Route = createFileRoute("/list/announcements")({
  component: () => (
    <CrudList
      table="announcements"
      title="Announcements"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "class_id", label: "Class", type: "class" },
        { name: "date", label: "Date", type: "date", required: true },
      ]}
      columns={[
        { header: "Title", accessor: "title" },
        { header: "Class", accessor: "class" },
        { header: "Date", accessor: "date" },
      ]}
    />
  ),
});
