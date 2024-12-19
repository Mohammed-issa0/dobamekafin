import { motion } from 'framer-motion';
import cup from "../../public/cup.png"
export default function Hero() {
  return (
    <section className="min-h-screen bg bg-secondary flex items-center justify-center py-20 ">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-primary">
           قهوة دوباميكافين
          </h1>
          <p className="text-xl font-medium md:text-2xl mb-8 text-light">
            حيث <span className='text-primary'>القهوة</span> و <span className='text-primary'>الموسيقى</span> و <span className='text-primary'>الكتاب</span>
          </p>
          <p className="text-lg font-medium md:text-xl mb-12 text-light/90">
          اكتشف بن            <span className='text-primary'> دوباميكافين</span>، أحد أفخر وأفضل أنواع البن في العالم، الذي يجسد الجودة والمذاق الفريد 
            ليمنحك بداية يوم مليئة بالنشاط والإنجاز.
          </p>
          <div className='flex justify-center items-center mb-12'>
          <img src={cup} className='h-full my-auto'/>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-secondary font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 hover:shadow-lg"
          >
            اطلبه الآن
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}