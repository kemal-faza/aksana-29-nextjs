'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VideoForm } from '@/components/admin/VideoForm';
import { adminGet } from '@/lib/admin-api';

interface VideoData {
  id: string;
  judul: string;
  drive_id: string;
  deskripsi: string | null;
  urutan: number;
  is_active: boolean;
}

export default function EditVideoPage() {
  const params = useParams();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGet<VideoData>(`/api/admin/videos/${params.id}`)
      .then(setVideo)
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

  if (error || !video) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Video tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-6">Edit Video: {video.judul}</h1>
      <VideoForm
        videoId={video.id}
        initialData={{
          judul: video.judul,
          drive_id: video.drive_id,
          deskripsi: video.deskripsi || '',
          urutan: video.urutan,
          is_active: video.is_active,
        }}
      />
    </div>
  );
}
