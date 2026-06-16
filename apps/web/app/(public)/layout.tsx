import type { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';

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
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
