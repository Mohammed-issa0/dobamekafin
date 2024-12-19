import { motion } from 'framer-motion';
import { BicepsFlexed ,Smile ,ChartNoAxesGantt,Handshake } from 'lucide-react';
const benefits = [
  {
    title: "تعزيز اليقظة",
    description: "يساعدك في بدء يومك بطاقة وحيوية.",
    icon: <BicepsFlexed  />,
  },
  {
    title: "إحساس بالراحة",
    description: "يمنحك شعورًا بالاسترخاء مع كل رشفة.",
    icon: <Smile />
  },
  {
    title: "أسلوب راقٍ",
    description: "تصميم العبوة يعكس الفخامة والجودة.",
    icon: <ChartNoAxesGantt />
  },
  {
    title: "استثمار ممتع",
    description: "بن يدوم طويلاً بفضل طريقة التعبئة المحترفة.",
    icon: <Handshake />
  }
];

export default function Benefits() {
  return (
    <div className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary">ماذا يضيف لك <span className='text-white'>دوباميكافين</span>؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => ( 
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-light p-6 rounded-lg flex flex-col justify-center items-center"
            >
              <h3 className='text-primary pb-2'>{benefit.icon}</h3>
              <h3 className="text-xl font-bold mb-2 text-primary drop-shadow-sm">{benefit.title}</h3>
              <p className="text-secondary font-bold">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}