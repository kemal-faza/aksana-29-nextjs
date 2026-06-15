import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  judul: text('judul').notNull(),
  driveId: text('drive_id').notNull(),
  deskripsi: text('deskripsi'),
  urutan: integer('urutan').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
