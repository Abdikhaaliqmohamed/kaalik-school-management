
-- =========================================================
-- 1. NEW TABLES
-- =========================================================

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg read own" ON public.messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "msg send as self" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "msg mark read" ON public.messages FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid() OR has_role(auth.uid(),'admin'))
  WITH CHECK (recipient_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "msg delete own" ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id, created_at DESC);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read own" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "notif insert any" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "notif mark read own" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif delete own" ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);

-- Trigger: when a message is inserted, create a notification for the recipient
CREATE OR REPLACE FUNCTION public.fn_notify_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE sname text;
BEGIN
  SELECT full_name INTO sname FROM public.profiles WHERE id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (NEW.recipient_id, 'message',
          'New message from ' || COALESCE(sname,'a user'),
          COALESCE(NEW.subject, left(NEW.body, 80)),
          '/list/messages');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_on_message ON public.messages;
CREATE TRIGGER trg_notify_on_message AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_message();

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  start_time time,
  end_time time,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events read" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events admin write" ON public.events FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher'));

-- ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assn read" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "assn write" ON public.assignments FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher'));

-- LESSONS
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  day text,
  start_time time,
  end_time time,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons read" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "lessons write" ON public.lessons FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher'));

-- =========================================================
-- 2. REPLACE DUPLICATE STUDENT NAMES WITH UNIQUE SOMALI NAMES
-- =========================================================
WITH firsts AS (
  SELECT unnest(ARRAY['Ahmed','Mohamed','Abdullahi','Omar','Yusuf','Ibrahim','Ismail','Khalid','Said','Bashir',
    'Hassan','Hussein','Ali','Abdirahman','Abdiqadir','Abdiwahab','Abdiaziz','Mahad','Mahdi','Mustafa',
    'Nuh','Salah','Sharmarke','Suleiman','Tahlil','Warsame','Yahya','Zakaria','Liban','Farah',
    'Aaden','Adan','Anwar','Bilal','Daud','Dahir','Diriye','Faisal','Geedi','Guled',
    'Hamza','Ilyas','Jama','Jibril','Kahin','Maxamed','Nasir','Osman','Qasim','Rashid',
    'Amina','Asha','Aisha','Anab','Bisharo','Deeqa','Faadumo','Fatima','Filsan','Halima',
    'Hamdi','Hawo','Hibo','Hodan','Idil','Iqra','Khadijo','Layla','Leyla','Lul',
    'Maryan','Munira','Nasteexo','Naima','Nimo','Qamar','Rahma','Saynab','Shukri','Sumaya',
    'Ubah','Warsan','Yasmin','Zahra','Zamzam'
  ]) AS n, generate_series(1,1) g
),
fathers AS (
  SELECT unnest(ARRAY['Abdullahi','Mohamed','Ahmed','Omar','Yusuf','Hassan','Ibrahim','Hussein','Ali','Said',
    'Khalid','Ismail','Bashir','Farah','Warsame','Nur','Diriye','Jama','Osman','Adan',
    'Geedi','Kahin','Salah','Sharif','Tahlil','Aaden','Daud','Dahir','Geele','Hashi',
    'Jibril','Liban','Maxamed','Mustaf','Qasim','Rashid','Sahal','Suleiman','Yahya','Zakaria'
  ]) AS n
),
grands AS (
  SELECT unnest(ARRAY['Warsame','Nur','Hashi','Geedi','Jama','Diriye','Osman','Farah','Kahin','Aden',
    'Hirsi','Dualeh','Galaydh','Samatar','Roble','Cabdi','Elmi','Guled','Ismail','Korfa',
    'Mire','Olad','Qalbi','Sugulle','Yare','Beyle','Caydid','Doodi','Farole','Gureh'
  ]) AS n
),
combos AS (
  SELECT f.n AS first_n, fa.n AS father_n, g.n AS grand_n,
         row_number() OVER (ORDER BY random()) AS rn
  FROM firsts f CROSS JOIN fathers fa CROSS JOIN grands g
),
ordered_students AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM public.students
),
assign AS (
  SELECT s.id, c.first_n || ' ' || c.father_n || ' ' || c.grand_n AS new_name,
         lower(c.first_n) || '.' || lower(c.father_n) || s.rn::text || '@kaalik.edu.so' AS new_email
  FROM ordered_students s JOIN combos c USING (rn)
)
UPDATE public.students s
SET name = a.new_name,
    email = a.new_email
FROM assign a
WHERE s.id = a.id;
