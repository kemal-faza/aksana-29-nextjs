'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentCardProps {
  student: StudentPublic;
  onClick: (student: StudentPublic) => void;
}

/**
 * StudentCard per DESIGN.md "Components > Person Card (card-person)":
 * - rounded-md overflow-hidden shadow-lg
 * - bg-secondary text-primary
 * - portrait 1080x1920 with srcSet
 * - h4 name (text-lg font-semibold) + h5 jabatan (text-sm font-light border-b)
 */
export function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <button
      onClick={() => onClick(student)}
      className="w-full bg-secondary text-primary rounded-md overflow-hidden shadow-lg text-left hover:shadow-md transition-shadow"
    >
      {student.image_path ? (
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={getImageUrl(student.image_path, 320)}
            alt={student.nama}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] w-full bg-canvas flex items-center justify-center">
          <span className="text-4xl text-ink-placeholder font-heading">
            {student.nama.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-4">
        <h4 className="text-lg font-semibold truncate">{student.nama}</h4>
        <h5 className="text-sm font-light py-3 border-b border-primary/20 truncate">
          {student.jabatan || 'Anggota'}
        </h5>
      </div>
    </button>
  );
}
