import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/CrudList";
export const Route = createFileRoute("/list/assignments")({
  component: () => (
    <CrudList
      table="assignments"
      title="Assignments"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "subject_id", label: "Subject", type: "subject" },
        { name: "class_id", label: "Class", type: "class" },
        { name: "teacher_id", label: "Teacher", type: "teacher" },
        { name: "due_date", label: "Due date", type: "date" },
      ]}
      columns={[
        { header: "Title", accessor: "title" },
        { header: "Subject", accessor: "subject" },
        { header: "Class", accessor: "class" },
        { header: "Teacher", accessor: "teacher" },
        { header: "Due", accessor: "due_date" },
      ]}
    />
  ),
});
