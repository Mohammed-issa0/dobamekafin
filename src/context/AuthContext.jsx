// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

// مفاتيح التخزين
const LS_USERS = "users";
const LS_CURRENT = "currentUser";

// أدوات مساعدة
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function findUserByEmail(email, users) {
  return users.find(
    (u) => String(u.email).toLowerCase() === String(email).toLowerCase()
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // فحص الجلسة عند الإقلاع
  const [error, setError] = useState(null);

  // تحميل الجلسة عند الإقلاع + مزامنة عبر التبويبات
  useEffect(() => {
    try {
      const cu = readJSON(LS_CURRENT, null);
      setUser(cu || null);
    } finally {
      setLoading(false);
    }
    const onStorage = (e) => {
      if (e.key === LS_CURRENT) {
        const cu = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(cu || null);
      }
      // يُفيد لو تغيرت صلاحيات الأدمن داخل users
      if (e.key === LS_USERS) {
        const cu = readJSON(LS_CURRENT, null);
        if (cu) {
          const users = readJSON(LS_USERS, []);
          const fresh = findUserByEmail(cu.email, users);
          if (fresh) setUser(fresh);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // مُخرجات اشتقاقية (مثلاً هل هو أدمن)
  const isAdmin = useMemo(
    () => !!(user?.role === "admin" || user?.isAdmin),
    [user]
  );

  // تحديث currentUser في LS + الحالة
  const setCurrentUser = useCallback((u) => {
    if (u) writeJSON(LS_CURRENT, u);
    else localStorage.removeItem(LS_CURRENT);
    setUser(u || null);
  }, []);

  // تحديث سجل مستخدم داخل users[]
  const upsertUserRecord = useCallback((patchUser) => {
    const users = readJSON(LS_USERS, []);
    const idx = users.findIndex(
      (x) =>
        String(x.email).toLowerCase() === String(patchUser.email).toLowerCase()
    );
    const next = [...users];
    if (idx === -1) next.push(patchUser);
    else next[idx] = patchUser;
    writeJSON(LS_USERS, next);
    return next;
  }, []);

  // تسجيل حساب جديد
  const register = useCallback(
    async ({ name, email, password, isAdmin: adminFlag, role }) => {
      setError(null);
      const users = readJSON(LS_USERS, []);
      if (findUserByEmail(email, users)) {
        throw new Error("هذا البريد مسجّل مسبقًا");
      }

      const now = new Date().toISOString();
      const newUser = {
        id: Date.now(),
        name: name?.trim() || email.split("@")[0],
        email: String(email).toLowerCase(),
        password: String(password), // ملاحظة: لأغراض تجريبية فقط (بدون تشفير)
        role: adminFlag ? "admin" : role || "user",
        isAdmin: !!adminFlag || role === "admin",
        avatarUrl: "",
        createdAt: now,
        updatedAt: now,
      };

      const next = [...users, newUser];
      writeJSON(LS_USERS, next);
      setCurrentUser(newUser);
      return newUser;
    },
    [setCurrentUser]
  );

  // تسجيل الدخول + إمكانية ترقية إلى أدمن لو تم تفعيل السويتش
  const login = useCallback(
    async ({ email, password, isAdmin: adminFlag, role }) => {
      setError(null);
      const users = readJSON(LS_USERS, []);
      const u = findUserByEmail(email, users);
      if (!u) throw new Error("لا يوجد حساب بهذا البريد");
      if (String(u.password) !== String(password))
        throw new Error("كلمة المرور غير صحيحة");

      // لو فعّل المستخدم "تسجيل كأدمن" نرقّي الحساب ونحفظ
      if (adminFlag || role === "admin") {
        u.isAdmin = true;
        u.role = "admin";
        u.updatedAt = new Date().toISOString();
        writeJSON(LS_USERS, users);
      }

      setCurrentUser(u);
      return u;
    },
    [setCurrentUser]
  );

  // تحديث الملف الشخصي (اسم/صورة)
  const updateProfile = useCallback(
    async ({ name, avatarUrl }) => {
      if (!user) throw new Error("غير مسجّل");
      const users = readJSON(LS_USERS, []);
      const u = findUserByEmail(user.email, users);
      if (!u) throw new Error("الحساب غير موجود");
      u.name = name?.trim() || u.name;
      u.avatarUrl = avatarUrl ?? u.avatarUrl;
      u.updatedAt = new Date().toISOString();
      writeJSON(LS_USERS, users);
      setCurrentUser(u);
      return u;
    },
    [user, setCurrentUser]
  );

  // تغيير كلمة المرور
  const changePassword = useCallback(
    async ({ oldPassword, newPassword }) => {
      if (!user) throw new Error("غير مسجّل");
      const users = readJSON(LS_USERS, []);
      const u = findUserByEmail(user.email, users);
      if (!u) throw new Error("الحساب غير موجود");
      if (String(u.password) !== String(oldPassword)) {
        throw new Error("كلمة المرور الحالية غير صحيحة");
      }
      u.password = String(newPassword);
      u.updatedAt = new Date().toISOString();
      writeJSON(LS_USERS, users);
      // لا حاجة لإجبار تسجيل الخروج — حدّث الجلسة فقط
      setCurrentUser(u);
      return true;
    },
    [user, setCurrentUser]
  );

  // تحديث من التخزين (لو لزم)
  const refresh = useCallback(async () => {
    const cu = readJSON(LS_CURRENT, null);
    setUser(cu || null);
    return cu || null;
  }, []);

  // خروج
  const logout = useCallback(async () => {
    setCurrentUser(null);
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");

    // بثّ أحداث لتحديث العدّادات فوراً
    window.dispatchEvent(new Event("cart:clear"));
    window.dispatchEvent(new Event("wishlist:updated"));
  }, [setCurrentUser]);

  const value = {
    user,
    loading,
    error,
    isAdmin,
    register,
    login,
    logout,
    refresh,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
