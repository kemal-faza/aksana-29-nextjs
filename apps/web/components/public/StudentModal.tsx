'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentModalProps {
  student: StudentPublic | null;
  onClose: () => void;
}

/**
 * StudentModal per DESIGN.md "Components > Modal (modal-card)":
 * - bg-secondary/50 backdrop overlay
 * - rounded-md shadow-lg max-w-lg card
 * - bg-canvas text-ink body
 * - click-outside-to-close
 *
 * Note: There's also a standalone Modal component (Task 1.4).
 * This component is the inline modal used in pesdik page
 * (renders the full student detail inline, not a generic Modal).
 */
export function StudentModal({ student, onClose }: StudentModalProps) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-canvas text-ink rounded-md shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {student.image_path ? (
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={getImageUrl(student.image_path, 640)}
              alt={student.nama}
              fill
              className="object-cover"
              sizes="640px"
            />
          </div>
        ) : null}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-canvas/90 rounded-full p-1.5 shadow hover:bg-canvas transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-primary">{student.nama}</h2>
          <p className="text-sm text-ink-mute">
            {student.kelas} &middot; {student.jabatan || 'Anggota'}
          </p>

          {student.ekstra ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm">Ekstrakurikuler</h3>
              <p className="mt-1 text-ink-mute">{student.ekstra}</p>
            </div>
          ) : null}

          {student.kesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm">Kesan</h3>
              <p className="mt-1 text-ink-mute whitespace-pre-line">{student.kesan}</p>
            </div>
          ) : null}

          {student.pesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm">Pesan</h3>
              <p className="mt-1 text-ink-mute whitespace-pre-line">{student.pesan}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
