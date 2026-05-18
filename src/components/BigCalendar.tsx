import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { calendarEvents } from "@/lib/data";
const localizer = momentLocalizer(moment);
export function BigCalendar() {
  return (
    <Calendar
      localizer={localizer}
      events={calendarEvents}
      startAccessor="start"
      endAccessor="end"
      views={["work_week","day"]}
      defaultView={Views.WORK_WEEK}
      min={new Date(2026,0,1,8,0,0)}
      max={new Date(2026,0,1,17,0,0)}
      style={{ height: "98%" }}
    />
  );
}
