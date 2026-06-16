'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/admin/DataTable';
import { adminGet, adminDelete } from '@/lib/admin-api';

interface SudutSekolah {
  id: string;
  image_path: string;
  caption: string | null;
  urutan: number;
  is_active: boolean;
}

export default function SudutSekolahPage() {
  const [data, setData] = useState<SudutSekolah[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGet<{ data: SudutSekolah[] }>('/api/admin/sudut-sekolah');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    await adminDelete(`/api/admin/sudut-sekolah/${id}`);
    setData((prev) => prev.filter((s) => s.id !== id));
  };

  const columns: Column<SudutSekolah>[] = [
    {
      key: 'image_path',
      label: 'Gambar',
      render: (s) => (
        <span className="text-gray-500 text-xs font-mono truncate max-w-[200px] block">
          {s.image_path}
        </span>
      ),
    },
    { key: 'caption', label: 'Caption', render: (s) => s.caption || '-' },
    { key: 'urutan', label: 'Urutan' },
    {
      key: 'is_active',
      label: 'Aktif',
      render: (s) => (
        <span className={`px-2 py-0.5 rounded-full text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {s.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-primary">Sudut Sekolah</h1>
        <Link
          href="/dashboard/sudut-sekolah/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Tambah Foto
        </Link>
      </div>

      <DataTable<SudutSekolah>
        columns={columns}
        data={data}
        loading={loading}
        basePath="/dashboard/sudut-sekolah"
        onDelete={handleDelete}
        emptyMessage="Belum ada data sudut sekolah"
      />
    </div>
  );
}
