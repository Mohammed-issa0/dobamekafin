import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import img1 from "../../public/1.png";
import img2 from "../../public/2.jpeg";
import img3 from "../../public/3.jpg";
import img4 from "../../public/4.jpeg";
import img5 from "../../public/5.webp";

function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const featuredProducts = [
    {
      id: 1,
      name: "قهوة بدون هال",
      price: 89.99,
      image: img1,
      category: "coffee",
      description: "قهوة خفيفة التحميص بنكهات زهرية وحمضية",
      featured: true
    },
    {
      id: 3,
      name: "قهوة كولومبية",
      price: 94.99,
      image: img2,
      category: "coffee",
      description: "قهوة متوسطة التحميص بنكهة الشوكولاتة",
      featured: true
    },
    {
      id: 5,
      name: "قهوة كينية",
      price: 99.99,
      image: img3,
      category: "coffee",
      description: "قهوة غنية بالنكهة مع لمسة من التوت",
      featured: true
    }
  ];

  const products = [
    {
      id: 1,
      name: "قهوة إثيوبية يرقاتشيفي",
      price: 89.99,
      image: img4,
      category: "coffee",
      description: "قهوة خفيفة التحميص بنكهات زهرية وحمضية"
    },
    {
      id: 2,
      name: "بن عربي مع هال",
      price: 79.99,
      image: img5,
      category: "beans",
      description: "بن عربي فاخر محمص مع هال طبيعي"
    },
    {
      id: 3,
      name: "قهوة كولومبية",
      price: 94.99,
      image: img1,
      category: "coffee",
      description: "قهوة متوسطة التحميص بنكهة الشوكولاتة"
    },
    {
      id: 4,
      name: "بن برازيلي",
      price: 84.99,
      image: img2,
      category: "beans",
      description: "بن برازيلي محمص بدون هال"
    },
    {
      id: 5,
      name: "قهوة كينية",
      price: 99.99,
      image: img3,
      category: "coffee",
      description: "قهوة غنية بالنكهة مع لمسة من التوت"
    },
    {
      id: 6,
      name: "بن يمني خولاني",
      price: 129.99,
      image: img4,
      category: "beans",
      description: "بن يمني فاخر محمص تحميصاً خفيفاً"
    },
    {
      id: 7,
      name: "قهوة غواتيمالا",
      price: 89.99,
      image: img5,
      category: "coffee",
      description: "قهوة متوازنة بنكهة الكراميل"
    },
    {
      id: 8,
      name: "بن إندونيسي",
      price: 74.99,
      image: img5,
      category: "beans",
      description: "بن إندونيسي محمص بدون هال"
    },
    {
      id: 9,
      name: "قهوة كوستاريكا",
      price: 94.99,
      image: img5,
      category: "coffee",
      description: "قهوة غنية بنكهة الفواكه"
    },
    {
      id: 10,
      name: "بن هندي",
      price: 69.99,
      image: img5,
      category: "beans",
      description: "بن هندي محمص مع هال"
    },
    {
      id: 11,
      name: "قهوة بيرو",
      price: 84.99,
      image: img5,
      category: "coffee",
      description: "قهوة عضوية خفيفة التحميص"
    },
    {
      id: 12,
      name: "بن إثيوبي",
      price: 99.99,
      image: img5,
      category: "beans",
      description: "بن إثيوبي فاخر بدون هال"
    },
    {
      id: 13,
      name: "قهوة هندوراس",
      price: 79.99,
      image: img5,
      category: "coffee",
      description: "قهوة متوسطة التحميص بنكهة الجوز"
    },
    {
      id: 14,
      name: "بن كولومبي",
      price: 89.99,
      image: img5,
      category: "beans",
      description: "بن كولومبي محمص مع هال"
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    rtl: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification({ show: true, message: `تم إضافة ${product.name} إلى السلة` });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/cart');
  };

  const filteredProducts = products
    .filter(product => 
      (filter === 'all' || product.category === filter) &&
      (product.name.includes(searchQuery) || product.description.includes(searchQuery))
    );

  return (
    <div className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg">
              <div className="relative">
                {notification.message}
                <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-progress"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="py-8">
        {/* Featured Products Slider */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">القهوة المميزة</h2>
          <Slider {...sliderSettings}>
            {featuredProducts.map((product) => (
              <div key={product.id} className="px-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative h-48">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-primary text-white text-sm rounded-full">
                        مميز
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-primary">{product.name}</h3>
                    <p className="text-gray-600 mt-1 text-sm">{product.description}</p>
                    <p className="text-xl font-bold text-primary mt-2">{product.price} ريال</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="ابحث عن القهوة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('coffee')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'coffee' 
                  ? 'bg-primary text-white' 
                  : 'border border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              القهوة
            </button>
            <button
              onClick={() => setFilter('beans')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'beans' 
                  ? 'bg-primary text-white' 
                  : 'border border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              البن
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'border border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              الكل
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-primary text-white text-sm rounded-full">
                    {product.category === 'coffee' ? 'قهوة' : 'بن'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-primary">{product.name}</h3>
                <p className="text-gray-600 mt-1 text-sm">{product.description}</p>
                <p className="text-xl font-bold text-primary mt-2">{product.price} ريال</p>
                <div className="mt-4 flex space-x-2 flex-row-reverse">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
                  >
                    إضافة للسلة
                  </button>
                  <button 
                    onClick={() => handleBuyNow(product)}
                    className="flex-1 border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white"
                  >
                    اشترِ الآن
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Shop;