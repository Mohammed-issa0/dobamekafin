// DashboardEnhanced_API.jsx
// =======
// يضيف حفظ/جلب المنتجات من مصدر JSON خارجي (JSON Server أو API Laravel)
// - يرسل POST/PUT/DELETE للمنتجات كي تُحفظ فورًا في ملف db.json (مع JSON Server)
// - إن تعذّر الاتصال، يستخدم localStorage كنسخة احتياطية ويُظهر Toast.
//
// الإعداد المقترح (تطوير محلي):
// 1) أنشئ ملف db.json بجذر المشروع بمحتوى أولي مثل:
// {
//   "products": [],
//   "orders": [],
//   "users": []
// }
// 2) شغّل JSON Server:
//    npx json-server --watch db.json --port 3001
// 3) أضف متغير البيئة في Vite (لو مستخدمه):
//    // .env.local
//    VITE_API_BASE=http://localhost:3001
// 4) تأكد أن صفحة المتجر (Shop) تجلب من نفس الـ API (مثال في آخر الملف).

import { useEffect, useMemo, useState } from "react";
import {
  loadProducts,
  saveProducts,
  upsertProduct,
  deleteProduct,
  genId,
} from "../store/productStore"; // للنسخ الاحتياطي فقط
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/admin";
import { Link, Navigate } from "react-router-dom";

// Recharts
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ============ إعدادات API ============
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3001";
const PRODUCTS_URL = `${API_BASE}/products`;

