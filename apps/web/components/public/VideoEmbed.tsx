'use client';
import { useState } from 'react';

interface VideoEmbedProps {
  driveId: string;
  judul: string;
  deskripsi?: string | null;
}

export function VideoEmbed({ driveId, judul, deskripsi }: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-video relative bg-dark">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p className="text-lg">Memuat video...</p>
          </div>
        )}
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          className={`w-full h-full ${loaded ? '' : 'opacity-0 absolute'}`}
          allow="autoplay"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          title={judul}
        />
      </div>
      <div className="p-4">
        <h3 className="font-heading text-xl text-primary">{judul}</h3>
        {deskripsi && <p className="text-sm text-gray-600 mt-1">{deskripsi}</p>}
      </div>
    </div>
  );
}
