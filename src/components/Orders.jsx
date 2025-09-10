import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(Array.isArray(arr) ? arr : []);
    } catch {
      setOrders([]);
    }
  }, []);

  if (!orders.length) {
    return (
      <div className="pt-20 max-w-5xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-primary mb-4">طلباتي</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-600">لا يوجد طلبات حتى الآن.</p>
          <Link to="/shop" className="inline-block mt-3 underline">
            ابدأ التسوق الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4" dir="rtl">
      <h1 className="text-2xl font-bold text-primary mb-4">طلباتي</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                <div>
                  رقم الطلب:{" "}
                  <span className="font-semibold text-gray-900">{o.id}</span>
                </div>
                <div>التاريخ: {new Date(o.createdAt).toLocaleString()}</div>
                <div>
                  الحالة:{" "}
                  <span className="font-semibold text-primary">{o.status}</span>
                </div>
              </div>
              <div className="text-lg font-bold text-primary">
                {o.total.toFixed(2)} ليرة سورية
              </div>
            </div>

            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {o.items.map((it) => (
                <div
                  key={it.id + "-" + it.name}
                  className="rounded border border-gray-100 p-3 flex items-center gap-3"
                >
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{it.name}</div>
                    <div className="text-sm text-gray-600">
                      {it.price} ليرة سورية × {it.quantity || 1} ={" "}
                      {(it.price * (it.quantity || 1)).toFixed(2)} ليرة سورية
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-sm text-gray-600">
              طريقة الدفع:{" "}
              {{
                sham: "شام كاش",
                syriatel: "سيرياتيل كاش",
                mtn: "MTN كاش",
                bemo: "بنك بيمو",
              }[o.payment?.method] || "غير محددة"}
              {o.payment?.syriatelPhone && (
                <>
                  {" "}
                  — هاتف:{" "}
                  <span className="font-medium">{o.payment.syriatelPhone}</span>
                </>
              )}
              {o.payment?.mtnReceiver && (
                <>
                  {" "}
                  — مستلم MTN:{" "}
                  <span className="font-medium">{o.payment.mtnReceiver}</span>
                </>
              )}
              {o.payment?.bemoAccount && (
                <>
                  {" "}
                  — حساب بيمو:{" "}
                  <span className="font-medium">{o.payment.bemoAccount}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
