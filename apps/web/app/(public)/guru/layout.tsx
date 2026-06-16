import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guru - AKSANA 29',
  description: 'Daftar guru MAN Kapuas. Kenali para pendidik yang telah membimbing angkatan ke-29.',
  openGraph: {
    title: 'Guru - AKSANA 29',
    description: 'Daftar guru MAN Kapuas',
  },
};

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
