export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Description */}
          <div>
            <h3 className="font-heading text-2xl text-tersier mb-4">
              WEBSITE BUKU TAHUNAN ANGKATAN 29 (AKSANA 29) MAN KAPUAS TAHUN 2024
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed text-justify">
              Website Buku Tahunan Aksana 29 merupakan website yang dijadikan
              tempat bagaimana Angkatan 29 MAN Kapuas bercerita, bernostalgia,
              dan bertukar informasi satu sama lain nya dalam rangka mempererat
              tali ukhuwah silaturahmi antar sesama alumni MAN Kapuas tahun
              ajaran 2023/2024.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed text-justify mt-3">
              Website ini juga menjadi bukti kemajuan teknologi yang menggantikan
              buku angkatan (fisik) yang sekarang bisa diakses dengan mudahnya
              secara digital (online).
            </p>
          </div>

          {/* Right: Credits */}
          <div className="md:text-right">
            <p className="text-gray-400 text-sm">
              Copyright &copy; 2024
            </p>
            <div className="mt-4">
              <p className="text-gray-300 font-semibold">Dibuat oleh:</p>
              <p className="text-gray-400 text-sm">Muhamad Kemal Faza (XII IPA 1)</p>
            </div>
            <div className="mt-2">
              <p className="text-gray-300 font-semibold">Partner:</p>
              <p className="text-gray-400 text-sm">Muhamad Zulfikar (XII IPA 2)</p>
              <p className="text-gray-400 text-sm">Muhammad Hilmy Alfajar (XII IPA 2)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">AKSANA 29 &mdash; MAN Kapuas Angkatan ke-29</p>
          <p className="text-gray-500 text-xs">Dipersembahkan oleh Angkatan 29 MAN Kapuas</p>
        </div>
      </div>
    </footer>
  );
}
