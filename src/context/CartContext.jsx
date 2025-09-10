import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const LS_KEY = "cart";

export function CartProvider({ children }) {
  // مصدر الحقيقة الوحيد
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      const arr = saved ? JSON.parse(saved) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  });

  // احفظ أي تعديل
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // مزامنة بين التبويبات/النوافذ
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_KEY) {
        try {
          const arr = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(Array.isArray(arr) ? arr : []);
        } catch {
          setCartItems([]);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // إضافة
  const addToCart = (product) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: (next[idx].quantity || 1) + 1 };
        return next;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // إزالة بالكامل
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  };

  // تغيير الكمية + ضمان حد أدنى 1
  const updateQuantity = (productId, change) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === productId
          ? { ...i, quantity: Math.max(1, (i.quantity || 1) + change) }
          : i
      )
    );
  };

  // تعيين كمية مباشرة (اختياري)
  const setQuantity = (productId, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    setCartItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: q } : i))
    );
  };
  const clearCart = () => {
    setCartItems([]);
    localStorage.clear("cart");
  };
  // وصدّره ضمن value

  // تفريغ السلة

  // عدّاد العناصر (يجمع الكميات)
  const cartCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
    [cartItems]
  );
  const getCartCount = () => cartCount;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    clearCart,
    cartCount,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
