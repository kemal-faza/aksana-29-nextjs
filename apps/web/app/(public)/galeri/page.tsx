'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { VideoEmbed } from '@/components/public/VideoEmbed';
import type { VideoPublic } from '@aksana/shared';

export default function GaleriPage() {
  const [videos, setVideos] = useState<VideoPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: VideoPublic[] }>('/api/public/videos')
      .then(res => setVideos(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-heading text-primary">Galeri</h1>
      <p className="mt-2 text-gray-600">Video kenangan angkatan ke-29 MAN Kapuas</p>

      {loading ? (
        <p className="mt-6">Memuat video...</p>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {videos.map(v => (
            <VideoEmbed
              key={v.id}
              driveId={v.drive_id}
              judul={v.judul}
              deskripsi={v.deskripsi}
            />
          ))}
        </div>
      )}
    </main>
  );
}
