import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });

export const metadata = {
  title: 'AKSANA 29 - MAN Kapuas',
  description: 'Buku Tahunan Digital MAN Kapuas Angkatan ke-29',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${bebas.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
