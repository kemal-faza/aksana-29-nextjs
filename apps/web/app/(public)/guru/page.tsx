'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { TeacherCard } from '@/components/public/TeacherCard';
import { TeacherModal } from '@/components/public/TeacherModal';
import { JABATAN_PRIORITY } from '@aksana/shared';
import type { TeacherPublic } from '@aksana/shared';

const PRIORITY_MAP = Object.fromEntries(JABATAN_PRIORITY);

export default function GuruPage() {
  const [teachers, setTeachers] = useState<TeacherPublic[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TeacherPublic | null>(null);

  useEffect(() => {
    apiGet<{ data: TeacherPublic[] }>('/api/public/teachers', { limit: '100' })
      .then(res => setTeachers(res.data));
  }, []);

  const filtered = teachers.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Group by jabatan using JABATAN_PRIORITY order
  const grouped = filtered.reduce((acc, t) => {
    const key = t.jabatan || 'Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, TeacherPublic[]>);

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => (PRIORITY_MAP[a] ?? 99) - (PRIORITY_MAP[b] ?? 99)
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-heading text-primary">Guru</h1>
      <input
        type="search"
        placeholder="Cari guru..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mt-4 w-full p-2 border rounded"
      />
      <div className="mt-6 space-y-8">
        {sortedGroups.map(([jabatan, list]) => (
          <div key={jabatan}>
            <h2 className="text-xl font-heading text-tersier mb-4">{jabatan}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {list.map(t => (
                <TeacherCard key={t.id} teacher={t} onClick={() => setSelected(t)} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && <TeacherModal teacher={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
