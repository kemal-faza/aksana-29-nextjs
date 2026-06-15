import { apiGet } from '@/lib/api';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { BirthdayPopup } from '@/components/public/BirthdayPopup';
import { BirthdayCard } from '@/components/public/BirthdayCard';

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
  const [{ total }, birthdayData] = await Promise.all([
    apiGet<StudentsResponse>('/api/public/students', { limit: '1' }),
    apiGet<BirthdayResponse>('/api/public/students/birthdays'),
  ]);

  return (
    <>
      <Hero />
      <About />
      <BirthdayCard students={birthdayData.thisMonth} />
      <BirthdayPopup students={birthdayData.today} />
      <p className="text-center py-4">Total siswa: {total}</p>
    </>
  );
}
