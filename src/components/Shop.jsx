// src/pages/Shop.jsx
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import productsData, { getFeaturedProducts } from "../data/products";
import Footer from "./Footer";

function Arrow({ onClick, dir = "prev" }) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hidden md:grid absolute top-1/2 -translate-y-1/2 z-20 place-items-center h-10 w-10 rounded-full bg-white/90 shadow ring-1 ring-black/5 hover:bg-white transition ${
        isPrev ? "right-2" : "left-2"
      }`}
      aria-label={isPrev ? "السابق" : "التالي"}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-gray-800"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        {isPrev ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}

function usePriceBounds(list) {
  return useMemo(() => {
    if (!list.length) return { min: 0, max: 0 };
    let mn = Infinity,
      mx = -Infinity;
    for (const p of list) {
      const v = Number(p.price) || 0;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    if (!isFinite(mn) || !isFinite(mx)) return { min: 0, max: 0 };
    // تقريب جميل
    const roundTo = (n, step) => Math.floor(n / step) * step;
    const ceilTo = (n, step) => Math.ceil(n / step) * step;
    const step = Math.max(1000, Math.round((mx - mn) / 20 / 1000) * 1000);
    return { min: roundTo(mn, step), max: ceilTo(mx, step) };
  }, [list]);
}

export default function Shop() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // سلايدر المميزة
  const featuredProducts = useMemo(() => getFeaturedProducts(), []);
  const sliderSettings = {
    rtl: true,
    dots: false,
    infinite: true,
    speed: 450,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <Arrow dir="next" />,
    prevArrow: <Arrow dir="prev" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  // فلاتر
  const allCategories = useMemo(
    () =>
      Array.from(new Set(productsData.map((p) => p.category))).filter(Boolean),
    []
  );
  const [query, setQuery] = useState("");
  const [selCats, setSelCats] = useState(new Set()); // متعدد
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const bounds = usePriceBounds(productsData);
  const [priceMin, setPriceMin] = useState(bounds.min);
  const [priceMax, setPriceMax] = useState(bounds.max);
  const [ratingMin, setRatingMin] = useState(0);
  const [sort, setSort] = useState("popular"); // popular | price_asc | price_desc | rating_desc | newest
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setPriceMin(bounds.min);
    setPriceMax(bounds.max);
  }, [bounds.min, bounds.max]);

  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (query.trim()) c++;
    if (selCats.size) c++;
    if (onlyFeatured) c++;
    if (ratingMin > 0) c++;
    if (priceMin > bounds.min || priceMax < bounds.max) c++;
    if (sort === "rating_desc" || sort === "rating_asc") c++;
    return c;
  }, [query, selCats, onlyFeatured, ratingMin, priceMin, priceMax, bounds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inRange = (v) => v >= priceMin && v <= priceMax;
    return productsData
      .filter((p) => {
        if (onlyFeatured && !p.featured) return false;
        if (selCats.size && !selCats.has(p.category)) return false;
        if (!inRange(Number(p.price) || 0)) return false;
        if (ratingMin > 0 && (Number(p.rating) || 0) < ratingMin) return false;
        if (q) {
          const text = `${p.name || ""} ${p.descriptionShort || ""} ${
            p.descriptionLong || ""
          }`.toLowerCase();
          if (!text.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "price_asc") return Number(a.price) - Number(b.price);
        if (sort === "price_desc") return Number(b.price) - Number(a.price);
        if (sort === "rating_desc")
          return Number(b.rating || 0) - Number(a.rating || 0);
        if (sort === "newest") return Number(b.id || 0) - Number(a.id || 0);
        // popular (افتراضي): المميز أولاً ثم الأعلى تقييماً
        const fa = a.featured ? 1 : 0;
        const fb = b.featured ? 1 : 0;
        if (fa !== fb) return fb - fa;
        return Number(b.rating || 0) - Number(a.rating || 0);
      });
  }, [query, selCats, onlyFeatured, ratingMin, priceMin, priceMax, sort]);

  // تقسيم صفحات بسيط
  const [limit, setLimit] = useState(9);
  useEffect(
    () => setLimit(9),
    [query, selCats, onlyFeatured, ratingMin, priceMin, priceMax, sort]
  );
  const visible = filtered.slice(0, limit);
  const canLoadMore = limit < filtered.length;

  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const handleAddToCart = (product) => {
    const payload = { ...product, image: product.images?.[0] };
    addToCart(payload);
    setNotification({
      show: true,
      message: `تم إضافة ${product.name} إلى السلة`,
    });
    setTimeout(() => setNotification({ show: false, message: "" }), 1600);
  };
  const handleBuyNow = (product) => {
    const payload = { ...product, image: product.images?.[0] };
    addToCart(payload);
    navigate("/cart");
  };

  const toggleCat = (c) => {
    const next = new Set(selCats);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setSelCats(next);
  };

  const resetFilters = () => {
    setQuery("");
    setSelCats(new Set());
    setOnlyFeatured(false);
    setPriceMin(bounds.min);
    setPriceMax(bounds.max);
    setRatingMin(0);
    setSort("popular");
  };

  const FilterSidebar = (
    <div className="w-full lg:w-72 shrink-0">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sticky top-20">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-900">الفلاتر</div>
          <button
            onClick={resetFilters}
            className="text-xs underline text-gray-500 hover:text-gray-700"
          >
            تصفير
          </button>
        </div>

        {/* البحث داخل الفلاتر على الجوال */}
        <div className="relative mb-4 block lg:hidden">
          <input
            type="text"
            placeholder="ابحث…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pr-10 pl-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* السعر */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-gray-700 mb-2">السعر</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              value={priceMin}
              min={bounds.min}
              max={priceMax}
              onChange={(e) =>
                setPriceMin(
                  Math.min(
                    Math.max(bounds.min, Number(e.target.value) || bounds.min),
                    priceMax
                  )
                )
              }
            />
            <input
              type="number"
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              value={priceMax}
              min={priceMin}
              max={bounds.max}
              onChange={(e) =>
                setPriceMax(
                  Math.max(
                    Math.min(bounds.max, Number(e.target.value) || bounds.max),
                    priceMin
                  )
                )
              }
            />
          </div>
          {/* منزلقان بسيطان لمدى السعر */}
          <div className="mt-3 space-y-2">
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              value={priceMin}
              onChange={(e) =>
                setPriceMin(Math.min(Number(e.target.value), priceMax))
              }
              className="w-full"
            />
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              value={priceMax}
              onChange={(e) =>
                setPriceMax(Math.max(Number(e.target.value), priceMin))
              }
              className="w-full"
            />
            <div className="text-[11px] text-gray-500">
              من{" "}
              <span className="font-medium text-gray-700">
                {priceMin.toLocaleString()}{" "}
              </span>
              إلى{" "}
              <span className="font-medium text-gray-700">
                {priceMax.toLocaleString()}{" "}
              </span>
              ليرة سورية
            </div>
          </div>
        </div>

        {/* التصنيفات */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            التصنيف
          </div>
          <div className="space-y-1.5 max-h-40 overflow-auto pr-1">
            {allCategories.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selCats.has(c)}
                  onChange={() => toggleCat(c)}
                  className="ml-1"
                />
                <span className="capitalize">{c}</span>
              </label>
            ))}
          </div>
        </div>

        {/* التقييم (زرين فقط) */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            حسب التقييم
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSort("rating_desc")}
              className={`px-3 py-1 rounded-full border text-xs ${
                sort === "rating_desc"
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              الأعلى ★
            </button>
          </div>
        </div>

        {/* مميز فقط */}
        <div className="mb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyFeatured}
              onChange={(e) => setOnlyFeatured(e.target.checked)}
            />
            عرض المنتجات المميزة فقط
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
        {/* إشعار */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-black text-white px-5 py-2.5 rounded-full shadow">
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* رأس الصفحة: بحث + فرز + زر فلاتر للموبايل */}
        <div className="pt-6 pb-4">
          {/* شرائح مميزة */}
          {featuredProducts?.length > 0 && (
            <div className="my-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg sm:text-2xl font-bold text-primary">
                  القهوة المميزة
                </h2>
              </div>
              <div className="relative rounded-2xl border border-gray-100 bg-white p-2 sm:p-3 shadow-sm">
                <Slider {...sliderSettings}>
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="px-1.5 py-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer group border border-gray-100 my-2"
                        onClick={() => navigate(`/product/${product.slug}`)}
                      >
                        <div className="relative h-48 sm:h-56">
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                              مميز
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {product.name}
                            </h3>
                            <div className="text-primary font-bold">
                              {Number(product.price).toLocaleString()} ل.س
                            </div>
                          </div>
                          <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                            {product.descriptionShort}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {/* بحث */}
            <div className="relative flex-1 min-w-[220px] max-w-xl">
              <input
                type="text"
                placeholder="ابحث عن القهوة…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* فرز */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">فرز:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="popular">الأكثر رواجًا</option>
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: من الأرخص</option>
                <option value="price_desc">السعر: من الأغلى</option>
                <option value="rating_desc">الأعلى تقييمًا</option>
              </select>
            </div>

            {/* زر الفلاتر (موبايل) */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="ml-auto lg:hidden inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <FunnelIcon className="h-5 w-5" />
              الفلاتر {activeFiltersCount ? `(${activeFiltersCount})` : ""}
            </button>
          </div>
        </div>

        {/* هيكل المتجر: فلاتر يمين + شبكة منتجات */}
        <div className="pb-12 flex gap-6">
          {/* فلاتر سطح مكتب */}
          <div className="hidden lg:block">{FilterSidebar}</div>

          {/* محتوى المنتجات */}
          <div className="flex-1 min-w-0">
            {/* شارة الفلاتر الفعالة */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              {query.trim() && (
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                  بحث: “{query}”
                </span>
              )}
              {selCats.size > 0 &&
                Array.from(selCats).map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200"
                    title="إزالة الفلتر"
                  >
                    {c} ✕
                  </button>
                ))}
              {(priceMin > bounds.min || priceMax < bounds.max) && (
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                  السعر: {priceMin.toLocaleString()} -{" "}
                  {priceMax.toLocaleString()} ل.س
                </span>
              )}
              {ratingMin > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                  تقييم {ratingMin}+ ★
                </span>
              )}
              {onlyFeatured && (
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                  مميز فقط
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs underline text-gray-500 hover:text-gray-700"
                >
                  مسح الكل
                </button>
              )}
            </div>

            {/* شبكة المنتجات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {visible.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <div
                    className="relative h-48 sm:h-56 cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/80 text-white text-[11px] rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                      {product.descriptionShort}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-primary font-bold">
                        {Number(product.price).toLocaleString()} ل.س
                      </div>
                      <div className="text-xs text-gray-500">
                        ★ {Number(product.rating || 0).toFixed(1)}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
                      >
                        إضافة للسلة
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white"
                      >
                        اشترِ الآن
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* لا نتائج */}
            {visible.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                لا توجد منتجات مطابقة للبحث/الفلاتر.
              </div>
            )}

            {/* تحميل المزيد */}
            {canLoadMore && (
              <div className="mt-6 grid place-items-center">
                <button
                  onClick={() => setLimit((n) => n + 9)}
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
                >
                  عرض المزيد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* لوحة فلاتر للموبايل */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="absolute top-0 right-0 h-full w-[86%] max-w-sm bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="text-sm font-medium">الفلاتر</div>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-full p-1 hover:bg-gray-50"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  {FilterSidebar}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full rounded-lg bg-black text-white py-2.5"
                  >
                    تطبيق الفلاتر
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}
