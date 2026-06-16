const aboutCards = [
  {
    title: 'Aksana 29',
    body: 'Media digital untuk mengenang jejak langkah angkatan ke-29 MAN Kapuas.',
  },
  {
    title: 'AKSANA 29',
    body: 'Ketua: Akhmad Rezky Utama. Total 279 siswa (115 L / 164 P).',
  },
];

export function About() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 justify-center">
        {aboutCards.map((card) => (
          <div key={card.title} className="p-6 bg-canvas rounded-md overflow-hidden shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold uppercase text-primary mb-3 text-center">
              {card.title}
            </h2>
            <p className="text-ink text-center">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
