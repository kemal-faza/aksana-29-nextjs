'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/admin/DataTable';
import { adminGet, adminDelete } from '@/lib/admin-api';

interface Video {
  id: string;
  judul: string;
  drive_id: string;
  deskripsi: string | null;
  urutan: number;
  is_active: boolean;
}

export default function GalleryPage() {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGet<{ data: Video[] }>('/api/admin/videos');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    await adminDelete(`/api/admin/videos/${id}`);
    setData((prev) => prev.filter((v) => v.id !== id));
  };

  const columns: Column<Video>[] = [
    { key: 'judul', label: 'Judul' },
    {
      key: 'drive_id',
      label: 'Drive ID',
      render: (v) => (
        <span className="font-mono text-xs text-gray-500">{v.drive_id}</span>
      ),
    },
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
        <h1 className="text-2xl font-heading text-primary">Galeri Video</h1>
        <Link
          href="/dashboard/gallery/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Tambah Video
        </Link>
      </div>

      <DataTable<Video>
        columns={columns}
        data={data}
        loading={loading}
        basePath="/dashboard/gallery"
        onDelete={handleDelete}
        emptyMessage="Belum ada data video"
      />
    </div>
  );
}
