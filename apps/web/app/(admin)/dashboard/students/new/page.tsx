import { StudentForm } from '@/components/admin/StudentForm';

export default function NewStudentPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Tambah Siswa Baru</h1>
      <StudentForm />
    </div>
  );
}
