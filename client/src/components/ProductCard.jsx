import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatTL } from '../utils/format.js';
import { CrateIcon } from './Logo.jsx';

/**
 * Tek bir ürünü kart olarak gösterir.
 * - VIP kullanıcıya indirimli fiyat ve "VIP" rozeti gösterir.
 * - Minimum sipariş miktarını (MOQ) belirtir.
 * - "Sepete Ekle" yalnızca giriş yapmış müşteriler içindir (admin sipariş vermez).
 */
const ProductCard = ({ product }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(product, product.moq);
    toast.success(`${product.name} sepete eklendi (${product.moq} ${product.unit}).`);
  };

  return (
    <article className="card product-card">
      <Link to={`/urun/${product._id}`} className="product-card__image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card__placeholder">
            <CrateIcon size={64} />
          </div>
        )}
        {product.isDiscounted && product.tierLabel && (
          <span className="product-card__vip">{product.tierLabel} Fiyat</span>
        )}
      </Link>

      <div className="product-card__body">
        <span className="product-card__category">{product.category?.name}</span>
        <Link to={`/urun/${product._id}`} className="product-card__title">
          {product.name}
        </Link>

        <div className="product-card__price">
          <span className="price">{formatTL(product.effectivePrice)}</span>
          <span className="price__unit">/ {product.unit}</span>
          {product.isDiscounted && (
            <span className="price__old">{formatTL(product.price)}</span>
          )}
        </div>

        <div className="product-card__meta">
          <span title="Minimum sipariş miktarı">
            Min. sipariş: {product.moq} {product.unit}
          </span>
          <span className={outOfStock ? 'text-danger' : ''}>
            {outOfStock ? 'Stok yok' : `Stok: ${product.stock} ${product.unit}`}
          </span>
        </div>

        {!isAdmin && (
          <button
            className="btn btn--primary btn--block"
            onClick={handleAdd}
            disabled={outOfStock || !isAuthenticated}
            title={!isAuthenticated ? 'Sipariş için giriş yapın' : ''}
          >
            {!isAuthenticated ? 'Giriş yapın' : outOfStock ? 'Stok yok' : 'Sepete Ekle'}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
