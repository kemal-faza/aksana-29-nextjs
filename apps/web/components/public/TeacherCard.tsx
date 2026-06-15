import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

export function TeacherCard({ teacher, onClick }: { teacher: TeacherPublic; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left group flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary flex-shrink-0">
        {teacher.image_path && (
          <Image
            src={getImageUrl(teacher.image_path, 320)}
            alt={teacher.nama}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div>
        <h3 className="font-semibold text-dark">{teacher.nama}</h3>
        <p className="text-sm text-gray-600">{teacher.jabatan}</p>
      </div>
    </button>
  );
}
