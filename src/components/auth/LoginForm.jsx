import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../../public/logo.jpg";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").toLowerCase());

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [admin, setAdmin] = useState(true); // ✅ سويتش الأدمن
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [err, setErr] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const fieldErrors = useMemo(() => {
    const e = {};
    if (touched.email && !isValidEmail(form.email))
      e.email = "البريد الإلكتروني غير صالح";
    if (touched.password && !form.password) e.password = "أدخل كلمة المرور";
    return e;
  }, [form, touched]);

  const disabled = pageLoading || loading || redirecting;
  const canSubmit = isValidEmail(form.email) && !!form.password && !disabled;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    try {
      // ✅ لو مُفعّل، ندخل كأدمن (يعتمد أن AuthContext يخزّن role/isAdmin)
      await login({ ...form, isAdmin: admin, role: admin ? "admin" : "user" });
      setLoading(false);
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = "/shop";
      }, 3000);
    } catch (e) {
      setErr(e?.message || "خطأ غير متوقع");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-8 pt-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full overflow-hidden ring-1 ring-gray-200">
              <img
                src={logo}
                alt="شعار المتجر"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
              تسجيل الدخول
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {pageLoading
                ? "جاري تحميل الصفحة…"
                : "مرحبًا بعودتك! أدخل بياناتك للوصول إلى حسابك."}
            </p>
          </div>

          <form onSubmit={submit} className="px-8 pt-6 pb-8 space-y-4">
            {err && !pageLoading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            {redirecting && (
              <div className="flex flex-col items-center justify-center py-4 text-gray-700">
                <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full mb-2"></div>
                <p>جارٍ التحويل للمتجر…</p>
              </div>
            )}

            {pageLoading && !redirecting && (
              <div className="space-y-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
            )}

            {!pageLoading && !redirecting && (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    البريد الإلكتروني
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 ${
                      fieldErrors.email
                        ? "border-red-300"
                        : "border-gray-200 focus:border-gray-300"
                    }`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    required
                    autoComplete="email"
                    disabled={disabled}
                  />
                  {fieldErrors.email && (
                    <p className="text-[12px] text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={pwVisible ? "text" : "password"}
                      className={`w-full rounded-lg border bg-white px-3 py-2 pr-24 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 ${
                        fieldErrors.password
                          ? "border-red-300"
                          : "border-gray-200 focus:border-gray-300"
                      }`}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      onBlur={() =>
                        setTouched((t) => ({ ...t, password: true }))
                      }
                      required
                      autoComplete="current-password"
                      disabled={disabled}
                    />
                    <button
                      type="button"
                      onClick={() => setPwVisible((v) => !v)}
                      className="absolute inset-y-0 left-2 my-1 px-3 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                      disabled={disabled}
                    >
                      {pwVisible ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[12px] text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* ✅ مربع تفعيل وضع الأدمن */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-amber-900">
                      تسجيل الدخول كأدمن
                    </div>
                    <p className="text-xs text-amber-800">
                      خيار للمطورين/الإدارة لعرض لوحة التحكم.
                    </p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={admin}
                      onChange={(e) => setAdmin(e.target.checked)}
                      disabled={disabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-400 relative transition">
                      <span className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition peer-checked:translate-x-5"></span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-lg bg-black px-4 py-2.5 text-white font-medium transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "جارٍ الدخول…" : "دخول"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
