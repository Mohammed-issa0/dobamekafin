import { useState } from 'react';
import { Quote } from 'lucide-react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  { name: "أحمد", age: 32, text: "لقد جربت الكثير من أنواع القهوة، ولكن دوباميكافين هو الأفضل بلا منازع." },
  { name: "سارة", age: 28, text: "المذاق والغنى لم أتوقع أن يكونا بهذا المستوى، فعلاً قهوة رائعة!" },
  { name: "خالد", age: 35, text: "كل صباح أبدأه بكوب من دوباميكافين يجعل يومي أفضل." },
  { name: "ليلى", age: 27, text: "هذه القهوة جعلتني أعيد التفكير في اختياراتي السابقة." }
];

export default function Testimonials() {
  const settings = {
    dots: true,
    rtl: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    pauseOnHover: true
  };

  return (
    <div className="bg-secondary section-padding py-12" dir='rtl'>
      <div className="container">
        <h2 className="heading-primary text-5xl text-primary mb-5 flex items-center justify-center gap-3"><Quote className='size-12'/>تجارب عملائنا</h2>
        <div className="max-w-3xl mx-auto">
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-4">
                <div className="bg-light text-secondary rounded-xl p-8 text-center">
                  <p dir='rtl' className="text-xl mb-6">"{testimonial.text}"</p>
                  <p  className="text-primary font-bold drop-shadow-md">
                    {testimonial.name}، {testimonial.age} سنة
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
}