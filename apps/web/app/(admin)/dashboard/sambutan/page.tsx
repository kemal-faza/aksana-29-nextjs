'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/admin/DataTable';
import { adminGet, adminDelete } from '@/lib/admin-api';

interface Sambutan {
  id: string;
  nama: string;
  jabatan: string;
  is_active: boolean;
  urutan: number;
}

export default function SambutanPage() {
  const [data, setData] = useState<Sambutan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGet<{ data: Sambutan[] }>('/api/admin/sambutan');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch sambutan:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    await adminDelete(`/api/admin/sambutan/${id}`);
    setData((prev) => prev.filter((s) => s.id !== id));
  };

  const columns: Column<Sambutan>[] = [
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan' },
    {
      key: 'urutan',
      label: 'Urutan',
      render: (s) => s.urutan,
    },
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
        <h1 className="text-2xl font-heading text-primary">Data Sambutan</h1>
        <Link
          href="/dashboard/sambutan/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Tambah Sambutan
        </Link>
      </div>

      <DataTable<Sambutan>
        columns={columns}
        data={data}
        loading={loading}
        basePath="/dashboard/sambutan"
        onDelete={handleDelete}
        emptyMessage="Belum ada data sambutan"
      />
    </div>
  );
}
