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
    {/* Yaprak biçimli yeşil çember (sağdan açık, C/yaprak görünümü) */}
    <path
      d="M76 22 A40 40 0 1 0 80 76"
      stroke="#6cb52d"
      strokeWidth="9"
      strokeLinecap="round"
    />
    {/* Çemberin alt-sağ ucundaki büyük yaprak */}
    <path
      d="M80 76 C88 66 90 52 84 42 C76 50 74 64 80 76 Z"
      fill="#4f9d28"
    />

    {/* Elma gövdesi */}
    <path
      d="M50 38 C43 31 31 34 31 47 C31 61 40 72 50 72 C60 72 69 61 69 47 C69 34 57 31 50 38 Z"
      fill="#d8281c"
    />
    {/* Elma üzerindeki açık ton (parlama) */}
    <path
      d="M40 44 C36 49 36 58 40 65 C36 60 34 50 40 44 Z"
      fill="#ef5a4e"
    />
    {/* Sap */}
    <path d="M50 38 L48 29" stroke="#6b4a2b" strokeWidth="3" strokeLinecap="round" />
    {/* Elmanın üstündeki yaprak */}
    <path
      d="M50 37 C53 27 62 23 71 26 C67 35 59 40 50 37 Z"
      fill="#5bb02a"
    />
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
