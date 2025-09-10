import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import Hero from './Hero';
import Features from './Features';
import Benefits from './Benefits';
import Specifications from './Specifications';
import Testimonials from './Testimonials';
import Pricing from './Pricing';
import FAQ from './FAQ';
import CallToAction from './CallToAction';
import Footer from './Footer';

function Home() {
  return (
    <motion.div
      dir="rtl"
      className="relative"
      initial={{ backgroundPosition: '0% 0%' }}
      animate={{ backgroundPosition: ['0% 0%', '100%'] }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        backgroundImage: "url('/bb.jpg')",
       
        backgroundRepeat: 'repeat',
      }}
    >
      {/* طبقة التعتيم */}
      <div className="absolute inset-0 bg-black opacity-70 z-0" />

      {/* المحتوى */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <Benefits />
        {/* <Specifications /> */}
        <Testimonials />
        <Pricing />
        <FAQ />
        <CallToAction />
        <Footer />
      </div>
    </motion.div>
  );
}

export default Home;
