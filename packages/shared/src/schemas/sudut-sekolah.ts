import { z } from 'zod';

export const SudutSekolahDbSchema = z.object({
  id: z.string().uuid(),
  image_path: z.string(),
  caption: z.string().nullable(),
  urutan: z.number().int().positive(),
  is_active: z.boolean(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type SudutSekolahDb = z.infer<typeof SudutSekolahDbSchema>;

export const SudutSekolahPublicSchema = SudutSekolahDbSchema.omit({ is_active: true, created_at: true, updated_at: true });
export type SudutSekolahPublic = z.infer<typeof SudutSekolahPublicSchema>;
