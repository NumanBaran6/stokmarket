import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ReminderBanner from '../components/ReminderBanner.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Anasayfa / Ürün kataloğu.
 * Arama ve kategori filtresiyle ürünleri listeler.
 */
const CatalogPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  // Kategorileri bir kez yükle
  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  }, []);

  // Ürünleri filtreye göre yükle (arama yazıldıkça gecikmeli/debounce)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory) params.category = activeCategory;
      const { data } = await api.get('/products', { params });
      setProducts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="container">
      {isAuthenticated && user?.role === 'customer' && <ReminderBanner />}

      <section className="hero hero--center">
        <h1 className="hero__tagline">Tarladan en taze haliyle...</h1>
        <p className="hero__sub">
          Sabahın ilk ışığında halden seçtiğimiz meyve ve sebzeler, aynı gün tezgâhınızda.
          Aradan komisyoncuyu çıkardık; doğrudan üreticiden, dalından koparılmış tazelikte
          kasanıza geliyor.
        </p>
      </section>

      {/* Arama ve kategori filtreleri */}
      <div className="catalog__filters">
        <input
          type="search"
          className="input"
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="catalog__categories">
          <button
            className={`chip ${activeCategory === '' ? 'chip--active' : ''}`}
            onClick={() => setActiveCategory('')}
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`chip ${activeCategory === cat._id ? 'chip--active' : ''}`}
              onClick={() => setActiveCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik durumu */}
      {loading ? (
        <Spinner fullPage label="Ürünler yükleniyor..." />
      ) : error ? (
        <EmptyState title="Bir hata oluştu" message={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Ürün bulunamadı"
          message="Arama veya filtre kriterlerinize uygun ürün yok."
        />
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
