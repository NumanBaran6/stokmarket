import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatTL, formatDateShort } from '../utils/format.js';

/**
 * Sepet / Haftalık Sipariş Listesi sayfası.
 * - Her kalemin miktarı MOQ'nun altına inemez ve stoğu aşamaz.
 * - Teslimat tarihi takvimden seçilir (bugünden itibaren en fazla 1 ay).
 * - Göstermelik kredi kartı bilgileri alınır (kaydedilmez).
 * - Onay sonrası sipariş backend'e gönderilir, otomatik fatura oluşur.
 */
const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [deliveryDate, setDeliveryDate] = useState('');
  const [note, setNote] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Takvim sınırları: bugün ile bugün + 1 ay
  const { minDate, maxDate } = useMemo(() => {
    const t = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 31);
    const iso = (d) => d.toISOString().split('T')[0];
    return { minDate: iso(t), maxDate: iso(max) };
  }, []);

  const changeQty = (item, value) => {
    const qty = parseInt(value, 10);
    if (Number.isNaN(qty)) return;
    const clamped = Math.max(item.product.moq, Math.min(qty, item.product.stock));
    updateQuantity(item.product._id, clamped);
  };

  // Kart numarasını 4'erli grupla (göstermelik)
  const handleCardNumber = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    setCard((c) => ({ ...c, number: grouped }));
  };
  const handleExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setCard((c) => ({ ...c, expiry: formatted }));
  };

  const validate = () => {
    const errs = {};
    if (!deliveryDate) errs.deliveryDate = 'Teslimat tarihi seçiniz.';
    if (card.number.replace(/\s/g, '').length !== 16) errs.number = 'Kart numarası 16 hane olmalı.';
    if (!card.name.trim()) errs.name = 'Kart üzerindeki isim zorunlu.';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = 'Son kullanma AA/YY biçiminde.';
    if (!/^\d{3}$/.test(card.cvv)) errs.cvv = 'CVV 3 hane olmalı.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Onaya geçmeden önce form geçerli mi?
  const openConfirm = () => {
    if (validate()) setConfirmOpen(true);
    else toast.error('Lütfen teslimat ve ödeme bilgilerini eksiksiz doldurun.');
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      // Kart bilgileri yalnızca göstermeliktir, sunucuya gönderilmez.
      const payload = {
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        deliveryDate,
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
          message="Katalogdan ürün ekleyerek sipariş listeni oluşturabilirsin."
          action={
            <button className="btn btn--primary" onClick={() => navigate('/')}>
              Kataloğa Git
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Sipariş Listem</h1>

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

        {/* Özet, teslimat ve ödeme */}
        <aside className="card cart-summary">
          <h3>Sipariş Özeti</h3>

          <div className="form-field">
            <label htmlFor="deliveryDate">Teslimat Tarihi *</label>
            <input
              id="deliveryDate"
              type="date"
              className="input"
              min={minDate}
              max={maxDate}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
            {errors.deliveryDate && <span className="form-field__error">{errors.deliveryDate}</span>}
            <span className="form-hint">Bugünden itibaren en fazla 1 ay içinde seçebilirsiniz.</span>
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

          {/* Göstermelik ödeme bilgileri */}
          <div className="payment-box">
            <h4>Ödeme Bilgileri</h4>
            <div className="form-field">
              <label>Kart Numarası</label>
              <input
                className="input"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => handleCardNumber(e.target.value)}
              />
              {errors.number && <span className="form-field__error">{errors.number}</span>}
            </div>
            <div className="form-field">
              <label>Kart Üzerindeki İsim</label>
              <input
                className="input"
                placeholder="Ad Soyad"
                value={card.name}
                onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
              />
              {errors.name && <span className="form-field__error">{errors.name}</span>}
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Son Kul. (AA/YY)</label>
                <input
                  className="input"
                  inputMode="numeric"
                  placeholder="12/28"
                  value={card.expiry}
                  onChange={(e) => handleExpiry(e.target.value)}
                />
                {errors.expiry && <span className="form-field__error">{errors.expiry}</span>}
              </div>
              <div className="form-field">
                <label>CVV</label>
                <input
                  className="input"
                  inputMode="numeric"
                  placeholder="123"
                  value={card.cvv}
                  onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                />
                {errors.cvv && <span className="form-field__error">{errors.cvv}</span>}
              </div>
            </div>
            <span className="form-hint">Bu bilgiler yalnızca demo amaçlıdır, kaydedilmez.</span>
          </div>

          <div className="cart-summary__row cart-summary__row--total">
            <span>Toplam</span>
            <strong>{formatTL(totalAmount)}</strong>
          </div>

          <button className="btn btn--primary btn--block" onClick={openConfirm}>
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
              {submitting ? 'Gönderiliyor...' : 'Onayla ve Öde'}
            </button>
          </>
        }
      >
        <p>
          <strong>{items.length}</strong> kalemden oluşan, toplam{' '}
          <strong>{formatTL(totalAmount)}</strong> tutarındaki siparişi{' '}
          <strong>{formatDateShort(deliveryDate)}</strong> tarihine teslimat için onaylıyor musun?
        </p>
        <p className="text-muted">
          {card.number.slice(-4) && `•••• ${card.number.replace(/\s/g, '').slice(-4)} kartından `}
          ödeme alınacak ve otomatik fatura oluşturulacaktır.
        </p>
      </Modal>
    </div>
  );
};

export default CartPage;
