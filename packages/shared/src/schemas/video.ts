import { z } from 'zod';

export const VideoDbSchema = z.object({
  id: z.string().uuid(),
  judul: z.string().min(1),
  drive_id: z.string().min(1),
  deskripsi: z.string().nullable(),
  urutan: z.number().int().positive(),
  is_active: z.boolean(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type VideoDb = z.infer<typeof VideoDbSchema>;

export const VideoPublicSchema = VideoDbSchema.omit({ is_active: true, created_at: true, updated_at: true });
export type VideoPublic = z.infer<typeof VideoPublicSchema>;
