export type Role = "admin" | "teacher" | "student" | "parent";

export const roleLinks: Record<Role, { label: string; href: string }[]> = {
  admin: [
    { label: "Home", href: "/admin" },
    { label: "Teachers", href: "/list/teachers" },
    { label: "Students", href: "/list/students" },
    { label: "Parents", href: "/list/parents" },
    { label: "Subjects", href: "/list/subjects" },
    { label: "Classes", href: "/list/classes" },
    { label: "Lessons", href: "/list/lessons" },
    { label: "Exams", href: "/list/exams" },
    { label: "Assignments", href: "/list/assignments" },
    { label: "Results", href: "/list/results" },
    { label: "Attendance", href: "/list/attendance" },
    { label: "Events", href: "/list/events" },
    { label: "Messages", href: "/list/messages" },
    { label: "Announcements", href: "/list/announcements" },
  ],
  teacher: [
    { label: "Home", href: "/teacher" },
    { label: "Lessons", href: "/list/lessons" },
    { label: "Classes", href: "/list/classes" },
    { label: "Students", href: "/list/students" },
    { label: "Exams", href: "/list/exams" },
    { label: "Assignments", href: "/list/assignments" },
    { label: "Results", href: "/list/results" },
    { label: "Attendance", href: "/list/attendance" },
    { label: "Events", href: "/list/events" },
    { label: "Announcements", href: "/list/announcements" },
  ],
  student: [
    { label: "Home", href: "/student" },
    { label: "Lessons", href: "/list/lessons" },
    { label: "Exams", href: "/list/exams" },
    { label: "Assignments", href: "/list/assignments" },
    { label: "Results", href: "/list/results" },
    { label: "Attendance", href: "/list/attendance" },
    { label: "Events", href: "/list/events" },
    { label: "Announcements", href: "/list/announcements" },
  ],
  parent: [
    { label: "Home", href: "/parent" },
    { label: "Children", href: "/list/students" },
    { label: "Exams", href: "/list/exams" },
    { label: "Results", href: "/list/results" },
    { label: "Attendance", href: "/list/attendance" },
    { label: "Events", href: "/list/events" },
    { label: "Announcements", href: "/list/announcements" },
  ],
};

export const teachersData = Array.from({ length: 12 }).map((_, i) => ({
  id: `T-${1000 + i}`,
  name: ["Aisha Hassan","John Carter","Maria Lopez","Ahmed Salah","Linh Tran","Sofia Rossi","David Kim","Fatima Noor","Lucas Martin","Yuki Tanaka","Omar Faruk","Emma Wilson"][i],
  email: `teacher${i + 1}@kaalik.edu`,
  photo: `https://i.pravatar.cc/100?img=${i + 5}`,
  phone: `+1 555 010${i.toString().padStart(2, "0")}`,
  subjects: ["Math","Biology","Physics","English","History","Art"].slice(0, (i % 3) + 1),
  classes: ["10A","9B","11C","8A"].slice(0, (i % 3) + 1),
  address: "123 Maple Street",
}));

export const studentsData = Array.from({ length: 16 }).map((_, i) => ({
  id: `S-${2000 + i}`,
  name: ["Ali Yusuf","Sara Khan","Liam Brown","Olivia Davis","Noah Smith","Mia Johnson","Amir Ali","Zara Iqbal","Mason Lee","Ava Garcia","Ethan Park","Isabella Cruz","Logan Hall","Chloe Reed","Daniel Wood","Lily Cole"][i],
  email: `student${i + 1}@kaalik.edu`,
  photo: `https://i.pravatar.cc/100?img=${i + 20}`,
  phone: `+1 555 020${i.toString().padStart(2, "0")}`,
  grade: ["10A","9B","11C","8A"][i % 4],
  class: ["10A","9B","11C","8A"][i % 4],
  address: "98 Oak Avenue",
}));

export const parentsData = Array.from({ length: 10 }).map((_, i) => ({
  id: `P-${3000 + i}`,
  name: ["Mr. Hassan","Mrs. Carter","Mrs. Lopez","Mr. Salah","Mrs. Tran","Mr. Rossi","Mrs. Kim","Mr. Noor","Mrs. Martin","Mr. Tanaka"][i],
  email: `parent${i + 1}@kaalik.com`,
  phone: `+1 555 030${i.toString().padStart(2, "0")}`,
  students: [studentsData[i].name, studentsData[(i + 1) % studentsData.length].name],
  address: "23 Pine Road",
}));

