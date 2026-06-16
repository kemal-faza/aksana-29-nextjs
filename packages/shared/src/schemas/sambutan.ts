import { z } from 'zod';

export const SambutanDbSchema = z.object({
  id: z.string().uuid(),
  nama: z.string().min(1),
  jabatan: z.string(),
  image_path: z.string().nullable(),
  isi: z.string(),
  urutan: z.number().int().positive(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type SambutanDb = z.infer<typeof SambutanDbSchema>;

export const SambutanPublicSchema = SambutanDbSchema.omit({ is_active: true, created_at: true, updated_at: true });
export type SambutanPublic = z.infer<typeof SambutanPublicSchema>;
