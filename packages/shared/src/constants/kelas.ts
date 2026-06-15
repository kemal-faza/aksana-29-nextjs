export const KELAS_LIST = [
  'XII IPA 1',
  'XII IPA 2',
  'XII IPA 3',
  'XII IPA 4',
  'XII IPS 1',
  'XII IPS 2',
  'XII IPS 3',
  'XII PAI',
] as const;

export type Kelas = (typeof KELAS_LIST)[number];

export const KELAS_REGEX = /^XII (IPA [1-4]|IPS [1-3]|PAI)$/;