async function fetchJSON(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function apiGetProducts() {
  return fetchJSON(PRODUCTS_URL);
}
async function apiCreateProduct(p) {
  return fetchJSON(PRODUCTS_URL, { method: "POST", body: JSON.stringify(p) });
}
async function apiUpdateProduct(id, p) {
  return fetchJSON(`${PRODUCTS_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(p),
  });
}
async function apiDeleteProduct(id) {
  const res = await fetch(`${PRODUCTS_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return true;
}

// ============ UI صغييير ============
function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black text-white px-4 py-2 shadow-lg">
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="text-xs underline">
          إغلاق
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}

function Drawer({ open, title, onClose, children }) {
  return (
    <div className={`${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="text-lg font-semibold">{title}</div>
          <button className="text-sm underline" onClick={onClose}>
            إغلاق
          </button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-56px)]">{children}</div>
      </div>
    </div>
  );
}

const PIE_COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin(user)) return <Navigate to="/" replace />;

  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const root = document.documentElement.classList;
    if (dark) {
      root.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // المنتجات — تُجلب من API مع fallback إلى localStorage
  const [rows, setRows] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const api = await apiGetProducts();
        // تأكيد وجود الحقول الأساسية
        const normalized = api.map((p) => ({
          stockQty: Number(p.stockQty ?? 20),
          images: Array.isArray(p.images) ? p.images : [p.image || "/1.png"],
          ...p,
        }));
        setRows(normalized);
      } catch (e) {
        console.warn("API products failed, fallback to localStorage", e);
        const local = loadProducts();
        setRows(
          local.map((p) => ({ stockQty: Number(p.stockQty ?? 20), ...p }))
        );
        setToast("تعذر الاتصال بالـ API — تم استخدام بيانات محلية");
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // المستخدمون
  const [users, setUsers] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("users");
      const arr = raw ? JSON.parse(raw) : null;
      if (Array.isArray(arr)) {
        setUsers(arr);
        return;
      }
    } catch {}
    fetch("/users.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((arr) => {
        if (Array.isArray(arr)) setUsers(arr);
      })
      .catch(() => {});
  }, []);

  // الطلبات
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(Array.isArray(arr) ? arr : []);
    } catch {}
  }, []);

  // مراجعات
  const totalReviews = useMemo(() => {
    let count = 0;
    rows.forEach((p) => {
      count += Array.isArray(p.reviews) ? p.reviews.length : 0;
      try {
        const local = JSON.parse(
          localStorage.getItem(`reviews:${p.id}`) || "[]"
        );
        if (Array.isArray(local)) count += local.length;
      } catch {}
    });
    return count;
  }, [rows]);

  // KPIs
  const totalRevenue = useMemo(
    () => orders.reduce((s, o) => s + Number(o.total || 0), 0),
    [orders]
  );
  const avgOrderValue = useMemo(
    () => (orders.length ? totalRevenue / orders.length : 0),
    [totalRevenue, orders.length]
  );
  const revenueByMonthMap = useMemo(() => {
    const m = new Map();
    orders.forEach((o) => {
      const d = new Date(o.createdAt || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      m.set(key, (m.get(key) || 0) + Number(o.total || 0));
    });
    return m;
  }, [orders]);
  const monthlyGrowthPct = useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const kNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const kPrev = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const rNow = revenueByMonthMap.get(kNow) || 0;
    const rPrev = revenueByMonthMap.get(kPrev) || 0;
    if (!rPrev && !rNow) return 0;
    if (!rPrev) return 100;
    return ((rNow - rPrev) / rPrev) * 100;
  }, [revenueByMonthMap]);

  const salesTrend = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const label = d.toLocaleDateString(undefined, { month: "short" });
      out.push({ label, value: revenueByMonthMap.get(key) || 0 });
    }
    return out;
  }, [revenueByMonthMap]);

  const categorySales = useMemo(() => {
    const acc = new Map();
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const cat = it.category || "other";
        acc.set(
          cat,
          (acc.get(cat) || 0) + Number(it.total || it.price * it.qty || 0)
        );
      });
    });
    return Array.from(acc.entries()).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // حفظ نسخة محلية دومًا ككاش
  useEffect(() => {
    if (!loadingProducts) saveProducts(rows);
  }, [rows, loadingProducts]);

  // فلترة + بحث + ترتيب
  const visibleRows = useMemo(() => {
    let arr = rows.filter((r) => filter === "all" || r.category === filter);
    const q = search.trim().toLowerCase();
    if (q)
      arr = arr.filter(
        (r) => r.name?.toLowerCase().includes(q) || String(r.id).includes(q)
      );
    arr.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (A === B) return 0;
      const res = A > B ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    });
    return arr;
  }, [rows, filter, search, sortKey, sortDir]);

  // CRUD عبر API مع fallback
  const beginEdit = (row) => {
    setEditingId(row.id);
    setDraft({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category,
      image: row.images?.[0] || row.image || "/1.png",
      featured: !!row.featured,
      stockQty: Number(row.stockQty ?? 0),
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const commitEdit = async () => {
    const id = draft.id;
    const updated = {
      ...rows.find((r) => r.id === id),
      name: draft.name?.trim() || "منتج بدون اسم",
      price: Number(draft.price) || 0,
      category: draft.category || "espresso",
      images: [draft.image || "/1.png"],
      featured: !!draft.featured,
      stockQty: Number(draft.stockQty || 0),
    };
    try {
      const saved = await apiUpdateProduct(id, updated);
      setRows((prev) => prev.map((r) => (r.id === id ? saved : r)));
      setToast("تم حفظ التعديلات على الخادم");
    } catch (e) {
      // fallback محلي
      setRows((prev) => upsertProduct(prev, updated));
      setToast("تعذر الوصول للخادم — حُفظ محليًا");
    } finally {
      cancelEdit();
    }
  };

  const removeRow = async (id) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    try {
      await apiDeleteProduct(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setToast("تم حذف المنتج من الخادم");
    } catch (e) {
      setRows((prev) => deleteProduct(prev, id));
      setToast("تعذر الوصول للخادم — حُذف محليًا");
    }
  };

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    price: "",
    category: "espresso",
    image: "/1.png",
    featured: false,
    stockQty: 20,
  });

  const addNew = async () => {
    // اترك توليد id لـ JSON Server (سيُرجع id تلقائي)
    const payload = {
      slug: (addForm.name || "product-")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-ء-ي]+/gi, ""),
      name: addForm.name?.trim() || "منتج جديد",
      price: Number(addForm.price) || 0,
      images: [addForm.image || "/1.png"],
      category: addForm.category || "espresso",
      descriptionShort: "وصف قصير…",
      descriptionLong: "وصف تفصيلي…",
      specs: { origin: "—", process: "—", roast: "—", weight: "250g" },
      tastingNotes: [],
      rating: 0,
      featured: !!addForm.featured,
      reviews: [],
      stockQty: Number(addForm.stockQty || 0),
    };
    try {
      const created = await apiCreateProduct(payload);
      setRows((prev) => [...prev, created]);
      setToast("تمت إضافة المنتج إلى ملف JSON");
    } catch (e) {
      // fallback محلي مع genId
      const id = genId(rows);
      const local = { id, ...payload };
      setRows((prev) => [...prev, local]);
      setToast("تعذر الوصول للخادم — أُضيف محليًا");
    } finally {
      setAddOpen(false);
      setAddForm({
        name: "",
        price: "",
        category: "espresso",
        image: "/1.png",
        featured: false,
        stockQty: 20,
      });
    }
  };

  // تنبيه انخفاض المخزون
  const lowStock = useMemo(
    () => rows.filter((r) => Number(r.stockQty) <= 5),
    [rows]
  );

  if (loadingProducts) {
    return (
      <div className="pt-32 text-center text-gray-500" dir="rtl">
        جاري تحميل المنتجات…
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={() => setDark((v) => !v)}
          >
            {dark ? "وضع فاتح" : "وضع داكن"}
          </button>
          <Link to="/shop" className="underline">
            العودة للمتجر
          </Link>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        <StatCard title="المنتجات" value={rows.length} />
        <StatCard title="المستخدمون" value={users.length} />
        <StatCard title="الطلبات" value={orders.length} />
        <StatCard
          title="إجمالي المبيعات"
          value={`${totalRevenue.toFixed(2)} ل.س`}
        />
        <StatCard
          title="متوسط الطلب"
          value={`${avgOrderValue.toFixed(2)} ل.س`}
        />
        <StatCard
          title="النمو الشهري"
          value={`${monthlyGrowthPct.toFixed(1)}%`}
          subtitle="مقارنة بالشهر السابق"
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">إيرادات آخر 6 أشهر</div>
            <div className="text-xs text-gray-500">
              المجموع: {totalRevenue.toFixed(0)} ل.س
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesTrend}
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="الإيراد"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="text-sm font-medium mb-3">
            توزيع المبيعات حسب التصنيف
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={categorySales}
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {categorySales.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* إدارة المنتجات */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="text-lg font-semibold">المنتجات</div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              placeholder="بحث بالاسم أو الرقم"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              title="فلترة"
            >
              <option value="all">الكل</option>
              <option value="turkish">turkish</option>
              <option value="brazil">brazil</option>
              <option value="indian">indian</option>
              <option value="saudi">saudi</option>
              <option value="espresso">espresso</option>
              <option value="cold">cold</option>
            </select>
            <select
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              title="ترتيب حسب"
            >
              <option value="id">الرقم</option>
              <option value="name">الاسم</option>
              <option value="price">السعر</option>
              <option value="stockQty">المخزون</option>
              <option value="category">التصنيف</option>
            </select>
            <button
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            >
              {sortDir === "asc" ? "تصاعدي" : "تنازلي"}
            </button>
            <button
              onClick={() => setAddOpen((v) => !v)}
              className="rounded-lg bg-black text-white px-4 py-2"
            >
              {addOpen ? "إغلاق" : "إضافة منتج"}
            </button>
          </div>
        </div>

        {/* نموذج إضافة */}
        {addOpen && (
          <div className="grid md:grid-cols-6 gap-3 p-3 mb-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <input
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              placeholder="اسم المنتج"
              value={addForm.name}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              type="number"
              min="0"
              step="0.01"
              placeholder="السعر"
              value={addForm.price}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, price: e.target.value }))
              }
            />
            <select
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              value={addForm.category}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="turkish">turkish</option>
              <option value="brazil">brazil</option>
              <option value="indian">indian</option>
              <option value="saudi">saudi</option>
              <option value="espresso">espresso</option>
              <option value="cold">cold</option>
            </select>
            <input
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              placeholder="رابط صورة (مثال: /1.png)"
              value={addForm.image}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, image: e.target.value }))
              }
            />
            <input
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
              type="number"
              min="0"
              placeholder="المخزون"
              value={addForm.stockQty}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, stockQty: e.target.value }))
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={addForm.featured}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, featured: e.target.checked }))
                }
              />
              مميز
            </label>
            <div className="md:col-span-6 flex justify-end">
              <button
                onClick={addNew}
                className="rounded-lg bg-primary text-white px-4 py-2"
              >
                إضافة
              </button>
            </div>
          </div>
        )}

        {/* جدول المنتجات */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-300">
                <th className="px-3 py-2 text-right">#</th>
                <th className="px-3 py-2 text-right">الصورة</th>
                <th className="px-3 py-2 text-right">الاسم</th>
                <th className="px-3 py-2 text-right">التصنيف</th>
                <th className="px-3 py-2 text-right">السعر</th>
                <th className="px-3 py-2 text-right">المخزون</th>
                <th className="px-3 py-2 text-right">مميز</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => {
                const isEd = editingId === r.id;
                const img = r.images?.[0] || "/1.png";
                const low = Number(r.stockQty) <= 5;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">
                      <img
                        src={isEd ? draft.image || img : img}
                        alt=""
                        className="h-10 w-10 object-cover rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {isEd ? (
                        <input
                          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 w-56 bg-white dark:bg-zinc-950"
                          value={draft.name}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, name: e.target.value }))
                          }
                        />
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">
                          {r.name}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEd ? (
                        <select
                          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950"
                          value={draft.category}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              category: e.target.value,
                            }))
                          }
                        >
                          <option value="turkish">turkish</option>
                          <option value="brazil">brazil</option>
                          <option value="indian">indian</option>
                          <option value="saudi">saudi</option>
                          <option value="espresso">espresso</option>
                          <option value="cold">cold</option>
                        </select>
                      ) : (
                        r.category
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEd ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 w-28 bg-white dark:bg-zinc-950"
                          value={draft.price}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, price: e.target.value }))
                          }
                        />
                      ) : (
                        `${Number(r.price).toFixed(2)} ل.س`
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEd ? (
                        <input
                          type="number"
                          min="0"
                          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 w-24 bg-white dark:bg-zinc-950"
                          value={draft.stockQty}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              stockQty: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <span
                          className={`${
                            low ? "text-red-600 font-semibold" : ""
                          }`}
                        >
                          {Number(r.stockQty)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEd ? (
                        <input
                          type="checkbox"
                          checked={!!draft.featured}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              featured: e.target.checked,
                            }))
                          }
                        />
                      ) : r.featured ? (
                        "✓"
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-left">
                      {isEd ? (
                        <div className="flex gap-2">
                          <button
                            onClick={commitEdit}
                            className="px-3 py-1 rounded bg-green-600 text-white"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 rounded bg-gray-200 dark:bg-zinc-800 dark:text-white"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => beginEdit({ ...r, image: img })}
                            className="px-3 py-1 rounded bg-black text-white"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => removeRow(r.id)}
                            className="px-3 py-1 rounded bg-red-600 text-white"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    لا توجد بيانات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* تنبيه انخفاض المخزون */}
        {lowStock.length > 0 && (
          <div className="mt-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm">
            <div className="font-semibold mb-1">
              تنبيه: منتجات منخفضة المخزون (≤ 5)
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.slice(0, 10).map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800"
                >
                  {p.name} — {p.stockQty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* المستخدمون والطلبات */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="text-lg font-semibold mb-2">آخر المستخدمين</div>
          <div className="space-y-2 max-h-72 overflow-auto">
            {users.slice(0, 10).map((u, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-gray-100 dark:border-gray-800 p-2"
              >
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {u.name || u.username || u.email}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {u.role || (u.isAdmin ? "admin" : "user")}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-sm text-gray-500">لا يوجد مستخدمون.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="text-lg font-semibold mb-2">آخر الطلبات</div>
          <div className="space-y-2 max-h-72 overflow-auto">
            {orders.slice(0, 10).map((o) => (
              <div
                key={o.id}
                className="rounded border border-gray-100 dark:border-gray-800 p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      رقم: {o.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {Number(o.total).toFixed(2)} ل.س
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  الحالة: {o.status} — طريقة الدفع:{" "}
                  {o.payment?.method || o.payment?.note || "—"}
                </div>
                {/* زر تفاصيل الطلب يمكن ربطه بـ Drawer لو رغبت */}
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-sm text-gray-500">لا يوجد طلبات.</div>
            )}
          </div>
        </div>
      </div>

      {/* مثال مبسّط (اختياري) لطريقة جلب المنتجات في صفحة المتجر كي تظهر فورًا من نفس المصدر */}
      {/*
      // Shop.jsx (مثال):
      import { useEffect, useState } from "react";
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
      export default function Shop(){
        const [items, setItems] = useState([]);
        useEffect(()=>{
          fetch(`${API_BASE}/products`).then(r=>r.json()).then(setItems).catch(()=>{
            // fallback: حمل من localStorage لو حبيت
          });
        },[]);
        return <div>{items.map(p => <div key={p.id}>{p.name}</div>)}</div>
      }
      */}
    </div>
  );
}
