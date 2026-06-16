'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { apiGet } from '@/lib/api';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import type { SambutanPublic } from '@aksana/shared';

export function SambutanCarousel() {
  const [sambutanList, setSambutanList] = useState<SambutanPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: SambutanPublic[] }>('/api/public/sambutan')
      .then((res) => setSambutanList(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-16">
        <div className="container mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-secondary rounded mx-auto" />
            <div className="h-64 bg-secondary rounded-md" />
          </div>
        </div>
      </section>
    );
  }

  if (sambutanList.length === 0) return null;

  return (
    <section className="py-24 px-16 bg-canvas">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold uppercase text-primary text-center mb-10">
          Sambutan
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 1 },
          }}
          className="sambutan-swiper"
        >
          {sambutanList.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="bg-canvas rounded-md shadow-lg p-6 md:p-10 max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  {/* Photo */}
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-primary/30 mb-4 bg-secondary">
                    {item.image_path ? (
                      <Image
                        src={getImageUrl(item.image_path, 320)}
                        alt={item.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-placeholder text-4xl">
                        {item.nama.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Position */}
                  <h3 className="text-xl font-semibold text-primary">{item.nama}</h3>
                  <p className="text-sm text-primary/80 font-medium mt-1">{item.jabatan}</p>

                  {/* Speech */}
                  <div className="mt-6 text-ink-mute text-sm md:text-base leading-relaxed text-justify max-w-2xl">
                    {item.isi.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
