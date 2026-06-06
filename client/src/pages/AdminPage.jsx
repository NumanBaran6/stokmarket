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
  category: '',
  price: '',
  vipPrice: '',
  unit: 'koli',
  moq: 1,
  stock: 0,
  imageUrl: '',
};

/**
 * Yönetici paneli.
 * - Ürünler sekmesi: ürün ekleme/düzenleme/silme (modal form ile).
 * - Kategoriler sekmesi: kategori ekleme/silme.
 * Tüm işlemler admin korumalı backend endpoint'lerine gider.
 */
const AdminPage = () => {
  const toast = useToast();
  const [tab, setTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ürün form modalı
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Kategori ekleme formu
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(p.data.data);
      setCategories(c.data.data);
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
      category: product.category?._id || product.category || '',
      price: product.price,
      vipPrice: product.vipPrice ?? '',
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

  // --- Kategori işlemleri ---
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    try {
      await api.post('/categories', newCategory);
      toast.success('Kategori eklendi.');
      setNewCategory({ name: '', description: '' });
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`"${cat.name}" kategorisi silinsin mi?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      toast.success('Kategori silindi.');
      loadData();
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
          className={`tab ${tab === 'categories' ? 'tab--active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Kategoriler ({categories.length})
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

      {/* KATEGORİLER SEKMESİ */}
      {tab === 'categories' && (
        <div className="admin-categories">
          <form className="card category-form" onSubmit={addCategory}>
            <h3>Yeni Kategori</h3>
            <input
              className="input"
              placeholder="Kategori adı"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Açıklama (opsiyonel)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
            <button className="btn btn--primary" type="submit">
              Ekle
            </button>
          </form>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Açıklama</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td data-label="Ad">{c.name}</td>
                    <td data-label="Açıklama">{c.description || '—'}</td>
                    <td>
                      <button className="btn btn--danger btn--sm" onClick={() => deleteCategory(c)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
            <FormField label="Fiyat (₺)" name="price" error={errors.price}>
              <input className="input" type="number" name="price" value={form.price} onChange={handleFormChange} />
            </FormField>
            <FormField label="VIP Fiyat (₺, ops.)" name="vipPrice">
              <input className="input" type="number" name="vipPrice" value={form.vipPrice} onChange={handleFormChange} />
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
