-- =====================================================================
-- Little Aarodiv - local mirror schema
-- Mirrors the Neon source-of-truth schema so rows can be upserted 1:1.
-- Every table carries `updated_at` so incremental syncs can use a cursor.
-- =====================================================================

-- Keep updated_at in sync on every write (works on both local & Neon).
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- Public site / CMS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  age         text,
  timing      text,
  fee         integer DEFAULT 0,
  capacity    integer DEFAULT 0,
  img         text,
  status      text DEFAULT 'Active',
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_programs_updated BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS gallery (
  id         text PRIMARY KEY,
  title      text NOT NULL,
  category   text,
  url        text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_gallery_updated BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS events (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  date        date,
  time        text,
  audience    text,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS notices (
  id         text PRIMARY KEY,
  title      text NOT NULL,
  body       text,
  date       date,
  audience   text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_notices_updated BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS messages (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  email      text,
  phone      text,
  subject    text,
  message    text,
  date       date,
  read       boolean DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_messages_updated BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- CRM / operations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  gender     text,
  program    text,
  parent     text,
  dob        date,
  phone      text,
  email      text,
  joined     date,
  allergies  text,
  status     text DEFAULT 'Active',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_students_program ON students(program);
CREATE INDEX IF NOT EXISTS idx_students_updated ON students(updated_at);
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS staff (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  role       text,
  program    text,
  phone      text,
  email      text,
  joined     date,
  status     text DEFAULT 'Active',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_program ON staff(program);
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS inquiries (
  id         text PRIMARY KEY,
  child      text,
  age        text,
  parent     text,
  phone      text,
  email      text,
  program    text,
  date       date,
  status     text DEFAULT 'New',
  notes      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE TRIGGER trg_inquiries_updated BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS attendance (
  record_date date NOT NULL,
  student_id  text NOT NULL,
  status      text,               -- 'P' | 'A'
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (record_date, student_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS fees (
  id         text PRIMARY KEY,
  student_id text NOT NULL,
  month      text,                -- 'YYYY-MM'
  amount     integer DEFAULT 0,
  due        date,
  status     text DEFAULT 'Pending',
  paid_on    date,
  mode       text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_month ON fees(month);
CREATE TRIGGER trg_fees_updated BEFORE UPDATE ON fees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS daily_reports (
  id         text PRIMARY KEY,
  student_id text NOT NULL,
  date       date,
  meals      text,
  nap        text,
  mood       text,
  activities text,
  note       text,
  teacher    text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_daily_reports_student ON daily_reports(student_id);
CREATE TRIGGER trg_daily_reports_updated BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Auth / portal
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         text PRIMARY KEY,
  email      text NOT NULL UNIQUE,
  pass       text NOT NULL,
  role       text NOT NULL,
  name       text,
  program    text,
  student_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS settings (
  id       integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name     text,
  tagline  text,
  phone    text,
  email    text,
  address  text,
  hours    text,
  ratio    text,
  session  text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Sync bookkeeping (substantially reduces Neon round-trips)
--   * one row per mirrored table stores the incremental `updated_at` cursor
--   * the '*' row tracks the global "last synced" timestamp for the TTL gate
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_state (
  table_name     text PRIMARY KEY,
  last_cursor    text,              -- JSON array: [iso_updated_at, ...pk values]
  last_synced_at timestamptz,
  rows_synced    integer DEFAULT 0
);