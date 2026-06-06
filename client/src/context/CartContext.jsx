import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'stokmarket_cart';

/**
 * Sepet (haftalık sipariş listesi) context'i.
 * Her kalem: { product, quantity }. product, katalogdan gelen ürün nesnesidir
 * (effectivePrice, moq, unit, stock alanlarını içerir).
 */
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Açılışta sepeti geri yükle
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Değişiklikleri kalıcı kıl
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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
