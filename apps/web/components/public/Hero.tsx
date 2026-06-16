import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-dark">
      <Image
        src="/img/homepage/hero.jpeg"
        alt="AKSANA 29"
        fill
        className="object-cover brightness-50"
        priority
      />
      <div className="relative z-10 text-center">
        <h1 className="text-[18vw] tracking-[2vw] font-extrabold font-heading text-secondary">
          AKSANA 29
        </h1>
        <p className="text-[3vw] tracking-[1.3vw] font-extrabold text-secondary">
          MAN KAPUAS ANGKATAN KE-29
        </p>
      </div>
    </section>
  );
}
