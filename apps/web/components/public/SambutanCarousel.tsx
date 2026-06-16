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
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto" />
            <div className="h-64 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (sambutanList.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl font-heading text-primary text-center mb-10"
        >
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
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  {/* Photo */}
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-tersier/30 mb-4 bg-gray-100">
                    {item.image_path ? (
                      <Image
                        src={getImageUrl(item.image_path, 320)}
                        alt={item.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-heading">
                        {item.nama.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Position */}
                  <h3 className="text-xl font-heading text-primary">{item.nama}</h3>
                  <p className="text-sm text-tersier font-medium mt-1">{item.jabatan}</p>

                  {/* Speech */}
                  <div className="mt-6 text-gray-600 text-sm md:text-base leading-relaxed text-justify max-w-2xl">
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
