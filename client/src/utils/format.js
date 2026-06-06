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
