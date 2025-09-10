import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext"; // ⬅️ جديد
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Shop from "./components/Shop";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import ProductDetails from "./components/ProductDetails";
import LoginForm from "./components/auth/LoginForm"; // ⬅️ جديد
import RegisterForm from "./components/auth/RegisterForm"; // ⬅️ جديد
import ProtectedRoute from "./components/ProtectedRoute"; // ⬅️ جديد
import Dashboard from "./components/Dashboard"; // ⬅️ جديد
import RequireAdmin from "./components/RequireAdmin";
import Favorites from "./components/Favorites";
import Profile from "./components/Profile";
function AccountPage() {
  return <div className="p-6">صفحة الحساب</div>;
}

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* ⬅️ جديد */}
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              {/* صفحات الدخول والتسجيل */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              {/* صفحة الحساب محمية */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
