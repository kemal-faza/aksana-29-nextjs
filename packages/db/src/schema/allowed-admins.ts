import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const allowedAdmins = pgTable('allowed_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
  deactivatedBy: uuid('deactivated_by'),
});

export type AllowedAdmin = typeof allowedAdmins.$inferSelect;
export type NewAllowedAdmin = typeof allowedAdmins.$inferInsert;
