'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentModalProps {
  student: StudentPublic | null;
  onClose: () => void;
}

export function StudentModal({ student, onClose }: StudentModalProps) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {student.image_path ? (
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={getImageUrl(student.image_path, 640)}
              alt={student.nama}
              fill
              className="object-cover rounded-t-lg"
              sizes="640px"
            />
          </div>
        ) : null}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
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
          <h2 className="text-2xl font-heading text-primary">{student.nama}</h2>
          <p className="text-sm text-gray-600">
            {student.kelas} &middot; {student.jabatan || 'Anggota'}
          </p>

          {student.ekstra ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-gray-700">Ekstrakurikuler</h3>
              <p className="mt-1 text-gray-600">{student.ekstra}</p>
            </div>
          ) : null}

          {student.kesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-gray-700">Kesan</h3>
              <p className="mt-1 text-gray-600 whitespace-pre-line">{student.kesan}</p>
            </div>
          ) : null}

          {student.pesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-gray-700">Pesan</h3>
              <p className="mt-1 text-gray-600 whitespace-pre-line">{student.pesan}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
