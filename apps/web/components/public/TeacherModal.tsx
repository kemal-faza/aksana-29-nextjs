import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

export function TeacherModal({ teacher, onClose }: { teacher: TeacherPublic; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-2xl">&times;</button>
        <div className="flex flex-col md:flex-row gap-6">
          {teacher.image_path && (
            <Image
              src={getImageUrl(teacher.image_path, 640)}
              alt={teacher.nama}
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-heading text-primary">{teacher.nama}</h2>
            <p className="text-secondary mt-1">{teacher.jabatan}</p>
            {teacher.mapel && teacher.mapel.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-sm">Mata Pelajaran:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {teacher.mapel.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-tersier/20 text-sm rounded">{m}</span>
                  ))}
                </div>
              </div>
            )}
            {teacher.ekstra && (
              <p className="mt-3 text-sm"><span className="font-semibold">Ekstrakurikuler:</span> {teacher.ekstra}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
