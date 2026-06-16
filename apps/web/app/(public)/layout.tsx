import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AKSANA 29 - MAN Kapuas',
  description: 'Buku Tahunan Digital MAN Kapuas Angkatan ke-29. Lihat profil siswa, guru, galeri video, dan sudut sekolah.',
  openGraph: {
    title: 'AKSANA 29 - MAN Kapuas',
    description: 'Buku Tahunan Digital MAN Kapuas Angkatan ke-29',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
