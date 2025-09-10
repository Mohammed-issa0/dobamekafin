import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  ShoppingCart,
  UserRound,
  ChevronDown,
  LogOut,
  UserCircle2,
  ScrollText,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import logo from "../../public/logo.jpg";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/admin";
import { Heart } from "lucide-react";

import { useLocation } from "react-router-dom"; // لو مش مضاف
function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts[1]?.[0] || "";
  return (first + last || first || "?").toUpperCase();
}
function hueFromString(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

function Avatar({ user }) {
  const label = user?.name || user?.email || "Guest";
  const initials = user ? initialsFromName(user.name || user.email) : null;
  const h = hueFromString(label);
  const bg = `linear-gradient(135deg,
  hsl(48 100% 45%) 0%,
  hsl(42 95% 40%) 50%,
  hsl(36 90% 35%) 100%)`;

  return (
    <div
      className="h-9 w-9 rounded-full grid place-items-center text-white shadow ring-1 ring-black/5 select-none"
      style={user ? { backgroundImage: bg } : undefined}
      title={user ? label : "الملف الشخصي"}
      aria-label={user ? label : "الملف الشخصي"}
    >
      {user ? (
        <span className="text-xs font-semibold tracking-wide">{initials}</span>
      ) : (
        <UserRound className="h-5 w-5 text-gray-700" />
      )}
    </div>
  );
}

function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // إغلاق عند الضغط خارج المنيو أو زر Escape
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:bg-gray-100 px-1.5 py-1 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} />
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-2  mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-50 origin-top-left"
            role="menu"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user ? user.name || user.email : "زائر"}
              </p>
              {user?.email && (
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              )}
            </div>
            <div className="h-px bg-gray-100" />
            {user ? (
              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <UserCircle2 className="h-4 w-4 text-gray-600" />
                  الملف الشخصي
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <ScrollText className="h-4 w-4 text-gray-600" />
                  طلباتي
                </Link>

                {isAdmin(user) && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {/* أيقونة بسيطة للوحة */}
                    <svg
                      className="h-4 w-4 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M4 4h7v7H4V4zm9 0h7v5h-7V4zM4 13h7v7H4v-7zm9 6v-9h7v9h-7z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                    لوحة التحكم
                  </Link>
                )}

                <button
                  onClick={() => {
                    setOpen(false);

                    onLogout?.();
                  }}
                  className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </button>
              </div>
            ) : (
              <div className="py-1">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  دخول
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar() {
  const { getCartCount, clearCart } = useCart();
  const cartCount = getCartCount();
  const { user, logout } = useAuth();

  const WL_KEY = "wishlist";
  const [favCount, setFavCount] = useState(0);
  const location = useLocation();

  const handleLogout = () => {
    try {
      // صفّر حالة السلة في الكونتكست إن متوفرة
      if (typeof clearCart === "function") {
        clearCart();
      }

      // امسح التخزين المحلي
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");

      // بثّ أحداث لتحديث العدّادات فوراً
      window.dispatchEvent(new Event("cart:clear"));
      window.dispatchEvent(new Event("wishlist:updated"));

      // صفّر عدّاد المفضلة في الناف فوراً (تحسّن بصري)
      setFavCount(0);
    } finally {
      // أخيراً سجّل الخروج من الأوث
      logout();
    }
  };

  function readFavCount() {
    try {
      const arr = JSON.parse(localStorage.getItem(WL_KEY) || "[]");
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  useEffect(() => {
    const update = () => setFavCount(readFavCount());
    update(); // أول مرة
    window.addEventListener("storage", update);
    window.addEventListener("wishlist:updated", update);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("wishlist:updated", update);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  // تحديت بسيط عند تغيّر المسار (يضمن التزامن)
  useEffect(() => {
    setFavCount(readFavCount());
  }, [location.pathname]);

  // توزيع: نخلي الشريط عكسي بحيث تظهر مجموعة الإجراءات على اليسار واللوجو على اليمين
  // (dir=rtl للنص فقط، أما الترتيب فبالـ flex-row-reverse)
  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between flex-row-reverse">
          {/* الشعار (يمين) */}
          <Link to="/" className="flex items-center">
            <motion.img
              whileHover={{ scale: 1.06 }}
              src={logo}
              alt="دوباميكافين"
              className="h-12 w-auto rounded-full"
            />
          </Link>

          {/* مجموعة الإجراءات (تظهر يسار الشريط) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* أيقونة/منيو المستخدم — أول عنصر يسار */}
            <AccountMenu user={user} onLogout={logout} />

            {/* رابط المتجر */}
            <Link to="/shop" aria-label="الذهاب إلى المتجر">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Store className="h-6 w-6 text-primary font-bold" />
              </motion.div>
            </Link>

            {/* السلة مع الشارة */}
            <Link to="/cart" aria-label="الذهاب إلى السلة" className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ShoppingCart className="h-6 w-6 text-primary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </motion.div>
            </Link>
            {/* المفضّلة */}
            <Link
              to="/favorites"
              aria-label="الذهاب إلى المفضلة"
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full hover:bg-gray-100"
                title="المفضلة"
              >
                <Heart
                  className={`h-6 w-6 ${
                    favCount ? "text-amber-600" : "text-primary"
                  }`}
                />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
