import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const sudutSekolah = pgTable('sudut_sekolah', {
  id: uuid('id').primaryKey().defaultRandom(),
  imagePath: text('image_path').notNull(),
  caption: text('caption'),
  urutan: integer('urutan').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
