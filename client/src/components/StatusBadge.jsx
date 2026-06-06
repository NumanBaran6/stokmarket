/**
 * Sipariş durumunu renkli bir etiket olarak gösterir.
 */
const STATUS_CLASS = {
  beklemede: 'badge--pending',
  onaylandı: 'badge--approved',
  hazırlanıyor: 'badge--preparing',
  'teslim edildi': 'badge--delivered',
  iptal: 'badge--cancelled',
};

const StatusBadge = ({ status }) => {
  return <span className={`badge ${STATUS_CLASS[status] || ''}`}>{status}</span>;
};

export default StatusBadge;
