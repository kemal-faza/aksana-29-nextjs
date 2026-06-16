'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SambutanForm } from '@/components/admin/SambutanForm';
import { adminGet } from '@/lib/admin-api';

interface SambutanData {
  id: string;
  nama: string;
  jabatan: string;
  isi: string;
  image_path: string | null;
  urutan: number;
  is_active: boolean;
}

export default function EditSambutanPage() {
  const params = useParams();
  const [sambutan, setSambutan] = useState<SambutanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGet<SambutanData>(`/api/admin/sambutan/${params.id}`)
      .then(setSambutan)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Memuat data...</div>
      </div>
    );
  }

  if (error || !sambutan) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Sambutan tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Edit Sambutan: {sambutan.nama}</h1>
      <SambutanForm
        sambutanId={sambutan.id}
        initialData={{
          nama: sambutan.nama,
          jabatan: sambutan.jabatan,
          isi: sambutan.isi,
          image_path: sambutan.image_path || '',
          urutan: sambutan.urutan,
          is_active: sambutan.is_active,
        }}
      />
    </div>
  );
}
