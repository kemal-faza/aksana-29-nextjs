'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SudutSekolahForm } from '@/components/admin/SudutSekolahForm';
import { adminGet } from '@/lib/admin-api';

interface EntityData {
  id: string;
  image_path: string;
  caption: string | null;
  urutan: number;
  is_active: boolean;
}

export default function EditSudutSekolahPage() {
  const params = useParams();
  const [entity, setEntity] = useState<EntityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGet<EntityData>(`/api/admin/sudut-sekolah/${params.id}`)
      .then(setEntity)
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

  if (error || !entity) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Data tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Edit Foto Sudut Sekolah</h1>
      <SudutSekolahForm
        entityId={entity.id}
        initialData={{
          image_path: entity.image_path,
          caption: entity.caption || '',
          urutan: entity.urutan,
          is_active: entity.is_active,
        }}
      />
    </div>
  );
}
