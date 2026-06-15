'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentCardProps {
  student: StudentPublic;
  onClick: (student: StudentPublic) => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <button
      onClick={() => onClick(student)}
      className="bg-white rounded-lg shadow overflow-hidden text-left hover:shadow-md transition-shadow w-full"
    >
      {student.image_path ? (
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={getImageUrl(student.image_path, 320)}
            alt={student.nama}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] w-full bg-secondary flex items-center justify-center">
          <span className="text-4xl text-gray-400 font-heading">
            {student.nama.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-3">
        <p className="font-semibold text-sm truncate">{student.nama}</p>
        <p className="text-xs text-gray-500 truncate">
          {student.jabatan || 'Anggota'}
        </p>
      </div>
    </button>
  );
}
