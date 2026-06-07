import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import { CrateIcon } from '../components/Logo.jsx';
import { formatTL } from '../utils/format.js';

/**
 * Tek ürün detay sayfası.
 * Miktar seçimi MOQ ve stok sınırlarına uyar.
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.data);
        setQty(data.data.moq);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner fullPage />;
  if (error) return <div className="container"><p className="text-danger">{error}</p></div>;
  if (!product) return null;

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${product.name} sepete eklendi.`);
  };

  return (
    <div className="container product-detail">
      <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
        ← Katalova dön
      </button>

      <div className="product-detail__grid">
        <div className="product-detail__image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="product-card__placeholder product-card__placeholder--lg">
              <CrateIcon size={120} />
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <span className="product-card__category">{product.category?.name}</span>
          <h1>{product.name}</h1>
          <p className="product-detail__desc">{product.description || 'Açıklama bulunmuyor.'}</p>

          <div className="product-detail__price">
            <span className="price price--lg">{formatTL(product.effectivePrice)}</span>
            <span className="price__unit">/ {product.unit}</span>
            {product.isDiscounted && (
              <>
                <span className="price__old">{formatTL(product.price)}</span>
                {product.tierLabel && (
                  <span className="product-card__vip">{product.tierLabel} Fiyat</span>
                )}
              </>
            )}
          </div>

          <ul className="product-detail__specs">
            <li>Satış birimi: <strong>{product.unit}</strong></li>
            <li>Minimum sipariş: <strong>{product.moq} {product.unit}</strong></li>
            <li className={outOfStock ? 'text-danger' : ''}>
              Stok durumu: <strong>{outOfStock ? 'Tükendi' : `${product.stock} ${product.unit}`}</strong>
            </li>
          </ul>

          {!isAdmin && (
            <div className="product-detail__buy">
              <input
                type="number"
                className="qty-input"
                value={qty}
                min={product.moq}
                max={product.stock}
                onChange={(e) =>
                  setQty(Math.max(product.moq, Math.min(Number(e.target.value), product.stock)))
                }
              />
              <button
                className="btn btn--primary"
                onClick={handleAdd}
                disabled={outOfStock || !isAuthenticated}
              >
                {!isAuthenticated ? 'Sipariş için giriş yapın' : 'Sepete Ekle'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
