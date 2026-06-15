import { z } from 'zod';
import { KELAS_REGEX } from '../constants/kelas';

export const StudentDbSchema = z.object({
  id: z.string().uuid(),
  nama: z.string().min(1),
  kelas: z.string().regex(KELAS_REGEX),
  jabatan: z.string().nullable(),
  image_path: z.string().nullable(),
  kesan: z.string().nullable(),
  pesan: z.string().nullable(),
  ttl: z.string().date().nullable(),
  ekstra: z.string().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid().nullable().optional(),
  updated_by: z.string().uuid().nullable().optional(),
});
export type StudentDb = z.infer<typeof StudentDbSchema>;

export const StudentPublicSchema = StudentDbSchema.omit({ ttl: true });
export type StudentPublic = z.infer<typeof StudentPublicSchema>;

export const StudentBirthdaySchema = z.object({
  id: z.string().uuid(),
  nama: z.string(),
  kelas: z.string(),
  image_path: z.string().nullable(),
  tanggal: z.string(),
});
export type StudentBirthday = z.infer<typeof StudentBirthdaySchema>;
