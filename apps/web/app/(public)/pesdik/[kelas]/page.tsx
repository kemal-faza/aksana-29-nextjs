'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { StudentCard } from '@/components/public/StudentCard';
import { StudentModal } from '@/components/public/StudentModal';
import type { StudentPublic } from '@aksana/shared';

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

const KELAS_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_KELAS).map(([slug, kelas]) => [kelas, slug])
);

export default function PesdikPage() {
  const params = useParams();
  const slug = params.kelas as string;
  const kelas = SLUG_TO_KELAS[slug] || '';

  const [students, setStudents] = useState<StudentPublic[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StudentPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kelas) return;
    setLoading(true);
    apiGet<{ data: StudentPublic[] }>('/api/public/students', { kelas })
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  }, [kelas]);

  const filtered = students.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-heading text-primary">{kelas || slug}</h1>

      <input
        type="search"
        placeholder="Cari siswa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full p-2 border rounded"
      />

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-gray-500">Tidak ada siswa ditemukan.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((s) => (
            <StudentCard key={s.id} student={s} onClick={setSelected} />
          ))}
        </div>
      )}

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
