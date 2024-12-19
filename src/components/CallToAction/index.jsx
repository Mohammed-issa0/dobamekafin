import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import CtaBtn from '../CtaBtn';

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-b from-sport to-sport-dark text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-8">لماذا تختار SportFlex اليوم؟</h2>
          <p className="text-xl mb-8">
            مع قرب نفاد الكمية، لا تفوت الفرصة للحصول على هذه الخفافات الرياضية الفاخرة بسعر العرض الخاص.
          </p>
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <p className="text-2xl font-bold">تبقى أقل من 20 قطعة فقط!</p>
          </div>
          <CtaBtn/>
          <p className="mt-6 text-lg">SportFlex – لأن أدائك يعتمد على الراحة.</p>
        </motion.div>
      </div>
    </section>
  );
}