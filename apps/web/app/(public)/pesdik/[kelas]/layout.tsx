import type { Metadata } from 'next';

const SLUG_TO_KELAS: Record<string, string> = {
  'xii-ipa-1': 'XII IPA 1',
  'xii-ipa-2': 'XII IPA 2',
  'xii-ipa-3': 'XII IPA 3',
  'xii-ipa-4': 'XII IPA 4',
  'xii-ips-1': 'XII IPS 1',
  'xii-ips-2': 'XII IPS 2',
  'xii-ips-3': 'XII IPS 3',
  'xii-pai': 'XII PAI',
};

export async function generateMetadata({ params }: { params: { kelas: string } }): Promise<Metadata> {
  const kelas = SLUG_TO_KELAS[params.kelas] || params.kelas;
  return {
    title: `Kelas ${kelas} - AKSANA 29`,
    description: `Daftar siswa kelas ${kelas} MAN Kapuas angkatan ke-29. Lihat profil, kesan, dan pesan setiap siswa.`,
    openGraph: {
      title: `Kelas ${kelas} - AKSANA 29`,
      description: `Daftar siswa kelas ${kelas} MAN Kapuas angkatan ke-29`,
    },
  };
}

export default function PesdikKelasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
