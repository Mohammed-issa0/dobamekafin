import { motion } from 'framer-motion';

export default function CallToAction() {
  return (
    <div className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-8 text-secondary">لماذا تختار <span className='text-white drop-shadow-md'>دوباميكافين</span> اليوم؟</h2>
        <p className="text-xl mb-4 text-secondary">مع قرب نفاد الكمية، لا تفوت الفرصة للحصول على هذا البن الفاخر بسعر العرض الخاص.</p>
        <p className="text-2xl font-bold mb-8 text-white drop-shadow-md">تبقى أقل من 20 كيس فقط.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-secondary text-primary font-bold py-4 px-8 rounded-full text-xl mb-8"
        >
          اطلب الآن واستمتع بالشحن المجاني!
        </motion.button>
        <p className="text-xl font-bold text-secondary"><span className='text-white drop-shadow-md'>دوباميكافين</span> - لأن كل رشفة تحتسب!</p>
      </div>
    </div>
  );
}