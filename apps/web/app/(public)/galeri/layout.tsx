import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Galeri - AKSANA 29',
  description: 'Video kenangan angkatan ke-29 MAN Kapuas. Tonton video perpisahan dan momen-momen berharga.',
  openGraph: {
    title: 'Galeri - AKSANA 29',
    description: 'Video kenangan angkatan ke-29 MAN Kapuas',
  },
};

export default function GaleriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
