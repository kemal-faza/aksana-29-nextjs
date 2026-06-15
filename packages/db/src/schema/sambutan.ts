import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const sambutan = pgTable('sambutan', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  jabatan: text('jabatan').notNull(),
  imagePath: text('image_path'),
  isi: text('isi').notNull(),
  urutan: integer('urutan').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
