// src/components/Hero.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import {
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  FireIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import cup from "../../public/cup.png";
import img1 from "../../public/1.png";
import img2 from "../../public/2.jpeg";
import img3 from "../../public/3.jpg";
import img4 from "../../public/4.jpeg";
import img5 from "../../public/5.webp";

export default function Hero() {
  const navigate = useNavigate();

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2600,
    pauseOnHover: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    rtl: true,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  const featuredProducts = [
    {
      id: 1,
      name: "قهوة بدون هال",
      price: 89.99,
      image: img1,
      category: "coffee",
      description: "قهوة خفيفة التحميص بنكهات زهرية وحمضية",
      featured: true,
    },
    {
      id: 3,
      name: "قهوة كولومبية",
      price: 94.99,
      image: img2,
      category: "coffee",
      description: "قهوة متوسطة التحميص بنكهة الشوكولاتة",
      featured: true,
    },
    {
      id: 5,
      name: "قهوة كينية",
      price: 99.99,
      image: img3,
      category: "coffee",
      description: "قهوة غنية بالنكهة مع لمسة من التوت",
      featured: true,
    },
  ];

  const quickCats = [
    { key: "turkish", label: "قهوة تركية" },
    { key: "brazil", label: "قهوة برازيلية" },
    { key: "indian", label: "قهوة هندية" },
    { key: "saudi", label: "قهوة سعودية" },
    { key: "espresso", label: "إسبريسو" },
    { key: "cold", label: "قهوة باردة" },
  ];

  return (
    <section
      className="relative overflow-hidden"
      dir="rtl"
      style={{
        background:
          "radial-gradient(70% 100% at 50% 0%, rgba(255,225,138,0.28) 0%, rgba(255,240,200,0.16) 40%, transparent 100%)",
      }}
    >
      {/* زخارف خفيفة */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 sm:pb-16 lg:pb-20">
        {/* رأس الصفحة */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* النصوص + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/40 px-3 py-1 text-amber-800 text-xs sm:text-sm mb-4">
              <SparklesIcon className="h-4 w-4" />
              تحميص طازج + توصيل سريع
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-primary">
              قهوة <span className="text-primary">دوباميكافين</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-white leading-relaxed">
              حيث <span className="text-primary font-semibold">القهوة</span> و{" "}
              <span className="text-primary font-semibold">الموسيقى</span> و{" "}
              <span className="text-primary font-semibold">الكتاب</span>. نختار
              أجود الحبوب، نُحمّص بعناية، ونوصل لك فنجانًا يليق بذائقتك.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/shop")}
                className="inline-flex items-center justify-center rounded-xl bg-primary text-white px-5 py-3 text-sm sm:text-base hover:bg-primary/90 shadow"
              >
                تسوّق الآن
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              </button>
              <Link
                to="/product/qahwa-colombia"
                className="inline-flex items-center justify-center rounded-xl border border-primary text-primary px-5 py-3 text-sm sm:text-base hover:bg-primary hover:text-white transition"
              >
                جرّب المميّز
              </Link>
            </div>

            {/* شريط مزايا */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-white/70 backdrop-blur border border-gray-100 px-3 py-2">
                <TruckIcon className="h-5 w-5 text-amber-600" />
                <span>توصيل خلال 24–72 ساعة</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 backdrop-blur border border-gray-100 px-3 py-2">
                <ShieldCheckIcon className="h-5 w-5 text-amber-600" />
                <span>دفع آمن وتجريبي</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 backdrop-blur border border-gray-100 px-3 py-2 col-span-2 sm:col-span-1">
                <FireIcon className="h-5 w-5 text-amber-600" />
                <span>تحميص طازج أسبوعيًا</span>
              </div>
            </div>
          </motion.div>

          {/* صورة الكوب */}
          <motion.div
            className="relative grid place-items-center"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative">
              <img
                src={cup}
                alt="فنجان قهوة"
                className="max-h-[360px] sm:max-h-[420px] w-auto drop-shadow-xl"
                loading="lazy"
                sizes="(min-width:1024px) 520px, 80vw"
              />
              {/* هالة خفيفة خلف الصورة */}
              <div className="absolute -z-10 inset-0 translate-y-6 blur-2xl rounded-full bg-amber-200/30" />
            </div>
          </motion.div>
        </div>

        {/* تصنيفات سريعة (سطر قابل للتمرير على الموبايل) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-primary">
              استكشف حسب المزاج
            </h3>
            <Link
              to="/shop"
              className="text-sm text-gray-600 hover:text-primary underline underline-offset-4"
            >
              كل المنتجات
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {quickCats.map((c) => (
              <button
                key={c.key}
                onClick={() => navigate("/shop")}
                className="shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm hover:bg-amber-50"
                title={`عرض ${c.label}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* سلايدر المميّز */}
        <div className="mt-10">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">
            القهوة المميزة
          </h2>
          <div className="relative rounded-2xl border border-gray-100 bg-white p-2 sm:p-3 shadow-sm">
            <Slider {...sliderSettings}>
              {featuredProducts.map((product) => (
                <div key={product.id} className="px-1.5">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer group border border-gray-100"
                    onClick={() =>
                      navigate(
                        `/product/${
                          product.name === "قهوة كولومبية"
                            ? "qahwa-colombia"
                            : product.name === "قهوة كينية"
                            ? "qahwa-kenya"
                            : "qahwa-bidon-hal"
                        }`
                      )
                    }
                  >
                    <div className="relative h-48 sm:h-56">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition" />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                          مميز
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="text-primary font-bold">
                          {product.price} ليرة سورية
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-3">
                        <button className="text-sm text-primary hover:underline">
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { n: "50+", t: "صنف قهوة" },
            { n: "10+", t: "بلدان منشأ" },
            { n: "4.7★", t: "متوسط التقييم" },
            { n: "24–72س", t: "زمن التوصيل" },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-xl bg-white border border-gray-100 p-4 text-center shadow-sm"
            >
              <div className="text-2xl font-extrabold text-primary">{s.n}</div>
              <div className="text-sm text-gray-600 mt-1">{s.t}</div>
            </div>
          ))}
        </div>

        {/* خطوات التحضير البسيطة */}
        <div className="mt-10">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-4">
            خطوات تحضير فنجان مثالي
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                t: "اطحن طازجًا",
                d: "استخدم طحنًا مناسبًا لطريقة التحضير.",
              },
              {
                t: "وازن الجرعات",
                d: "جرّب 15–18غ للترشيح و 18–20غ للإسبريسو.",
              },
              { t: "تحكم بالوقت", d: "الترشيح 2:30–3:30 والإسبريسو ~30ث." },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm"
              >
                <div className="text-amber-600 font-bold">{`0${i + 1}`}</div>
                <div className="font-semibold mt-1">{s.t}</div>
                <div className="text-sm text-gray-600 mt-1">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
