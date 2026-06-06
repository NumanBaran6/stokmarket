import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatTL, formatDate } from '../utils/format.js';

/**
 * Siparişlerim sayfası.
 * - Müşteri kendi siparişlerini görür.
 * - Admin için aynı endpoint tüm siparişleri döndürür (yönetim ekranında kullanılır).
 */
const OrdersPage = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders')
      .then(({ data }) => setOrders(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner fullPage label="Siparişler yükleniyor..." />;

  return (
    <div className="container">
      <h1>{isAdmin ? 'Tüm Siparişler' : 'Siparişlerim'}</h1>

      {error ? (
        <EmptyState icon="⚠️" title="Hata" message={error} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Henüz siparişin yok"
          message="Katalogdan ürün seçip ilk haftalık siparişini oluşturabilirsin."
          action={
            <Link to="/" className="btn btn--primary">
              Katalova Git
            </Link>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Fatura No</th>
                {isAdmin && <th>Bayi</th>}
                <th>Tarih</th>
                <th>Teslimat</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td data-label="Fatura No">{o.invoiceNumber}</td>
                  {isAdmin && <td data-label="Bayi">{o.customer?.shopName || '-'}</td>}
                  <td data-label="Tarih">{formatDate(o.createdAt)}</td>
                  <td data-label="Teslimat">{o.deliveryDay}</td>
                  <td data-label="Tutar">{formatTL(o.totalAmount)}</td>
                  <td data-label="Durum">
                    <StatusBadge status={o.status} />
                  </td>
                  <td>
                    <Link to={`/siparis/${o._id}`} className="btn btn--ghost btn--sm">
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
