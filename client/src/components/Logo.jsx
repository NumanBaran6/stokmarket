/**
 * Numan Gıda marka logosu.
 * Yapraktan oluşan yeşil bir çember (C) içinde kırmızı elma — geleneksel
 * meyve & sebze toptancısı amblemi. Vektörel (SVG) olarak çizilmiştir.
 */
export const Logo = ({ size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Turuncu narenciye gövdesi */}
    <circle cx="50" cy="60" r="33" fill="#f4951d" />
    {/* Sağ tarafta açık ton (hacim hissi) */}
    <path
      d="M50 27 A33 33 0 0 1 50 93 A33 33 0 0 0 50 27 Z"
      fill="#f8b133"
    />
    {/* Üstteki turuncu dilimi ayıran açık yay */}
    <path
      d="M22 51 C40 43 64 43 81 52"
      stroke="#fffdf7"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    {/* Ortadaki yeşil yaprak bandı */}
    <path
      d="M21 54 C42 49 64 50 82 58 C64 61 42 62 21 60 Z"
      fill="#5bb02a"
    />
    <path
      d="M21 54 C42 49 64 50 82 58"
      stroke="#4a9223"
      strokeWidth="1.4"
      fill="none"
    />
    {/* Yeşil bandın altındaki açık ayraç */}
    <path
      d="M24 64 C42 61 62 63 78 67"
      stroke="#fffdf7"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Üstteki yaprak */}
    <path
      d="M55 26 C49 14 58 4 70 7 C67 21 61 27 55 26 Z"
      fill="#6cbb2e"
    />
    {/* Yaprak sapı */}
    <path d="M53 27 C51 21 51 16 54 12" stroke="#4a9223" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * Görseli olmayan ürünler için soluk kasa simgesi (placeholder).
 */
export const CrateIcon = ({ size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="7" y="18" width="34" height="6" rx="1.2" stroke="#b9a98c" strokeWidth="2" />
    <path d="M10 24h28l-3 16H13L10 24Z" stroke="#b9a98c" strokeWidth="2" strokeLinejoin="round" />
    <path d="M19 24l-1 16M29 24l1 16" stroke="#b9a98c" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default Logo;
