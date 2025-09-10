// src/pages/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

// =========================
// Wrapper: يتحقق من تسجيل الدخول فقط
// =========================
export default function Cart() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
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
        <Footer />
      </>
    );
  }

  return <CartInner />;
}

// =========================
// Inner: كل الـHooks هنا (ترتيب ثابت دائماً)
// =========================
function CartInner() {
  const [cartItems, setCartItems] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // null | 'd.fadi' | 'd.bader'
  const [paymentMethod, setPaymentMethod] = useState(""); // sham | syriatel | mtn | bemo
  const [syriatelPhone, setSyriatelPhone] = useState("");
  const [bemoAccount, setBemoAccount] = useState("");
  const [showCouponBanner, setShowCouponBanner] = useState(false);
  const navigate = useNavigate();

  // حسابات/أرقام مستلمين وهمية
  const SYRIATEL_RECEIVER = "0998765432";
  const MTN_RECEIVER = "0933123456";
  const BEMO_RECEIVER = "0011-234567-890";

  // معرّف مؤقت للـ QR
  const tempOrderId = useMemo(() => "TMP-" + Date.now(), []);

  // تحميل/حفظ السلة
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);
  useEffect(() => {
    if (cartItems.length > 0)
      localStorage.setItem("cart", JSON.stringify(cartItems));
    else localStorage.removeItem("cart");
  }, [cartItems]);

  const updateQuantity = (id, change) => {
    // (اختياري) مزامنة خارجية
    window.dispatchEvent(new Event("wishlist:updated"));
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) }
          : item
      )
    );
  };
  const removeItem = (id) =>
    setCartItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = useMemo(
    () => cartItems.reduce((t, it) => t + it.price * (it.quantity || 1), 0),
    [cartItems]
  );

  // الكوبونات
  const discountRate =
    appliedCoupon === "d.bader" ? 1 : appliedCoupon === "d.fadi" ? 0.5 : 0;
  const discountAmount = subtotal * discountRate;
  const total = Math.max(0, subtotal - discountAmount);

  const applyCoupon = () => {
    const code = couponInput.trim().toLowerCase();
    if (code === "d.fadi") setAppliedCoupon("d.fadi");
    else if (code === "d.bader") setAppliedCoupon("d.bader");
    else setAppliedCoupon(null);
  };
  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  // التحققات
  const digits = (s) => String(s || "").replace(/\D+/g, "");
  const validSyriatel =
    paymentMethod !== "syriatel" ||
    (digits(syriatelPhone).length >= 9 && digits(syriatelPhone).length <= 10);
  const validBemo =
    paymentMethod !== "bemo" || digits(bemoAccount).length >= 10;

  const paymentRequired = total > 0 && appliedCoupon !== "d.bader";
  const canConfirm =
    cartItems.length > 0 &&
    (!paymentRequired || (paymentMethod && validSyriatel && validBemo));

  // إظهار بانر الكوبون 3 ثواني لما يصير الدفع غير مطلوب
  useEffect(() => {
    if (!paymentRequired) setShowCouponBanner(true);
  }, [paymentRequired]);
  useEffect(() => {
    if (!showCouponBanner) return;
    const t = setTimeout(() => setShowCouponBanner(false), 3000);
    return () => clearTimeout(t);
  }, [showCouponBanner]);

  // QR شام كاش
  const shamPayload = useMemo(() => {
    const amount = total.toFixed(2);
    return `PAY:SHAMCASH;order=${tempOrderId};amount=${amount};curr=SYP`;
  }, [total, tempOrderId]);

  const onConfirmOrder = () => {
    if (!canConfirm) return;

    const orderId = "ORD-" + Date.now();
    const order = {
      id: orderId,
      items: cartItems,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      coupon: appliedCoupon,
      paymentRequired,
      payment: paymentRequired
        ? {
            method: paymentMethod,
            syriatel:
              paymentMethod === "syriatel"
                ? { payTo: SYRIATEL_RECEIVER, from: digits(syriatelPhone) }
                : undefined,
            mtn: paymentMethod === "mtn" ? { payTo: MTN_RECEIVER } : undefined,
            bemo:
              paymentMethod === "bemo"
                ? { payTo: BEMO_RECEIVER, from: digits(bemoAccount) }
                : undefined,
            sham:
              paymentMethod === "sham" ? { payload: shamPayload } : undefined,
          }
        : { method: "FREE", note: "كوبون d.bader يغطي كامل المبلغ" },
      status: paymentRequired ? "بانتظار الدفع/المراجعة" : "مؤكد",
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("orders") || "[]");
    existing.unshift(order);
    localStorage.setItem("orders", JSON.stringify(existing));

    // تفريغ السلة ثم الانتقال
    localStorage.removeItem("cart");
    setCartItems([]);
    navigate("/orders");
  };

  return (
    <>
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
        <h1 className="text-2xl font-bold text-primary mb-8">سلة المشتريات</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* عناصر السلة */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="mr-4 flex-1">
                    <h3 className="text-lg font-semibold text-primary">
                      {item.name}
                    </h3>
                    <p className="text-gray-600">{item.price} ليرة سورية</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-1">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary ml-4">
                    {(item.price * (item.quantity || 1)).toFixed(2)} ليرة سورية
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded mr-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {cartItems.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">سلة المشتريات فارغة</p>
              </div>
            )}
          </div>

          {/* الملخص والدفع */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-semibold text-primary mb-4">
              ملخص الطلب
            </h2>

            {/* كوبون */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="أدخل كود الخصم"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 rounded bg-black text-white"
                >
                  تطبيق
                </button>
                {appliedCoupon && (
                  <button
                    onClick={clearCoupon}
                    className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    إزالة
                  </button>
                )}
              </div>
            </div>

            {/* الأرقام */}
            <div className="border-t pt-4 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ليرة سورية</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>الخصم</span>
                  <span>-{discountAmount.toFixed(2)} ليرة سورية</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>المجموع الكلي</span>
                <span>{total.toFixed(2)} ليرة سورية</span>
              </div>
            </div>

            {/* طرق الدفع */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">طريقة الدفع</h3>

              {/* بانر الكوبون (Free) */}
              {!paymentRequired ? (
                <AnimatePresence>
                  {showCouponBanner && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800 text-sm"
                    >
                      بسبب تطبيق كوبون <b>d.bader</b>، لا حاجة للدفع. يمكنك
                      تأكيد الطلب مباشرةً.
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        value="sham"
                        checked={paymentMethod === "sham"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      شام كاش (Sham Cash)
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        value="syriatel"
                        checked={paymentMethod === "syriatel"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      سيرياتيل كاش
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        value="mtn"
                        checked={paymentMethod === "mtn"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      MTN كاش
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        value="bemo"
                        checked={paymentMethod === "bemo"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      بنك بيمو
                    </label>
                  </div>

                  {/* تعليمات/حقول خاصة بكل طريقة */}
                  <div className="mt-4 space-y-3">
                    {paymentMethod === "sham" && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-sm text-amber-900 mb-2">
                          امسح رمز QR للدفع عبر شام كاش.
                        </p>
                        <div className="grid place-items-center">
                          <img
                            className="h-44 w-44 rounded-lg border"
                            alt="Sham Cash QR"
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                              shamPayload
                            )}`}
                          />
                        </div>
                        <p className="text-xs text-amber-900 mt-2">
                          قيمة الطلب: {total.toFixed(2)} ر.س (تجريبي)
                        </p>
                      </div>
                    )}

                    {paymentMethod === "syriatel" && (
                      <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            ادفع إلى رقم سيرياتيل:
                          </span>
                          <span className="font-semibold text-primary">
                            {SYRIATEL_RECEIVER}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              navigator.clipboard?.writeText(SYRIATEL_RECEIVER)
                            }
                            className="p-1 rounded hover:bg-gray-100"
                            title="نسخ الرقم"
                          >
                            <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            رقم هاتفك لإتمام العملية
                          </label>
                          <input
                            type="tel"
                            placeholder="مثال: 09XXXXXXXX"
                            value={syriatelPhone}
                            onChange={(e) => setSyriatelPhone(e.target.value)}
                            className={`w-full px-3 py-2 rounded border ${
                              validSyriatel
                                ? "border-gray-300"
                                : "border-red-300"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                          {!validSyriatel && (
                            <p className="text-xs text-red-600">
                              أدخل رقماً صالحاً (9–10 أرقام).
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {paymentMethod === "mtn" && (
                      <div className="rounded-lg border border-gray-200 p-3">
                        <p className="text-sm text-gray-700">
                          ادفع عبر MTN كاش إلى الرقم:
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-semibold text-lg text-primary">
                            {MTN_RECEIVER}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              navigator.clipboard?.writeText(MTN_RECEIVER)
                            }
                            className="p-1 rounded hover:bg-gray-100"
                            title="نسخ الرقم"
                          >
                            <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          يرجى ذكر رقم الطلب في الملاحظات إن أمكن.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "bemo" && (
                      <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            حوِّل إلى حساب بيمو:
                          </span>
                          <span className="font-semibold text-primary">
                            {BEMO_RECEIVER}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              navigator.clipboard?.writeText(BEMO_RECEIVER)
                            }
                            className="p-1 rounded hover:bg-gray-100"
                            title="نسخ الحساب"
                          >
                            <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            رقم حسابك (للمطابقة)
                          </label>
                          <input
                            type="text"
                            placeholder="أدخل رقم حسابك (10 أرقام فأكثر)"
                            value={bemoAccount}
                            onChange={(e) => setBemoAccount(e.target.value)}
                            className={`w-full px-3 py-2 rounded border ${
                              validBemo ? "border-gray-300" : "border-red-300"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                          {!validBemo && (
                            <p className="text-xs text-red-600">
                              رقم الحساب يجب أن يكون أرقامًا وبطول 10+.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onConfirmOrder}
              disabled={!canConfirm}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-60"
            >
              تأكيد الطلب
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
