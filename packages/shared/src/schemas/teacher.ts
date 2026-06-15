import { z } from 'zod';

export const TeacherDbSchema = z.object({
  id: z.string().uuid(),
  nama: z.string().min(1),
  jabatan: z.string(),
  mapel: z.array(z.string()).nullable(),
  image_path: z.string().nullable(),
  ekstra: z.string().nullable(),
  urutan: z.number().int().positive(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type TeacherDb = z.infer<typeof TeacherDbSchema>;

export const TeacherPublicSchema = TeacherDbSchema.omit({ created_at: true, updated_at: true });
export type TeacherPublic = z.infer<typeof TeacherPublicSchema>;
