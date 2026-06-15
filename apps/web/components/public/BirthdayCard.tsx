import Image from 'next/image';
import { getImageUrl } from '@/lib/images';

interface BirthdayCardProps {
  students: Array<{
    id: string;
    nama: string;
    kelas: string;
    image_path: string | null;
    tanggal: string;
  }>;
}

export function BirthdayCard({ students }: BirthdayCardProps) {
  if (students.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary/5 to-tersier/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-heading text-primary mb-6">
          Ulang Tahun Bulan Ini
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {students.map(s => (
            <div key={s.id} className="text-center p-3 bg-white rounded-lg shadow">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-secondary">
                {s.image_path && (
                  <Image
                    src={getImageUrl(s.image_path, 320)}
                    alt={s.nama}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-2 font-semibold text-sm">{s.nama}</p>
              <p className="text-xs text-gray-600">{s.tanggal}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
