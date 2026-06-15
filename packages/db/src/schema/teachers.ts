import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const teachers = pgTable('teachers', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  jabatan: text('jabatan').notNull(),
  mapel: text('mapel').array(),
  imagePath: text('image_path'),
  ekstra: text('ekstra'),
  urutan: integer('urutan').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
