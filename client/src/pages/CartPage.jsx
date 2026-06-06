import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatTL } from '../utils/format.js';

const DELIVERY_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/**
 * Sepet / Haftalık Sipariş Listesi sayfası.
 * - Her kalemin miktarı MOQ'nun altına inemez ve stoğu aşamaz.
 * - Teslimat günü seçimi zorunludur.
 * - Onay modalı ile sipariş backend'e gönderilir, otomatik fatura oluşur.
 */
const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [deliveryDay, setDeliveryDay] = useState('');
  const [note, setNote] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const changeQty = (item, value) => {
    const qty = parseInt(value, 10);
    if (Number.isNaN(qty)) return;
    // MOQ'nun altına inilemez, stok aşılamaz
    const clamped = Math.max(item.product.moq, Math.min(qty, item.product.stock));
    updateQuantity(item.product._id, clamped);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryDay) {
      toast.error('Lütfen teslimat günü seçin.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        deliveryDay,
        note,
      };
      const { data } = await api.post('/orders', payload);
      clearCart();
      setConfirmOpen(false);
      toast.success(`Sipariş oluşturuldu! Fatura no: ${data.data.invoiceNumber}`);
      navigate(`/siparis/${data.data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Sepetin boş"
          message="Katalogdan ürün ekleyerek haftalık sipariş listeni oluşturabilirsin."
          action={
            <button className="btn btn--primary" onClick={() => navigate('/')}>
              Katalova Git
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Haftalık Sipariş Listem</h1>

      <div className="cart-layout">
        {/* Sepet kalemleri */}
        <div className="cart-items">
          {items.map((item) => {
            const lineTotal = item.quantity * (item.product.effectivePrice ?? item.product.price);
            return (
              <div key={item.product._id} className="card cart-item">
                <div className="cart-item__info">
                  <h4>{item.product.name}</h4>
                  <span className="cart-item__meta">
                    {formatTL(item.product.effectivePrice ?? item.product.price)} / {item.product.unit}
                    {' · '}
                    Min. {item.product.moq} {item.product.unit}
                  </span>
                </div>

                <div className="cart-item__qty">
                  <button
                    className="qty-btn"
                    onClick={() => changeQty(item, item.quantity - 1)}
                    disabled={item.quantity <= item.product.moq}
                    aria-label="Azalt"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="qty-input"
                    value={item.quantity}
                    min={item.product.moq}
                    max={item.product.stock}
                    onChange={(e) => changeQty(item, e.target.value)}
                  />
                  <button
                    className="qty-btn"
                    onClick={() => changeQty(item, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    aria-label="Artır"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item__total">{formatTL(lineTotal)}</div>

                <button
                  className="cart-item__remove"
                  onClick={() => removeItem(item.product._id)}
                  aria-label="Kaldır"
                >
                  Kaldır
                </button>
              </div>
            );
          })}
        </div>

        {/* Özet ve sipariş onayı */}
        <aside className="card cart-summary">
          <h3>Sipariş Özeti</h3>

          <div className="form-field">
            <label htmlFor="deliveryDay">Teslimat Günü *</label>
            <select
              id="deliveryDay"
              className="input"
              value={deliveryDay}
              onChange={(e) => setDeliveryDay(e.target.value)}
            >
              <option value="">Gün seçin...</option>
              {DELIVERY_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="note">Sipariş Notu (opsiyonel)</label>
            <textarea
              id="note"
              className="input"
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn. öğleden sonra teslim edilsin"
            />
          </div>

          <div className="cart-summary__row cart-summary__row--total">
            <span>Toplam</span>
            <strong>{formatTL(totalAmount)}</strong>
          </div>

          <button
            className="btn btn--primary btn--block"
            onClick={() => setConfirmOpen(true)}
            disabled={!deliveryDay}
          >
            Siparişi Onayla
          </button>
          <button className="btn btn--ghost btn--block" onClick={clearCart}>
            Sepeti Temizle
          </button>
        </aside>
      </div>

      {/* Onay modalı */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Siparişi Onayla"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setConfirmOpen(false)}>
              Vazgeç
            </button>
            <button className="btn btn--primary" onClick={handlePlaceOrder} disabled={submitting}>
              {submitting ? 'Gönderiliyor...' : 'Onayla ve Gönder'}
            </button>
          </>
        }
      >
        <p>
          <strong>{items.length}</strong> kalemden oluşan, toplam{' '}
          <strong>{formatTL(totalAmount)}</strong> tutarındaki siparişi{' '}
          <strong>{deliveryDay}</strong> günü teslimat için onaylıyor musun?
        </p>
        <p className="text-muted">Onay sonrası otomatik fatura numarası oluşturulacaktır.</p>
      </Modal>
    </div>
  );
};

export default CartPage;
