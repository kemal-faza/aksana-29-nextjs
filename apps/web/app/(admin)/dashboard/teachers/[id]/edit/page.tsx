'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TeacherForm } from '@/components/admin/TeacherForm';
import { adminGet } from '@/lib/admin-api';

interface TeacherData {
  id: string;
  nama: string;
  jabatan: string;
  mapel: string[];
  ekstra: string | null;
  image_path: string | null;
  urutan: number;
}

export default function EditTeacherPage() {
  const params = useParams();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGet<TeacherData>(`/api/admin/teachers/${params.id}`)
      .then(setTeacher)
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

  if (error || !teacher) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Guru tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Edit Guru: {teacher.nama}</h1>
      <TeacherForm
        teacherId={teacher.id}
        initialData={{
          nama: teacher.nama,
          jabatan: teacher.jabatan,
          mapel: teacher.mapel,
          ekstra: teacher.ekstra || '',
          image_path: teacher.image_path || '',
          urutan: teacher.urutan,
        }}
      />
    </div>
  );
}
