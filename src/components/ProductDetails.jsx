// src/pages/ProductDetails.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getProductBySlug } from "../data/products";
import Footer from "./Footer";
const REV_KEY = (id) => `reviews:${id}`;
const WL_KEY = "wishlist";

function Stars({ value = 0, size = 18 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div
      className="flex flex-row-reverse items-center gap-0.5"
      aria-label={`تقييم ${value} من 5`}
    >
      {"★"
        .repeat(full)
        .split("")
        .map((_, i) => (
          <span key={`f-${i}`} style={{ fontSize: size, color: "#fbbf24" }}>
            ★
          </span>
        ))}
      {half && <span style={{ fontSize: size, color: "#fbbf24" }}>☆</span>}
      {"☆"
        .repeat(empty)
        .split("")
        .map((_, i) => (
          <span key={`e-${i}`} style={{ fontSize: size, color: "#e5e7eb" }}>
            ☆
          </span>
        ))}
    </div>
  );
}

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

function Shimmer({ className = "" }) {
  return <div className={`bg-gray-200/80 animate-pulse ${className}`} />;
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [tab, setTab] = useState("overview");
  const [product, setProduct] = useState(null);

  // سلوك الجهاز
  const [isTouch, setIsTouch] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    try {
      setIsTouch(window.matchMedia("(pointer: coarse)").matches);
      setReduceMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch {}
  }, []);

  // الصور والسلايدر
  const [navMain, setNavMain] = useState(null);
  const [navThumbs, setNavThumbs] = useState(null);
  const sliderMainRef = useRef(null);
  const sliderThumbRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState({});
  const [lightbox, setLightbox] = useState({
    open: false,
    idx: 0,
    zoom: false,
  });

  // كمية ومفضلة وإشعارات
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [wish, setWish] = useState(false);

  // مراجعات
  const [userReviews, setUserReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const p = getProductBySlug(slug);
    setProduct(p || null);
    if (p) {
      // مراجعات محلية
      try {
        const local = JSON.parse(localStorage.getItem(REV_KEY(p.id)) || "[]");
        setUserReviews(Array.isArray(local) ? local : []);
      } catch {
        setUserReviews([]);
      }
      // مفضلة
      try {
        const wl = JSON.parse(localStorage.getItem(WL_KEY) || "[]");
        setWish(wl.includes(p.id));
      } catch {
        setWish(false);
      }
    }
    setActiveIndex(0);
    setImgLoaded({});
  }, [slug]);

  useEffect(() => {
    setNavMain(sliderMainRef.current);
    setNavThumbs(sliderThumbRef.current);
  }, []);

  const images = useMemo(() => {
    const imgs = product?.images?.length ? product.images : ["/1.png"];
    return Array.from(new Set(imgs.filter(Boolean)));
  }, [product]);

  const allReviews = useMemo(() => {
    if (!product) return [];
    return [...(product.reviews || []), ...userReviews];
  }, [product, userReviews]);

  const averageRating = useMemo(() => {
    if (!allReviews.length) return product?.rating || 0;
    const s = allReviews.reduce((a, r) => a + Number(r.rating || 0), 0);
    return Math.round((s / allReviews.length) * 10) / 10;
  }, [allReviews, product]);

  const breakdown = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    allReviews.forEach((r) => {
      const n = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
      dist[n - 1]++;
    });
    const total = allReviews.length || 1;
    return dist.map((c) => ({ count: c, pct: Math.round((c / total) * 100) }));
  }, [allReviews]);

  if (!product) {
    return (
      <div
        className="min-h-[60vh] grid place-items-center text-center"
        dir="rtl"
      >
        <div>
          <h2 className="text-xl font-semibold">المنتج غير موجود</h2>
          <button className="mt-3 underline" onClick={() => navigate("/shop")}>
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  const mainSettings = {
    rtl: true,
    infinite: true,
    speed: reduceMotion ? 0 : 350,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: !isTouch, // أخفي الأسهم على اللمس
    nextArrow: <Arrow dir="next" />,
    prevArrow: <Arrow dir="prev" />,
    lazyLoad: "ondemand",
    fade: !reduceMotion,
    adaptiveHeight: true,
    asNavFor: navThumbs,
    beforeChange: (_, next) => setActiveIndex(next),
  };

  const thumbsSettings = {
    rtl: true,
    infinite: false,
    slidesToShow: Math.min(5, images.length),
    swipeToSlide: true,
    focusOnSelect: true,
    arrows: false,
    centerMode: images.length > 4,
    centerPadding: "0px",
    asNavFor: navMain,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: Math.min(5, images.length) },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(4, images.length) },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: Math.min(4, images.length) },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: Math.min(3, images.length) },
      },
    ],
  };

  function onImgLoad(i) {
    setImgLoaded((s) => ({ ...s, [i]: true }));
  }
  function onImgError(i) {
    setImgLoaded((s) => ({ ...s, [i]: true }));
  }

  function openLightbox(i) {
    setLightbox({ open: true, idx: i, zoom: false });
  }

  function toggleWishlist() {
    window.dispatchEvent(new Event("wishlist:updated"));

    try {
      const wl = JSON.parse(localStorage.getItem(WL_KEY) || "[]");
      const exists = wl.includes(product.id);
      const next = exists
        ? wl.filter((x) => x !== product.id)
        : [...wl, product.id];
      localStorage.setItem(WL_KEY, JSON.stringify(next));
      setWish(!exists);
      setToast(exists ? "أزيل من المفضلة" : "أضيف إلى المفضلة");
      setTimeout(() => setToast(""), 1800);
    } catch {
      setWish((v) => !v);
    }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setToast("تم نسخ الرابط");
      setTimeout(() => setToast(""), 1500);
    }
  }

  function addToCartWithQty() {
    const times = Math.max(1, qty);
    for (let i = 0; i < times; i++) addToCart({ ...product, image: images[0] });
    setToast("أضيف المنتج إلى السلة");
    setTimeout(() => setToast(""), 1500);
  }

  function addReviewLocal(newRev) {
    const key = REV_KEY(product.id);
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    const next = [newRev, ...current].slice(0, 200);
    localStorage.setItem(key, JSON.stringify(next));
    setUserReviews(next);
  }

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("يجب تسجيل الدخول لإضافة مراجعة.");
    if (!form.comment || form.comment.trim().length < 10)
      return alert("الرجاء كتابة تعليق من 10 أحرف على الأقل.");
    setSubmitting(true);
    const rev = {
      id: `loc-${Date.now()}`,
      user: user.name || user.email || "مستخدم",
      rating: Number(form.rating || 5),
      comment: form.comment.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    setTimeout(() => {
      addReviewLocal(rev);
      setForm({ rating: 5, comment: "" });
      setSubmitting(false);
      setTab("reviews");
      document
        .getElementById("reviews-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  return (
    <>
      <div className="py-16 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto" dir="rtl">
        {/* توست */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] rounded-full bg-black text-white px-4 py-2 text-sm shadow"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* مسار بسيط */}
        <div className="text-xs sm:text-sm text-gray-500 mb-3">
          <button className="underline" onClick={() => navigate("/shop")}>
            المتجر
          </button>
          <span className="mx-1">/</span>
          <span>{product.category}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* صور المنتج */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sm:p-3">
            <div className="relative">
              <Slider ref={sliderMainRef} {...mainSettings}>
                {images.map((src, idx) => (
                  <div key={idx} className="px-0.5 sm:px-1">
                    <div
                      className="relative w-full h-[260px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-xl overflow-hidden group cursor-zoom-in touch-pan-y"
                      onClick={() => openLightbox(idx)}
                      title="عرض الصورة"
                    >
                      {!imgLoaded[idx] && (
                        <Shimmer className="absolute inset-0" />
                      )}
                      <img
                        src={src}
                        alt={`${product.name} ${idx + 1}`}
                        className={`w-full h-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                          imgLoaded[idx] ? "opacity-100" : "opacity-0"
                        }`}
                        loading="lazy"
                        sizes="(min-width:1024px) 600px, 90vw"
                        onLoad={() => onImgLoad(idx)}
                        onError={() => onImgError(idx)}
                      />
                    </div>
                  </div>
                ))}
              </Slider>

              {/* مصغّرات */}
              <div className="mt-3">
                <Slider ref={sliderThumbRef} {...thumbsSettings}>
                  {images.map((src, i) => (
                    <button
                      key={`t-${i}`}
                      className={`mr-2 rounded-lg overflow-hidden border transition ${
                        activeIndex === i
                          ? "border-amber-400 ring-2 ring-amber-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        sliderMainRef.current?.slickGoTo(i);
                        setActiveIndex(i);
                      }}
                      aria-label={`صورة ${i + 1}`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-14 w-16 sm:h-16 sm:w-20 object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </Slider>
              </div>
            </div>
          </div>

          {/* المعلومات الأساسية */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-lg sm:text-2xl font-bold text-primary">
                {product.name}
              </h1>
              <button
                onClick={toggleWishlist}
                className={`h-9 w-9 grid place-items-center rounded-full border transition ${
                  wish
                    ? "bg-amber-100 border-amber-200 text-amber-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                title={wish ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 ${
                    wish ? "text-amber-600" : "text-gray-700"
                  }`}
                  fill={wish ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61c-1.54-1.36-3.84-1.27-5.28.2L12 8.09 8.44 4.81c-1.44-1.47-3.74-1.56-5.28-.2-1.86 1.64-1.97 4.55-.23 6.33L12 21l9.07-10.06c1.74-1.78 1.63-4.69-.23-6.33z" />
                </svg>
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 sm:gap-3">
              <Stars value={averageRating} />
              <button
                className="text-xs sm:text-sm text-gray-600 underline underline-offset-4"
                onClick={() => {
                  setTab("reviews");
                  setTimeout(() => {
                    document
                      .getElementById("reviews-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
              >
                ({allReviews.length} مراجعة)
              </button>
            </div>

            <p className="mt-3 text-gray-700 text-sm sm:text-base">
              {product.descriptionShort}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {product.descriptionLong}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {Number(product.price).toFixed(2)} ليرة سورية
              </div>
              <div className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                متوفر
              </div>
            </div>

            {/* كمية + مشاركة */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
                <button
                  className="px-3 py-2 hover:bg-gray-50"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="إنقاص"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-12 sm:w-14 text-center border-x border-gray-300 py-2 outline-none"
                />
                <button
                  className="px-3 py-2 hover:bg-gray-50"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="زيادة"
                >
                  +
                </button>
              </div>
              <div className="flex-1" />
              <button
                onClick={share}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
              >
                مشاركة
              </button>
            </div>

            {/* أزرار الشراء */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full sm:flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90"
                onClick={addToCartWithQty}
              >
                إضافة للسلة
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full sm:flex-1 border border-primary text-primary py-2.5 rounded-lg hover:bg-primary hover:text-white"
                onClick={() => {
                  addToCartWithQty();
                  navigate("/cart");
                }}
              >
                اشترِ الآن
              </motion.button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(product.tastingNotes || []).map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] sm:text-xs border border-amber-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* تبويبات */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="border-b border-gray-100 flex overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "نبذة" },
              { id: "details", label: "التفاصيل" },
              { id: "reviews", label: "المراجعات" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 sm:px-4 py-3 text-sm font-medium shrink-0 transition ${
                  tab === t.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5">
            <AnimatePresence mode="popLayout">
              {tab === "overview" && (
                <motion.div
                  key="ov"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <p className="text-gray-700 text-sm sm:text-base">
                    {product.descriptionLong}
                  </p>
                </motion.div>
              )}

              {tab === "details" && (
                <motion.div
                  key="dt"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
                >
                  {Object.entries(product.specs || {}).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-lg border border-gray-100 p-3"
                    >
                      <div className="text-[11px] sm:text-xs text-gray-500">
                        {k}
                      </div>
                      <div className="text-sm sm:text-base font-medium text-gray-900">
                        {v}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {tab === "reviews" && (
                <motion.div
                  key="rv"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid lg:grid-cols-3 gap-6"
                  id="reviews-section"
                >
                  {/* ملخص */}
                  <div className="lg:col-span-1 rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl sm:text-4xl font-bold text-primary">
                        {averageRating.toFixed(1)}
                      </div>
                      <div>
                        <Stars value={averageRating} />
                        <div className="text-[11px] sm:text-xs text-gray-500">
                          بناءً على {allReviews.length} مراجعة
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((n) => {
                        const { pct, count } = breakdown[n - 1];
                        return (
                          <div
                            key={n}
                            className="flex items-center gap-2 text-[11px] sm:text-xs"
                          >
                            <span className="w-8">{n}★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded">
                              <div
                                className="h-2 bg-amber-400 rounded"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-gray-500">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* قائمة + نموذج */}
                  <div className="lg:col-span-2 grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {allReviews.length === 0 && (
                        <p className="text-gray-500 text-sm">
                          لا توجد مراجعات بعد.
                        </p>
                      )}
                      {allReviews.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-lg border border-gray-100 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              {r.user}
                            </div>
                            <Stars value={r.rating} size={14} />
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            {r.comment}
                          </p>
                          <div className="mt-1 text-[11px] text-gray-500">
                            {r.date}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={submitReview}
                      className="rounded-lg border border-gray-100 p-4"
                    >
                      <h3 className="font-semibold mb-3">أضف مراجعتك</h3>
                      {!user && (
                        <p className="text-sm text-gray-600 mb-2">
                          يجب{" "}
                          <a href="/login" className="underline">
                            تسجيل الدخول
                          </a>{" "}
                          لإضافة مراجعة.
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-3">
                        <label className="text-sm">
                          التقييم:
                          <select
                            value={form.rating}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                rating: Number(e.target.value),
                              }))
                            }
                            className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                            disabled={!user || submitting}
                          >
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm">
                          تعليقك:
                          <textarea
                            value={form.comment}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                comment: e.target.value,
                              }))
                            }
                            className="mt-1 w-full min-h-[100px] rounded border border-gray-300 px-2 py-1"
                            placeholder="اكتب رأيك (10 أحرف على الأقل)…"
                            disabled={!user || submitting}
                            minLength={10}
                            required
                          />
                        </label>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={!user || submitting}
                          className="rounded-lg bg-black px-4 py-2.5 text-white font-medium disabled:opacity-60"
                        >
                          {submitting ? "جاري الإرسال…" : "إرسال المراجعة"}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* لايت بوكس */}
        <AnimatePresence>
          {lightbox.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
              onClick={() => setLightbox({ open: false, idx: 0, zoom: false })}
            >
              <div
                className="absolute inset-0 flex items-center justify-center p-3 sm:p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative max-w-5xl w-full">
                  <img
                    src={images[lightbox.idx]}
                    alt=""
                    className={`w-full max-h-[80vh] object-contain mx-auto transition ${
                      lightbox.zoom
                        ? "scale-[1.3] cursor-zoom-out"
                        : "cursor-zoom-in"
                    }`}
                    onClick={() =>
                      setLightbox((s) => ({ ...s, zoom: !s.zoom }))
                    }
                  />
                  <button
                    className="absolute -top-3 -left-3 h-9 w-9 grid place-items-center rounded-full bg-white text-gray-800 shadow ring-1 ring-black/5"
                    onClick={() =>
                      setLightbox({ open: false, idx: 0, zoom: false })
                    }
                    aria-label="إغلاق"
                  >
                    ✕
                  </button>
                  <button
                    className="hidden sm:grid absolute top-1/2 -translate-y-1/2 right-2 h-9 w-9 place-items-center rounded-full bg-white text-gray-800 shadow ring-1 ring-black/5"
                    onClick={() =>
                      setLightbox((s) => ({
                        ...s,
                        idx: (s.idx - 1 + images.length) % images.length,
                      }))
                    }
                    aria-label="السابق"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M15 5l-7 7 7 7" />
                    </svg>
                  </button>
                  <button
                    className="hidden sm:grid absolute top-1/2 -translate-y-1/2 left-2 h-9 w-9 place-items-center rounded-full bg-white text-gray-800 shadow ring-1 ring-black/5"
                    onClick={() =>
                      setLightbox((s) => ({
                        ...s,
                        idx: (s.idx + 1) % images.length,
                      }))
                    }
                    aria-label="التالي"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}
