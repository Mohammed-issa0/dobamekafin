import { motion } from 'framer-motion';
import { Coffee,Focus,Heater ,HeartHandshake } from 'lucide-react';

const features = [
  { title: "مذاق استثنائي", description: "يتميز بمزيج متوازن من النكهات الغنية", icon: <Coffee/> },
  { title: "حبوب مختارة بعناية", description: "نقوم بانتقاء أفضل حبوب البن من مزارع ذات سمعة طيبة" , icon: <Focus/>},
  { title: "تحميص مثالي", description: "يتم تحميص الحبوب بطريقة تضمن إطلاق أقصى نكهة", icon: <Heater /> },
  { title: "فوائد صحية", description: "يحتوي على مضادات الأكسدة التي تعزز صحتك" , icon: <HeartHandshake/> }
];

export default function Features() {
  return (
    <div className="bg-light section-padding my-10 py-9 mb-10 mb-0 flex justify-center items-center">
      <div className="container text-center">
        <h2 className="text-3xl font-bold text-secondary pb-4">لماذا بن <span className='text-primary  drop-shadow-sm'>دوباميكافين؟</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="card bg-secondary text-light rounded-md flex flex-col items-center justify-center text-center py-2"
            >
              <h3 className='text-primary pb-3'>{feature.icon}</h3>
              <h3 className="text-xl font-bold mb-4 text-primary">  {feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}