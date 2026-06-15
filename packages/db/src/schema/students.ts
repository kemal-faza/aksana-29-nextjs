import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  kelas: text('kelas').notNull(),
  jabatan: text('jabatan'),
  imagePath: text('image_path'),
  kesan: text('kesan'),
  pesan: text('pesan'),
  ttl: date('ttl'),
  ekstra: text('ekstra'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});
