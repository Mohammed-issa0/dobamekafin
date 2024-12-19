import Slider from 'react-slick';
import { testimonials } from './data';
import TestimonialCard from './TestimonialCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Testimonials() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    rtl: true,
    customPaging: () => (
      <div className="w-3 h-3 mx-1 rounded-full bg-sport/20 hover:bg-sport transition-colors duration-300" />
    )
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-sport-dark">تجارب عملائنا</h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          اكتشف تجارب عملائنا الحقيقية مع خفافات SportFlex
        </p>
        <div className="max-w-3xl mx-auto">
          <div className="testimonials-slider">
            <Slider {...settings}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="px-4 pb-12">
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
}