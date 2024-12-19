import { motion } from 'framer-motion';
import { FaQuoteRight } from 'react-icons/fa';

export default function TestimonialCard({ text, name, age }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-8 shadow-lg text-right relative border-2 border-sport/10"
    >
      <div className="absolute top-4 right-4 text-sport/10">
        <FaQuoteRight className="w-8 h-8" />
      </div>
      <div className="pt-8">
        <p className="text-gray-700 text-lg mb-6 leading-relaxed">{text}</p>
        <div className="flex justify-end items-center border-t border-gray-100 pt-4">
          <div>
            <p className="font-bold text-sport-dark text-lg">{name}</p>
            <p className="text-gray-500">{age}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}