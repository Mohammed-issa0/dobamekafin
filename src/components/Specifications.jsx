import { motion } from 'framer-motion';

const specs = [
  "حبوب بن فاخرة: مختارة من أفضل المزارع لضمان أعلى مستوى من الجودة.",
  "تحميص مخصص: يضمن توازن النكهات ورائحة مميزة.",
  "عبوة محكمة: للحفاظ على النكهة والجودة لأطول فترة ممكنة.",
  "مناسبة للاستخدام اليومي: مثالية لمختلف الأوقات سواء في الصباح أو بعد الظهر."
];

export default function Specifications() {
  return (
    <div className="bg-light py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-secondary">المواصفات الأساسية</h2>
        <div className="max-w-3xl mx-auto">
          {specs.map((spec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center mb-6"
            >
              <div className="w-3 h-3 bg-primary rounded-full mr-4"></div>
              <p className="text-lg text-secondary">{spec}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}