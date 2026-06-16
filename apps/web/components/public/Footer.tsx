export function Footer() {
  return (
    <footer className="bg-dark text-secondary">
      <div className="container mx-auto py-16 px-10">
        <div className="flex flex-wrap gap-8">
          {/* Left: Description */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-xl lg:text-2xl text-justify font-bold">
              WEBSITE BUKU TAHUNAN ANGKATAN 29 (AKSANA 29) MAN KAPUAS TAHUN 2024
            </h2>
            <p className="text-base mt-5 text-justify">
              Website Buku Tahunan Aksana 29 merupakan website yang dijadikan
              tempat bagaimana Angkatan 29 MAN Kapuas bercerita, bernostalgia,
              dan bertukar informasi satu sama lain nya dalam rangka mempererat
              tali ukhuwah silaturahmi antar sesama alumni MAN Kapuas tahun
              ajaran 2023/2024.
            </p>
            <p className="text-base mt-3 text-justify">
              Website ini juga menjadi bukti kemajuan teknologi yang menggantikan
              buku angkatan (fisik) yang sekarang bisa diakses dengan mudahnya
              secara digital (online).
            </p>
          </div>

          {/* Right: Credits */}
          <div className="w-full lg:w-1/2 lg:text-right">
            <p className="text-base">
              Copyright &copy; 2024
            </p>
            <div className="mt-4">
              <p className="font-semibold">Dibuat oleh:</p>
              <p className="text-base">Muhamad Kemal Faza (XII IPA 1)</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold">Partner:</p>
              <p className="text-base">Muhamad Zulfikar (XII IPA 2)</p>
              <p className="text-base">Muhammad Hilmy Alfajar (XII IPA 2)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary/20">
        <div className="container mx-auto py-4 px-10 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs">AKSANA 29 &mdash; MAN Kapuas Angkatan ke-29</p>
          <p className="text-xs">Dipersembahkan oleh Angkatan 29 MAN Kapuas</p>
        </div>
      </div>
    </footer>
  );
}
