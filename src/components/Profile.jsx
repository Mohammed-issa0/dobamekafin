// src/pages/Profile.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const isImageFile = (file) =>
  file && file.type && file.type.startsWith("image/");
const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

export default function Profile() {
  const { user, loading, updateProfile, changePassword } = useAuth();

  // حالة القسم الأول (الاسم/الصورة)
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // حالة القسم الثاني (تغيير كلمة السر)
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const pwIssues = useMemo(() => {
    const issues = [];
    if (!pw.next || pw.next.length < 8) issues.push("٨ أحرف على الأقل");
    if (pw.next && !/[A-Za-z]/.test(pw.next)) issues.push("حرف واحد على الأقل");
    if (pw.next && !/[0-9]/.test(pw.next)) issues.push("رقم واحد على الأقل");
    if (pw.next && pw.confirm && pw.next !== pw.confirm)
      issues.push("تأكيد كلمة المرور غير مطابق");
    return issues;
  }, [pw]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-[60vh] grid place-items-center text-center"
        dir="rtl"
      >
        <div>
          <h2 className="text-xl font-semibold">
            يجب تسجيل الدخول للوصول إلى الملف الشخصي
          </h2>
          <p className="text-gray-600 mt-2">
            <a className="underline" href="/login">
              تسجيل الدخول
            </a>{" "}
            أو{" "}
            <a className="underline" href="/register">
              إنشاء حساب
            </a>
          </p>
        </div>
      </div>
    );
  }

  async function onChooseFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isImageFile(file)) {
      setProfileMsg("الرجاء اختيار صورة بصيغة صحيحة");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg("الحد الأقصى للصورة 2MB");
      return;
    }
    setAvatarFile(file);
    const dataUrl = await readFileAsDataURL(file);
    setAvatarPreview(dataUrl);
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    setProfileMsg("");
    setSavingProfile(true);
    try {
      let avatarDataUrl = undefined;
      if (avatarFile) {
        avatarDataUrl = await readFileAsDataURL(avatarFile);
      }
      await updateProfile({
        name,
        avatarDataUrl,
        removeAvatar: !avatarFile && avatarPreview === null, // لو ضغط إزالة
      });
      setProfileMsg("تم حفظ التغييرات بنجاح");
      setAvatarFile(null);
    } catch (err) {
      setProfileMsg(err?.message || "تعذر حفظ التغييرات");
    } finally {
      setSavingProfile(false);
    }
  }

  function onRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onChangePassword(e) {
    e.preventDefault();
    setPwMsg("");
    setChangingPw(true);
    try {
      if (pwIssues.length) {
        setPwMsg(`تحقق من كلمة المرور: ${pwIssues.join("، ")}`);
      } else {
        await changePassword({
          currentPassword: pw.current,
          newPassword: pw.next,
        });
        setPwMsg("تم تغيير كلمة المرور بنجاح");
        setPw({ current: "", next: "", confirm: "" });
      }
    } catch (err) {
      setPwMsg(err?.message || "تعذر تغيير كلمة المرور");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">الملف الشخصي</h1>

      {/* قسم الاسم/الصورة */}
      <form
        onSubmit={onSaveProfile}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 space-y-4"
      >
        <h2 className="text-lg font-semibold">المعلومات الأساسية</h2>
        {profileMsg && (
          <div
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: profileMsg.startsWith("تم") ? "#f0fdf4" : "#fef2f2",
              borderColor: profileMsg.startsWith("تم") ? "#bbf7d0" : "#fecaca",
              color: profileMsg.startsWith("تم") ? "#14532d" : "#991b1b",
            }}
          >
            {profileMsg}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden ring-1 ring-gray-200 bg-gray-100 grid place-items-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="صورة المستخدم"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-sm">بدون صورة</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onChooseFile}
                className="block text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-black file:text-white hover:file:opacity-90"
              />
              {avatarPreview && (
                <button
                  type="button"
                  onClick={onRemoveAvatar}
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                >
                  إزالة الصورة
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              الحد الأقصى 2MB. الصيغ المدعومة: PNG/JPEG/WebP.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الكامل
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 border-gray-200 focus:border-gray-300"
            placeholder="مثال: أحمد علي"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-black px-4 py-2.5 text-white font-medium disabled:opacity-70"
          >
            {savingProfile ? "جارٍ الحفظ…" : "حفظ التغييرات"}
          </button>
        </div>
      </form>

      {/* قسم تغيير كلمة السر */}
      <form
        onSubmit={onChangePassword}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold">تغيير كلمة المرور</h2>
        {pwMsg && (
          <div
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              background: pwMsg.startsWith("تم") ? "#f0fdf4" : "#fef2f2",
              borderColor: pwMsg.startsWith("تم") ? "#bbf7d0" : "#fecaca",
              color: pwMsg.startsWith("تم") ? "#14532d" : "#991b1b",
            }}
          >
            {pwMsg}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              required
              className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              required
              className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              required
              className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300"
              autoComplete="new-password"
              minLength={8}
            />
          </div>
        </div>

        {pwIssues.length > 0 && (
          <p className="text-sm text-gray-500">
            المتطلبات: {pwIssues.join("، ")}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={changingPw}
            className="rounded-lg bg-black px-4 py-2.5 text-white font-medium disabled:opacity-70"
          >
            {changingPw ? "جارٍ التغيير…" : "تغيير كلمة المرور"}
          </button>
        </div>
      </form>
    </div>
  );
}
