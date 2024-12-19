import { motion } from 'framer-motion';

export default function Button({ children, onClick, className = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`bg-primary text-secondary font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {children}
    </motion.button>
  );
}