'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { TeacherCard } from '@/components/public/TeacherCard';
import { TeacherModal } from '@/components/public/TeacherModal';
import { SearchBar } from '@/components/public/SearchBar';
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
    <main className="container mx-auto px-16 py-24">
      <h1 className="text-2xl lg:text-3xl font-bold uppercase text-primary">Guru</h1>
      <div className="mt-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari guru..."
        />
      </div>
      <div className="mt-6 space-y-8">
        {sortedGroups.map(([jabatan, list]) => (
          <div key={jabatan}>
            <h2 className="text-2xl font-bold uppercase text-primary mb-4">{jabatan}</h2>
            <div className="flex flex-wrap">
              {list.map(t => (
                <div key={t.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
                  <TeacherCard teacher={t} onClick={() => setSelected(t)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && <TeacherModal teacher={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
