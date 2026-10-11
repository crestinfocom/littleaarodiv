/**
 * Tables mirrored from Neon into the local Docker Postgres.
 * The schema (local-dev/init/01-schema.sql) sets an `updated_at` column and
 * a stable primary key on every table so syncs advance an incremental cursor.
 */
export const SYNC_TABLES = [
  { name: 'programs', pk: ['id'] },
  { name: 'gallery', pk: ['id'] },
  { name: 'events', pk: ['id'] },
  { name: 'notices', pk: ['id'] },
  { name: 'messages', pk: ['id'] },
  { name: 'students', pk: ['id'] },
  { name: 'staff', pk: ['id'] },
  { name: 'inquiries', pk: ['id'] },
  { name: 'attendance', pk: ['record_date', 'student_id'] },
  { name: 'fees', pk: ['id'] },
  { name: 'daily_reports', pk: ['id'] },
  { name: 'users', pk: ['id'] },
  { name: 'settings', pk: ['id'] },
];

export const SYNC_META_KEY = '*';
/** Arbitrary but stable advisory-lock key so two processes never sync at once. */
export const SYNC_LOCK_KEY = 7_426_509_05;