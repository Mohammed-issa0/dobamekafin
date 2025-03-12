import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // ✅ تحميل بيانات السلة من Local Storage عند بداية التشغيل
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : []; // إذا كان هناك بيانات محفوظة، استرجعها
  });

  // ✅ حفظ المنتجات في Local Storage عند تحديث السلة
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ إضافة منتج إلى السلة
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // ✅ إزالة منتج من السلة بالكامل
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // ✅ تحديث الكمية (زيادة أو نقصان)
  const updateQuantity = (productId, change) => {
    setCartItems(prevItems =>
      prevItems
        .map(item =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
    );
  };

  // ✅ إرجاع العدد الإجمالي للمنتجات
  const getCartCount = () => {
    return cartItems.length; // ✅ يحسب العدد بناءً على عدد المنتجات الفريدة
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ✅ دالة لاستخدام السياق بسهولة داخل المكونات
export function useCart() {
  return useContext(CartContext);
}
