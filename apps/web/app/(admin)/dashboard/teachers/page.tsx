'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/admin/DataTable';
import { adminGet, adminDelete } from '@/lib/admin-api';
import { JABATAN_PRIORITY } from '@aksana/shared';

const PRIORITY_MAP = Object.fromEntries(JABATAN_PRIORITY);

interface Teacher {
  id: string;
  nama: string;
  jabatan: string;
  mapel: string[];
  ekstra: string | null;
  urutan: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      
      const res = await adminGet<{ data: Teacher[]; total: number }>(
        `/api/admin/teachers?${params}`
      );
      
      // Sort by JABATAN_PRIORITY then by nama
      const sorted = [...res.data].sort((a, b) => {
        const pa = PRIORITY_MAP[a.jabatan] ?? 99;
        const pb = PRIORITY_MAP[b.jabatan] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.nama.localeCompare(b.nama);
      });
      
      setTeachers(sorted);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleDelete = async (id: string) => {
    await adminDelete(`/api/admin/teachers/${id}`);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const columns: Column<Teacher>[] = [
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan' },
    {
      key: 'mapel',
      label: 'Mapel',
      render: (t) => t.mapel?.join(', ') || '-',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-primary">Data Guru</h1>
        <Link
          href="/dashboard/teachers/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Tambah Guru
        </Link>
      </div>

      <DataTable<Teacher>
        columns={columns}
        data={teachers}
        loading={loading}
        searchPlaceholder="Cari nama guru..."
        searchValue={search}
        onSearch={setSearch}
        basePath="/dashboard/teachers"
        onDelete={handleDelete}
        emptyMessage="Belum ada data guru"
      />
    </div>
  );
}
