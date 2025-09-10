// src/api/client.js
const BASE = import.meta.env.VITE_API_BASE || "";

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    credentials: "include", // مهم لاستقبال/إرسال الكوكي
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const data = await res.json();
      msg = data?.message || data?.errors?.[0]?.msg || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const AuthAPI = {
  me: () => api("/api/me"),
  register: (payload) =>
    api("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => api("/api/auth/login", { method: "POST", body: payload }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
};

export const CartAPI = {
  getGuestCart: () => {
    try {
      return JSON.parse(localStorage.getItem("guest_cart") || "[]");
    } catch {
      return [];
    }
  },
  clearGuestCart: () => localStorage.removeItem("guest_cart"),
  merge: (items) => api("/api/cart/merge", { method: "POST", body: { items } }),
};
