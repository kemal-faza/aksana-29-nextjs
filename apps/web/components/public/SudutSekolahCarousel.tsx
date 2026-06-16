'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { apiGet } from '@/lib/api';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import type { SudutSekolahPublic } from '@aksana/shared';

export function SudutSekolahCarousel() {
  const [photos, setPhotos] = useState<SudutSekolahPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: SudutSekolahPublic[] }>('/api/public/sudut-sekolah')
      .then((res) => setPhotos(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-dark">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-700 rounded mx-auto" />
            <div className="h-64 bg-gray-800 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-dark">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-heading text-tersier text-center mb-10">
          Sudut Sekolah
        </h2>

        <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
          Kenangan dari setiap sudut MAN Kapuas yang akan selalu kami rindukan
        </p>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView="auto"
          centeredSlides
          navigation
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 8 },
            480: { slidesPerView: 1.5, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2.5, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          className="sudut-sekolah-swiper"
        >
          {photos.map((photo) => (
            <SwiperSlide key={photo.id} style={{ width: 'auto' }}>
              <div className="relative w-[280px] h-[380px] md:w-[320px] md:h-[420px] rounded-xl overflow-hidden group shadow-lg">
                <Image
                  src={getImageUrl(photo.image_path, 640)}
                  alt={photo.caption || 'Sudut Sekolah'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 280px, 320px"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
                    <p className="text-white text-sm font-medium">{photo.caption}</p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
