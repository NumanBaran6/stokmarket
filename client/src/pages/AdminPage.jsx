import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import FormField from '../components/FormField.jsx';
import { formatTL } from '../utils/format.js';

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  origin: '',
  grade: '',
  category: '',
  price: '',
  vipPrice: '',
  vipPlusPrice: '',
  unit: 'kasa',
  moq: 1,
  stock: 0,
  imageUrl: '',
};

const TIER_LABEL = { standard: 'Standart', vip: 'VIP', 'vip+': 'VIP+' };

/**
 * Yönetici paneli.
 * - Ürünler sekmesi: ürün ekleme/düzenleme/silme (fiyat, VIP ve VIP+ fiyatları).
 * - Üyeler sekmesi: kayıtlı bayileri listeler, seviyelerini (Standart/VIP/VIP+) değiştirir.
 */
const AdminPage = () => {
  const toast = useToast();
  const [tab, setTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ürün form modalı
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c, u, s] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/users'),
        api.get('/orders/stats'),
      ]);
      setProducts(p.data.data);
      setCategories(c.data.data);
      setMembers(u.data.data);
      setStats(s.data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Ürün işlemleri ---
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_PRODUCT, category: categories[0]?._id || '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || '',
      origin: product.origin || '',
      grade: product.grade || '',
      category: product.category?._id || product.category || '',
      price: product.price,
      vipPrice: product.vipPrice ?? '',
      vipPlusPrice: product.vipPlusPrice ?? '',
      unit: product.unit,
      moq: product.moq,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validateProduct = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Ürün adı zorunludur.';
    if (!form.category) errs.category = 'Kategori seçiniz.';
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Geçerli bir fiyat giriniz.';
    if (Number(form.moq) < 1) errs.moq = 'MOQ en az 1 olmalıdır.';
    if (Number(form.stock) < 0) errs.stock = 'Stok negatif olamaz.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!validateProduct()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        vipPrice: form.vipPrice === '' ? null : Number(form.vipPrice),
        vipPlusPrice: form.vipPlusPrice === '' ? null : Number(form.vipPlusPrice),
        moq: Number(form.moq),
        stock: Number(form.stock),
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Ürün güncellendi.');
      } else {
        await api.post('/products', payload);
        toast.success('Ürün eklendi.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`"${product.name}" silinsin mi?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      toast.success('Ürün silindi.');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- Üye seviyesi değiştirme ---
  const changeTier = async (member, tier) => {
    try {
      await api.put(`/users/${member._id}/tier`, { tier });
      setMembers((list) => list.map((m) => (m._id === member._id ? { ...m, tier } : m)));
      toast.success(`${member.shopName} → ${TIER_LABEL[tier]}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- Üye minimum sipariş ayrıcalığı değiştirme ---
  const changePrivilege = async (member, moqPrivilege) => {
    try {
      await api.put(`/users/${member._id}/moq`, { moqPrivilege });
      setMembers((list) =>
        list.map((m) => (m._id === member._id ? { ...m, moqPrivilege } : m))
      );
      toast.success(`${member.shopName} → min sipariş ayrıcalığı güncellendi`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // Görsel dosyasını backend'e yükle ve dönen URL'i forma yaz
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, imageUrl: res.data.url }));
      toast.success('Görsel yüklendi.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner fullPage />;

  return (
    <div className="container admin-page">
      <h1>Yönetim Paneli</h1>

      <div className="tabs">
        <button
          className={`tab ${tab === 'products' ? 'tab--active' : ''}`}
          onClick={() => setTab('products')}
        >
          Ürünler ({products.length})
        </button>
        <button
          className={`tab ${tab === 'members' ? 'tab--active' : ''}`}
          onClick={() => setTab('members')}
        >
          Üyeler ({members.length})
        </button>
        <button
          className={`tab ${tab === 'stats' ? 'tab--active' : ''}`}
          onClick={() => setTab('stats')}
        >
          Ciro
        </button>
      </div>

      {/* ÜRÜNLER SEKMESİ */}
      {tab === 'products' && (
        <>
          <div className="admin-toolbar">
            <button className="btn btn--primary" onClick={openCreate}>
              + Yeni Ürün
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>VIP</th>
                  <th>VIP+</th>
                  <th>MOQ</th>
                  <th>Stok</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td data-label="Ürün">{p.name}</td>
                    <td data-label="Kategori">{p.category?.name}</td>
                    <td data-label="Fiyat">{formatTL(p.price)}</td>
                    <td data-label="VIP">{p.vipPrice != null ? formatTL(p.vipPrice) : '—'}</td>
                    <td data-label="VIP+">{p.vipPlusPrice != null ? formatTL(p.vipPlusPrice) : '—'}</td>
                    <td data-label="MOQ">{p.moq} {p.unit}</td>
                    <td data-label="Stok">{p.stock}</td>
                    <td className="table__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => openEdit(p)}>
                        Düzenle
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => deleteProduct(p)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ÜYELER SEKMESİ */}
      {tab === 'members' && (
        <>
          <div className="admin-toolbar">
            <input
              type="search"
              className="input"
              placeholder="İsim, bayi adı, e-posta veya telefon ile ara..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{ maxWidth: '480px' }}
            />
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Bayi / Dükkan</th>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Telefon</th>
                  <th>Seviye</th>
                  <th>Min. Sipariş</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const q = memberSearch.trim().toLowerCase();
                  const list = q
                    ? members.filter((m) =>
                        [m.email, m.shopName, m.name, m.phone]
                          .filter(Boolean)
                          .some((f) => f.toLowerCase().includes(q))
                      )
                    : members;
                  if (list.length === 0) {
                    return (
                      <tr>
                        <td colSpan="6" className="text-muted">
                          {q ? 'Eşleşen üye bulunamadı.' : 'Henüz kayıtlı üye yok.'}
                        </td>
                      </tr>
                    );
                  }
                  return list.map((m) => (
                    <tr key={m._id}>
                      <td data-label="Bayi">{m.shopName}</td>
                      <td data-label="Ad Soyad">{m.name}</td>
                      <td data-label="E-posta">{m.email}</td>
                      <td data-label="Telefon">{m.phone || '—'}</td>
                      <td data-label="Seviye">
                        <select
                          className="input"
                          value={m.tier}
                          onChange={(e) => changeTier(m, e.target.value)}
                        >
                          <option value="standard">Standart</option>
                          <option value="vip">VIP</option>
                          <option value="vip+">VIP+</option>
                        </select>
                      </td>
                      <td data-label="Min. Sipariş">
                        <select
                          className="input"
                          value={m.moqPrivilege || 'normal'}
                          onChange={(e) => changePrivilege(m, e.target.value)}
                        >
                          <option value="normal">Normal</option>
                          <option value="half">Yarısı kadar</option>
                          <option value="none">Min. yok</option>
                        </select>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CİRO SEKMESİ */}
      {tab === 'stats' && stats && (
        <>
          <div className="stat-cards">
            <div className="card stat-card">
              <span className="stat-card__label">Toplam Ciro</span>
              <strong className="stat-card__value">{formatTL(stats.revenue)}</strong>
              <span className="text-muted">iptaller hariç</span>
            </div>
            <div className="card stat-card">
              <span className="stat-card__label">Toplam Sipariş</span>
              <strong className="stat-card__value">{stats.orderCount}</strong>
              <span className="text-muted">{stats.activeCount} aktif</span>
            </div>
            <div className="card stat-card">
              <span className="stat-card__label">Ortalama Sipariş</span>
              <strong className="stat-card__value">{formatTL(stats.avgOrder)}</strong>
            </div>
          </div>

          <div className="stats-grid">
            <div className="card">
              <h3>Sipariş Durumları</h3>
              <table className="table">
                <tbody>
                  {Object.entries(stats.byStatus).map(([s, n]) => (
                    <tr key={s}>
                      <td style={{ textTransform: 'capitalize' }}>{s}</td>
                      <td className="text-right">{n}</td>
                    </tr>
                  ))}
                  {Object.keys(stats.byStatus).length === 0 && (
                    <tr><td className="text-muted">Henüz sipariş yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>En Çok Ciro Yapan Ürünler</h3>
              <table className="table">
                <tbody>
                  {stats.topProducts.map((p) => (
                    <tr key={p.name}>
                      <td>{p.name}</td>
                      <td className="text-right">{formatTL(p.total)}</td>
                    </tr>
                  ))}
                  {stats.topProducts.length === 0 && (
                    <tr><td className="text-muted">Henüz veri yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ÜRÜN EKLE/DÜZENLE MODALI */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Ürünü Düzenle' : 'Yeni Ürün'}
      >
        <form onSubmit={saveProduct} className="product-form">
          <FormField label="Ürün Adı" name="name" error={errors.name}>
            <input className="input" name="name" value={form.name} onChange={handleFormChange} />
          </FormField>

          <FormField label="Kategori" name="category" error={errors.category}>
            <select className="input" name="category" value={form.category} onChange={handleFormChange}>
              <option value="">Seçiniz...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Açıklama" name="description">
            <textarea
              className="input"
              name="description"
              rows="2"
              value={form.description}
              onChange={handleFormChange}
            />
          </FormField>

          <div className="form-row">
            <FormField label="Üretim Yeri" name="origin">
              <input className="input" name="origin" value={form.origin} onChange={handleFormChange} placeholder="Örn. Antalya" />
            </FormField>
            <FormField label="Sınıf" name="grade">
              <input className="input" name="grade" value={form.grade} onChange={handleFormChange} placeholder="Örn. 1. Sınıf" />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Fiyat (₺)" name="price" error={errors.price}>
              <input className="input" type="number" name="price" value={form.price} onChange={handleFormChange} />
            </FormField>
            <FormField label="VIP Fiyat (₺)" name="vipPrice">
              <input className="input" type="number" name="vipPrice" value={form.vipPrice} onChange={handleFormChange} />
            </FormField>
            <FormField label="VIP+ Fiyat (₺)" name="vipPlusPrice">
              <input className="input" type="number" name="vipPlusPrice" value={form.vipPlusPrice} onChange={handleFormChange} />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Birim" name="unit">
              <input className="input" name="unit" value={form.unit} onChange={handleFormChange} />
            </FormField>
            <FormField label="MOQ" name="moq" error={errors.moq}>
              <input className="input" type="number" name="moq" value={form.moq} onChange={handleFormChange} />
            </FormField>
            <FormField label="Stok" name="stock" error={errors.stock}>
              <input className="input" type="number" name="stock" value={form.stock} onChange={handleFormChange} />
            </FormField>
          </div>

          <FormField label="Ürün Görseli (dosya yükle)" name="imageUrl">
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && <span className="form-hint">Yükleniyor...</span>}
            {form.imageUrl && !uploading && (
              <div className="image-preview">
                <img src={form.imageUrl} alt="Önizleme" />
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                >
                  Görseli kaldır
                </button>
              </div>
            )}
          </FormField>

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>
              Vazgeç
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPage;
