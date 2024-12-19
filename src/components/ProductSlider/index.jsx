import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { products } from './data';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ProductSlider() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000
  };

  return (
    <section className="py-20 ">
      <div className="container mx-auto px-4">
        
        <div className="max-w-4xl mx-auto">
          <Slider {...settings}>
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4"
              >
                <div className=" rounded-2xl  flex justify-center items-center relative">
                  
                  <div className=" h-96">
                  <div className='w-[300px] h-[300px] rounded-full bg-white top-0'></div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-[80%] absolute top-0 "
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}