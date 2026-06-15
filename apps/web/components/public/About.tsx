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
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {aboutCards.map((card) => (
          <div key={card.title} className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-heading text-primary mb-3">{card.title}</h2>
            <p className="text-dark">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
