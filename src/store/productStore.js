import seedProducts from "../data/products"; // ملفك الحالي

const LS_KEY = "products";

// تحميل المنتجات: من LS وإلا من البذرة
export function loadProducts() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : null;
    if (Array.isArray(arr) && arr.length) return arr;
  } catch {}
  return seedProducts; // fallback
}

export function saveProducts(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function upsertProduct(list, product) {
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx === -1) return [...list, product];
  const next = [...list];
  next[idx] = product;
  return next;
}

export function deleteProduct(list, id) {
  return list.filter((p) => p.id !== id);
}

// مولّد آي دي بسيط
export function genId(list) {
  const max = list.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
  return max + 1;
}
