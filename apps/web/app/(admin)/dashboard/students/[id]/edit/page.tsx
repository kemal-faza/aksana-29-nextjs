'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StudentForm } from '@/components/admin/StudentForm';
import { adminGet } from '@/lib/admin-api';

interface StudentData {
  id: string;
  nama: string;
  kelas: string;
  jabatan: string | null;
  ttl: string | null;
  kesan: string | null;
  pesan: string | null;
  ekstra: string | null;
  image_path: string | null;
}

export default function EditStudentPage() {
  const params = useParams();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGet<StudentData>(`/api/admin/students/${params.id}`)
      .then(setStudent)
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

  if (error || !student) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Siswa tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Edit Siswa: {student.nama}</h1>
      <StudentForm
        studentId={student.id}
        initialData={{
          nama: student.nama,
          kelas: student.kelas,
          jabatan: student.jabatan || '',
          ttl: student.ttl || '',
          kesan: student.kesan || '',
          pesan: student.pesan || '',
          ekstra: student.ekstra || '',
          image_path: student.image_path || '',
        }}
      />
    </div>
  );
}
