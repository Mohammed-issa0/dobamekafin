import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart); 
      } catch (error) {
        console.error("Error parsing cart data:", error);
       
        localStorage.removeItem("cart");
      }
    }
  }, []); 

  
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems)); 
    }
  }, [cartItems]); 

  const updateQuantity = (id, change) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) } 
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id)); 
  };

  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

 
  const calculateTotal = () => {
    return calculateSubtotal(); 
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-primary mb-8">سلة المشتريات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                <div className="mr-4 flex-1">
                  <h3 className="text-lg font-semibold text-primary">{item.name}</h3>
                  <p className="text-gray-600">{item.price} ريال</p>
                  <div className="flex items-center mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded">
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded">
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-lg font-semibold text-primary ml-4">
                  {(item.price * item.quantity).toFixed(2)} ريال
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded mr-2">
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

       
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-xl font-semibold text-primary mb-4">ملخص الطلب</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="أدخل كود الخصم"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>المجموع الفرعي</span>
              <span>{calculateSubtotal().toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-primary">
              <span>المجموع الكلي</span>
              <span>{calculateTotal().toFixed(2)} ريال</span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">طريقة الدفع</h3>
            {["الدفع عند الاستلام", "بطاقة ائتمان/مدى", "Apple Pay", "STC Pay"].map((method, index) => (
              <label key={index} className="flex items-center mb-2">
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="ml-2"
                />
                {method}
              </label>
            ))}
          </div>

          <button 
            onClick={() => alert("تم إتمام الطلب بنجاح!")}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90"
          >
            إتمام الطلب
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
