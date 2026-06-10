/**
 * Sayıyı Türk Lirası biçiminde gösterir (örn. 1.250,00 ₺).
 */
export const formatTL = (amount) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount ?? 0);

/**
 * ISO tarihi okunabilir Türkçe biçime çevirir (örn. 6 Haziran 2026 17:04).
 */
export const formatDate = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Stok miktarını yaklaşık ve bir alt tamlığa yuvarlanmış gösterir.
 * Örn. 2230 → "2000+", 850 → "800+", 73 → "70+". Gerçek sayıyı gizler.
 */
export const formatStockApprox = (stock) => {
  const n = Number(stock) || 0;
  if (n <= 0) return '0';
  let step;
  if (n >= 1000) step = 1000;
  else if (n >= 100) step = 100;
  else if (n >= 10) step = 10;
  else return String(n);
  return `${Math.floor(n / step) * step}+`;
};

/**
 * Yalnızca tarih (saat olmadan), örn. 15 Haziran 2026 Pazartesi.
 */
export const formatDateShort = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });
};
