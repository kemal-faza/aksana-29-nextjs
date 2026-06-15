'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import type { VideoPublic } from '@aksana/shared';

export default function GaleriPage() {
  const [videos, setVideos] = useState<VideoPublic[]>([]);

  useEffect(() => {
    apiGet<{ data: VideoPublic[] }>('/api/public/videos')
      .then(res => setVideos(res.data));
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-heading text-primary">Galeri</h1>
      <div className="mt-6 grid gap-6">
        {videos.map(v => (
          <div key={v.id} className="aspect-video bg-secondary rounded-lg">
            <iframe
              src={`https://drive.google.com/file/d/${v.drive_id}/preview`}
              className="w-full h-full rounded-lg"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </main>
  );
}
