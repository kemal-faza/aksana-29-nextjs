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
    <section className="py-24 px-16 bg-primary/5">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold uppercase text-primary mb-6 text-center">
          Ulang Tahun Bulan Ini
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3">
          {students.map(s => (
            <div key={s.id} className="text-center p-3 bg-canvas rounded-md shadow-lg">
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
              <p className="text-xs text-ink-mute">{s.tanggal}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
