import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/CrudList";
export const Route = createFileRoute("/list/lessons")({
  component: () => (
    <CrudList
      table="lessons"
      title="Lessons"
      fields={[
        { name: "subject_id", label: "Subject", type: "subject", required: true },
        { name: "class_id", label: "Class", type: "class", required: true },
        { name: "teacher_id", label: "Teacher", type: "teacher" },
        { name: "day", label: "Day", type: "select", options: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
        { name: "start_time", label: "Start", type: "time" },
        { name: "end_time", label: "End", type: "time" },
      ]}
      columns={[
        { header: "Subject", accessor: "subject" },
        { header: "Class", accessor: "class" },
        { header: "Teacher", accessor: "teacher" },
        { header: "Day", accessor: "day" },
        { header: "Start", accessor: "start_time" },
      ]}
    />
  ),
});
