'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/admin/DataTable';
import { adminGet, adminDelete } from '@/lib/admin-api';

interface Student {
  id: string;
  nama: string;
  kelas: string;
  jabatan: string | null;
  image_path: string | null;
  ttl: string | null;
  ekstra: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '300' });
      if (search) params.set('search', search);
      if (kelasFilter) params.set('kelas', kelasFilter);
      
      const res = await adminGet<{ data: Student[]; total: number }>(
        `/api/admin/students?${params}`
      );
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, kelasFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id: string) => {
    await adminDelete(`/api/admin/students/${id}`);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const columns: Column<Student>[] = [
    { key: 'nama', label: 'Nama' },
    { key: 'kelas', label: 'Kelas' },
    {
      key: 'jabatan',
      label: 'Jabatan',
      render: (s) => s.jabatan || '-',
    },
    {
      key: 'ttl',
      label: 'Tgl Lahir',
      render: (s) => s.ttl || '-',
    },
  ];

  const kelasOptions = [
    'XII IPA 1', 'XII IPA 2', 'XII IPA 3', 'XII IPA 4',
    'XII IPS 1', 'XII IPS 2', 'XII IPS 3', 'XII PAI',
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-primary">Data Siswa</h1>
        <Link
          href="/dashboard/students/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Tambah Siswa
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="search"
          placeholder="Cari nama siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={kelasFilter}
          onChange={(e) => setKelasFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <DataTable<Student>
        columns={columns}
        data={students}
        loading={loading}
        basePath="/dashboard/students"
        onDelete={handleDelete}
        emptyMessage="Belum ada data siswa"
      />
    </div>
  );
}
