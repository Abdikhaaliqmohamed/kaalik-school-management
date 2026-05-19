import type { Database } from "@/integrations/supabase/types";
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type TeacherInsert = Database["public"]["Tables"]["teachers"]["Insert"];
export type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
export type ParentRow = Database["public"]["Tables"]["parents"]["Row"];
export type SubjectRow = Database["public"]["Tables"]["subjects"]["Row"];
export type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"];