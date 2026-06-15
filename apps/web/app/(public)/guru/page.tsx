'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import type { TeacherPublic } from '@aksana/shared';

export default function GuruPage() {
  const [teachers, setTeachers] = useState<TeacherPublic[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiGet<{ data: TeacherPublic[] }>('/api/public/teachers', { limit: '100' })
      .then(res => setTeachers(res.data));
  }, []);

  const filtered = teachers.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase())
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
      <div className="mt-6 grid gap-4">
        {filtered.map(t => (
          <div key={t.id} className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold">{t.nama}</h2>
            <p className="text-sm text-gray-600">{t.jabatan}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
