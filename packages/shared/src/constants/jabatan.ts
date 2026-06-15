/**
 * Priority order for teacher jabatan (ascending).
 * Lower number = higher priority (displayed first).
 */
export const JABATAN_PRIORITY: [string, number][] = [
  ['Kepala Madrasah', 1],
  ['Wakamad', 2],
  ['Kepala TU', 3],
  ['Wali Kelas', 4],
  ['Guru Mapel', 5],
  ['Guru BK', 6],
  ['Pustakawan', 7],
  ['Staff TU', 8],
];

export const JABATAN_LIST = JABATAN_PRIORITY.map(([j]) => j);

/** Student class officer positions (from CONTEXT.md vocabulary) */
export const JABATAN_SISWA = [
  'Ketua Kelas',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Anggota',
] as const;

export type JabatanSiswa = (typeof JABATAN_SISWA)[number];
