import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const STORAGE_KEY = 'numangida_cart';

/**
 * Sepet context'i. Sepet oturuma bağlıdır: giriş yoksa sepet boştur.
 * Her kalem: { product, quantity }.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [items, setItems] = useState([]);

  // Oturum durumuna göre sepeti yükle veya temizle.
  // Giriş yapılmamışsa sepet boştur ve depodan silinir.
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [isAuthenticated, loading]);

  // Değişiklikleri kalıcı kıl (yalnızca giriş yapılmışsa)
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  // Ürünü sepete ekle; varsa miktarı artır. Başlangıç miktarı MOQ kadardır.
  const addItem = (product, quantity) => {
    const qty = quantity ?? product.moq ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const clearCart = () => setItems([]);

  // Türetilen değerler (toplam adet ve tutar)
  const { totalItems, totalAmount } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.totalItems += i.quantity;
        acc.totalAmount += i.quantity * (i.product.effectivePrice ?? i.product.price);
        return acc;
      },
      { totalItems: 0, totalAmount: 0 }
    );
  }, [items]);

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart, CartProvider içinde kullanılmalıdır.');
  return ctx;
};
