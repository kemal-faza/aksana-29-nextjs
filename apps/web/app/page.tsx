import { apiGet } from '@/lib/api';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { BirthdayPopup } from '@/components/public/BirthdayPopup';
import { BirthdayCard } from '@/components/public/BirthdayCard';
import { SambutanCarousel } from '@/components/public/SambutanCarousel';
import { SudutSekolahCarousel } from '@/components/public/SudutSekolahCarousel';

export const dynamic = 'force-dynamic';

const NOOP_BIRTHDAYS: BirthdayResponse = { today: [], thisMonth: [] };

interface StudentsResponse {
  data: Array<{ id: string; nama: string; kelas: string }>;
  total: number;
}

interface BirthdayResponse {
  today: Array<{ id: string; nama: string; kelas: string; image_path: string | null }>;
  thisMonth: Array<{
    id: string;
    nama: string;
    kelas: string;
    image_path: string | null;
    tanggal: string;
  }>;
}

export default async function HomePage() {
  const [studentsRes, birthdayRes] = await Promise.allSettled([
    apiGet<StudentsResponse>('/api/public/students', { limit: '1' }),
    apiGet<BirthdayResponse>('/api/public/students/birthdays'),
  ]);

  const total =
    studentsRes.status === 'fulfilled' ? studentsRes.value.total : 0;
  const birthdayData =
    birthdayRes.status === 'fulfilled'
      ? birthdayRes.value
      : NOOP_BIRTHDAYS;

  return (
    <>
      <Hero />
      <About />
      <BirthdayCard students={birthdayData.thisMonth} />
      <SambutanCarousel />
      <SudutSekolahCarousel />
      <BirthdayPopup students={birthdayData.today} />
    </>
  );
}
