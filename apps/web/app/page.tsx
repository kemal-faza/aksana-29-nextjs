import { apiGet } from '@/lib/api';

interface StudentsResponse {
  data: Array<{ id: string; nama: string; kelas: string }>;
  total: number;
}

export default async function HomePage() {
  const { total } = await apiGet<StudentsResponse>('/api/public/students', { limit: '1' });

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-heading text-primary">AKSANA 29</h1>
        <p className="mt-4 text-secondary">Total siswa: {total}</p>
      </div>
    </main>
  );
}
