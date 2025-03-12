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
  return(
  <div className="" dir="rtl">
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
  );
}

export default Home;