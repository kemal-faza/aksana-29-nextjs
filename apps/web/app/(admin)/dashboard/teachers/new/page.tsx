import { TeacherForm } from '@/components/admin/TeacherForm';

export default function NewTeacherPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Tambah Guru Baru</h1>
      <TeacherForm />
    </div>
  );
}
