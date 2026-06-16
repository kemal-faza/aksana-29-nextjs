import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

interface TeacherCardProps {
  teacher: TeacherPublic;
  onClick: () => void;
}

/**
 * TeacherCard per DESIGN.md "Components > Person Card (card-person)":
 * - Vertical card (image top, info bottom) in 1→2→3→4 grid (set by parent)
 * - rounded-md overflow-hidden shadow-lg bg-secondary text-primary
 * - portrait 1080x1920 with srcSet
 */
export function TeacherCard({ teacher, onClick }: TeacherCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-secondary text-primary rounded-md overflow-hidden shadow-lg text-left hover:shadow-md transition-shadow"
    >
      {teacher.image_path ? (
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={getImageUrl(teacher.image_path, 320)}
            alt={teacher.nama}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] w-full bg-canvas flex items-center justify-center">
          <span className="text-4xl text-ink-placeholder font-heading">
            {teacher.nama.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-4">
        <h4 className="text-lg font-semibold truncate">{teacher.nama}</h4>
        <h5 className="text-sm font-light py-3 border-b border-primary/20 truncate">
          {teacher.jabatan}
        </h5>
      </div>
    </button>
  );
}
