import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

interface TeacherModalProps {
  teacher: TeacherPublic;
  onClose: () => void;
}

/**
 * TeacherModal per DESIGN.md "Components > Modal (modal-card)":
 * - bg-secondary/50 backdrop overlay
 * - rounded-md shadow-lg max-w-2xl card
 * - bg-canvas text-ink body
 * - Image uses next/image fill mode + Tailwind-sized container
 *   (replaces 200x200 JSX props for consistency with other cards)
 */
export function TeacherModal({ teacher, onClose }: TeacherModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-canvas text-ink rounded-md shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="float-right text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          {teacher.image_path && (
            <div className="relative w-48 h-48 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={getImageUrl(teacher.image_path, 640)}
                alt={teacher.nama}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-primary">{teacher.nama}</h2>
            <p className="text-ink-mute mt-1">{teacher.jabatan}</p>
            {teacher.mapel && teacher.mapel.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-sm">Mata Pelajaran:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {teacher.mapel.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-tertiary/20 text-sm rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {teacher.ekstra && (
              <p className="mt-3 text-sm">
                <span className="font-semibold">Ekstrakurikuler:</span> {teacher.ekstra}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
