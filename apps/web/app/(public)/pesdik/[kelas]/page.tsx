'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { StudentCard } from '@/components/public/StudentCard';
import { StudentModal } from '@/components/public/StudentModal';
import { SearchBar } from '@/components/public/SearchBar';
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
    <main className="container mx-auto px-16 py-24">
      <h1 className="text-2xl lg:text-3xl font-bold uppercase text-primary">
        {kelas || slug}
      </h1>

      <div className="mt-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari siswa..."
        />
      </div>

      {loading ? (
        <p className="mt-6 text-ink-mute">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-ink-mute">Tidak ada siswa ditemukan.</p>
      ) : (
        <div className="mt-6 flex flex-wrap">
          {filtered.map((s) => (
            <div key={s.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
              <StudentCard student={s} onClick={setSelected} />
            </div>
          ))}
        </div>
      )}

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