export const subjectsData = ["Math","Biology","Physics","Chemistry","English","History","Geography","Art","Music","PE"].map((s, i) => ({
  id: i + 1,
  name: s,
  teachers: teachersData.slice(i % 4, (i % 4) + 2).map((t) => t.name),
}));

export const classesData = ["10A","9B","11C","8A","7D","12A"].map((c, i) => ({
  id: i + 1,
  name: c,
  capacity: 25 + (i % 5),
  grade: parseInt(c),
  supervisor: teachersData[i].name,
}));

export const lessonsData = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  subject: subjectsData[i % subjectsData.length].name,
  class: classesData[i % classesData.length].name,
  teacher: teachersData[i % teachersData.length].name,
}));

export const examsData = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  subject: subjectsData[i % subjectsData.length].name,
  class: classesData[i % classesData.length].name,
  teacher: teachersData[i % teachersData.length].name,
  date: `2026-05-${(10 + i).toString().padStart(2, "0")}`,
}));

export const assignmentsData = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  subject: subjectsData[i % subjectsData.length].name,
  class: classesData[i % classesData.length].name,
  teacher: teachersData[i % teachersData.length].name,
  dueDate: `2026-05-${(15 + i).toString().padStart(2, "0")}`,
}));

export const resultsData = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  subject: subjectsData[i % subjectsData.length].name,
  student: studentsData[i % studentsData.length].name,
  teacher: teachersData[i % teachersData.length].name,
  class: classesData[i % classesData.length].name,
  type: i % 2 === 0 ? "Exam" : "Assignment",
  date: `2026-05-${(5 + i).toString().padStart(2, "0")}`,
  score: 60 + ((i * 7) % 40),
}));

export const attendanceData = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  student: studentsData[i % studentsData.length].name,
  class: classesData[i % classesData.length].name,
  date: `2026-05-${(1 + i).toString().padStart(2, "0")}`,
  present: i % 4 !== 0,
}));

export const eventsData = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  title: ["Science Fair","Parent-Teacher Meeting","Sports Day","Art Exhibition","Field Trip","Graduation"][i],
  class: ["All","10A","9B","All","11C","12A"][i],
  date: `2026-05-${(8 + i * 3).toString().padStart(2, "0")}`,
  startTime: `${9 + i}:00`,
  endTime: `${11 + i}:00`,
  description: "Don't miss this important school event.",
}));

export const announcementsData = Array.from({ length: 5 }).map((_, i) => ({
  id: i + 1,
  title: ["Library closed Friday","New cafeteria menu","Mid-term schedule","Uniform reminder","Holiday notice"][i],
  class: ["All","10A","9B","All","All"][i],
  date: `2026-05-${(2 + i * 2).toString().padStart(2, "0")}`,
  description: "Please read this announcement carefully and inform other students.",
}));

export const messagesData = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  from: teachersData[i % teachersData.length].name,
  to: studentsData[i % studentsData.length].name,
  subject: ["Homework reminder","Great work!","Absent today","Project deadline","Meeting","Test prep"][i],
  date: `2026-05-${(3 + i).toString().padStart(2, "0")}`,
}));

// Calendar (BigCalendar) events for current week
const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
function at(dayOffset: number, h: number, m = 0) {
  const d = new Date(monday); d.setDate(monday.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d;
}
export const calendarEvents = [
  { title: "Math", start: at(0, 8), end: at(0, 9) },
  { title: "English", start: at(0, 10), end: at(0, 11) },
  { title: "Biology", start: at(1, 9), end: at(1, 10) },
  { title: "Physics", start: at(1, 11), end: at(1, 12) },
  { title: "History", start: at(2, 8, 30), end: at(2, 9, 30) },
  { title: "Art", start: at(2, 13), end: at(2, 14) },
  { title: "PE", start: at(3, 9), end: at(3, 10) },
  { title: "Chemistry", start: at(3, 11), end: at(3, 12) },
  { title: "Music", start: at(4, 10), end: at(4, 11) },
  { title: "Geography", start: at(4, 13), end: at(4, 14) },
];

export const performanceData = [
  { name: "1st", student: 78 }, { name: "2nd", student: 85 },
  { name: "3rd", student: 82 }, { name: "4th", student: 90 },
];
