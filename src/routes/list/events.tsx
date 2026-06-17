import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/CrudList";
export const Route = createFileRoute("/list/events")({
  component: () => (
    <CrudList
      table="events"
      title="Events"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "class_id", label: "Class", type: "class" },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "start_time", label: "Start time", type: "time" },
        { name: "end_time", label: "End time", type: "time" },
      ]}
      columns={[
        { header: "Title", accessor: "title" },
        { header: "Class", accessor: "class" },
        { header: "Date", accessor: "date" },
        { header: "Start", accessor: "start_time" },
        { header: "End", accessor: "end_time" },
      ]}
    />
  ),
});
