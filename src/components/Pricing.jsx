import { motion } from "framer-motion";
import { Link } from "react-router-dom";
export default function Pricing() {
  return (
    <div className="bg-light py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto bg-secondary text-light p-8 rounded-lg">
          <h2 className="text-4xl font-bold mb-5 ">السعر</h2>
          <p className="text-3xl line-through mb-8">150 ليرة سورية</p>
          <div className="bg-primary text-secondary p-4 rounded-lg mb-8">
            {/* <p className="text-xl font-bold">عرض خاص</p> */}
            <p className="text-4xl font-bold mb-3">
              <span className="text-white drop-shadow-md">75</span> ليرة سورية
              فقط!
            </p>
            <p className="text-lg">وفر 50% لفترة محدودة!</p>
          </div>
          <Link to="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-secondary font-bold py-3 px-8 rounded-full text-lg"
            >
              اطلب الآن
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
