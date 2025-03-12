import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import logo from '../../public/6.avif';

function Navbar() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount(); // ✅ يحصل على عدد المنتجات الفريدة

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={logo}
              alt="دوباميكافين"
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/shop">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ShoppingBagIcon className="h-6 w-6 text-primary" />
              </motion.div>
            </Link>

            <Link to="/cart">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full hover:bg-gray-100 mr-4 relative"
              >
                <ShoppingCartIcon className="h-6 w-6 text-primary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount} {/* ✅ عدد المنتجات الفريدة */}
                  </span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
