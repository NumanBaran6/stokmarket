import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatTL, formatDate, formatDateShort } from '../utils/format.js';

const STATUS_OPTIONS = ['beklemede', 'onaylandı', 'hazırlanıyor', 'teslim edildi', 'iptal'];

/**
 * Sipariş detay / fatura sayfası.
 * - Sipariş kalemlerini, tutarı ve teslimat bilgisini gösterir.
 * - Admin durumu güncelleyebilir; sahibi bekleyen siparişi iptal edebilir.
 */
const OrderDetailPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrder = () => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [id]);

  const handleStatusChange = async (status) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrder(data.data);
      toast.success('Sipariş durumu güncellendi.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bu siparişi iptal etmek istediğine emin misin?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.info('Sipariş iptal edildi.');
      navigate('/siparislerim');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner fullPage />;
  if (error) return <div className="container"><p className="text-danger">{error}</p></div>;
  if (!order) return null;

  return (
    <div className="container invoice-page">
      <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
        ← Geri
      </button>

      <div className="card invoice">
        <div className="invoice__header">
          <div>
            <h2>Fatura</h2>
            <p className="invoice__number">{order.invoiceNumber}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="invoice__meta">
          <div>
            <span className="label">Bayi</span>
            <strong>{order.customer?.shopName}</strong>
            <span>{order.customer?.name} · {order.customer?.email}</span>
          </div>
          <div>
            <span className="label">Sipariş Tarihi</span>
            <strong>{formatDate(order.createdAt)}</strong>
            <span className="label">Teslimat Tarihi: {formatDateShort(order.deliveryDate)}</span>
          </div>
        </div>

        <table className="table invoice__table">
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Birim Fiyat</th>
              <th>Miktar</th>
              <th>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td data-label="Ürün">{item.name}</td>
                <td data-label="Birim Fiyat">{formatTL(item.priceAtOrder)} / {item.unit}</td>
                <td data-label="Miktar">{item.quantity} {item.unit}</td>
                <td data-label="Tutar">{formatTL(item.priceAtOrder * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-right">Ara Toplam</td>
              <td>{formatTL(order.totalAmount)}</td>
            </tr>
            <tr>
              <td colSpan="3" className="text-right">Kargo</td>
              <td>{order.shippingFee ? formatTL(order.shippingFee) : 'Ücretsiz'}</td>
            </tr>
            <tr>
              <td colSpan="3" className="text-right"><strong>Genel Toplam</strong></td>
              <td><strong>{formatTL(order.totalAmount + (order.shippingFee || 0))}</strong></td>
            </tr>
          </tfoot>
        </table>

        {order.note && (
          <p className="invoice__note">
            <strong>Not:</strong> {order.note}
          </p>
        )}

        {/* Yönetim aksiyonları */}
        <div className="invoice__actions">
          {isAdmin && (
            <div className="form-field">
              <label htmlFor="status">Durumu Güncelle (Yönetici)</label>
              <select
                id="status"
                className="input"
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {!isAdmin && order.status === 'beklemede' && (
            <button className="btn btn--danger" onClick={handleCancel}>
              Siparişi İptal Et
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
