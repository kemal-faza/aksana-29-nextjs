import { VideoForm } from '@/components/admin/VideoForm';

export default function NewVideoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Tambah Video Baru</h1>
      <VideoForm />
    </div>
  );
}
