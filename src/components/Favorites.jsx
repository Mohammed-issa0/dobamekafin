// src/pages/Favorites.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProductById } from "../data/products";
import { useAuth } from "../context/AuthContext";

const WL_KEY = "wishlist";

function readWishlistIds() {
  try {
    const arr = JSON.parse(localStorage.getItem(WL_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeWishlistIds(ids) {
  localStorage.setItem(WL_KEY, JSON.stringify(Array.from(new Set(ids))));
  // حتى يتحدّث عدّاد القلب بالنافبار فورًا
  window.dispatchEvent(new Event("wishlist:updated"));
}

// =========================
// Wrapper: يتحقق من تسجيل الدخول فقط
// =========================
export default function Favorites() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto" dir="rtl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">
            يجب تسجيل الدخول أولاً
          </h1>
          <p className="text-gray-600 mb-5">
            سجّل الدخول للوصول إلى محتوى المتجر وعرض المنتجات.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="rounded-xl bg-primary text-white px-5 py-2 hover:bg-primary/90"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-primary text-primary px-5 py-2 hover:bg-primary hover:text-white"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <FavoritesInner />;
}

// =========================
// Inner: كل الـHooks هنا (ثابتة دائماً)
// =========================
function FavoritesInner() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [ids, setIds] = useState(() => readWishlistIds());
  const [toast, setToast] = useState("");

  const items = useMemo(
    () => ids.map((id) => getProductById(id)).filter(Boolean),
    [ids]
  );

  useEffect(() => {
    const onSync = () => setIds(readWishlistIds());
    window.addEventListener("storage", onSync);
    window.addEventListener("wishlist:updated", onSync);
    document.addEventListener("visibilitychange", onSync);
    window.addEventListener("focus", onSync);
    return () => {
      window.removeEventListener("storage", onSync);
      window.removeEventListener("wishlist:updated", onSync);
      document.removeEventListener("visibilitychange", onSync);
      window.removeEventListener("focus", onSync);
    };
  }, []);

  const removeOne = (id) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    writeWishlistIds(next);
    setToast("أُزيل من المفضّلة");
    setTimeout(() => setToast(""), 1200);
  };

  const clearAll = () => {
    setIds([]);
    writeWishlistIds([]);
    setToast("تم مسح المفضّلة");
    setTimeout(() => setToast(""), 1200);
  };

  const addToCartAndToast = (p) => {
    addToCart({ ...p, image: p.images?.[0] });
    setToast("أُضيف إلى السلة");
    setTimeout(() => setToast(""), 1200);
  };

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* توست */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black text-white px-4 py-2 text-sm shadow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">المفضّلة</h1>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm rounded-full border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
          >
            مسح الكل
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-600 mb-3">قائمتك فارغة الآن.</p>
          <button
            onClick={() => navigate("/shop")}
            className="rounded-xl bg-primary text-white px-5 py-2 hover:bg-primary/90"
          >
            ابدأ التسوّق
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div
                className="relative h-48 sm:h-56 cursor-pointer"
                onClick={() => navigate(`/product/${p.slug}`)}
                title="تفاصيل المنتج"
              >
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-black/75 text-white text-[11px] rounded-full">
                    {p.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
                    {p.name}
                  </h3>
                  <div className="text-primary font-bold">
                    {Number(p.price).toLocaleString()} ل.س
                  </div>
                </div>
                <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                  {p.descriptionShort}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => addToCartAndToast(p)}
                    className="col-span-2 bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
                  >
                    إضافة للسلة
                  </button>
                  <button
                    onClick={() => removeOne(p.id)}
                    className="border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50"
                    title="إزالة من المفضلة"
                  >
                    إزالة
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
