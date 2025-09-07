import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Banner1 from '../assets/banner_1.jpeg'
import Banner2 from '../assets/banner_2.jpeg'
import Banner3 from '../assets/banner_3.jpeg'
import Banner4 from '../assets/banner_4.jpeg'
import Banner5 from '../assets/banner_5.jpeg'
import Banner6 from '../assets/banner_6.jpeg'
import Banner7 from '../assets/banner_7.jpeg'
import Banner8 from '../assets/banner_8.jpeg'
import Banner9 from '../assets/banner_9.jpeg'

const BannerSlider = () => {
  const banners1 = [
    {
      id: 1,
      image: Banner1,
    },
    {
      id: 2,
      image: Banner2,
    },
    {
      id: 3,
      image: Banner3,
    }
  ];

  const banners2 = [
    {
      id: 1,
      image: Banner4,
    },
    {
      id: 2,
      image: Banner5,
    },
    {
      id: 3,
      image: Banner6,
    }
  ];

  const banners3 = [
    {
      id: 1,
      image: Banner7,
    },
    {
      id: 2,
      image: Banner8,
    },
    {
      id: 3,
      image: Banner9,
    }
  ];

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-white mb-4">PROGRAMME DELA JOURNEE</h2>
          <p className="text-xl text-white bg-[#4c621a] max-w-fit mx-auto px-2 rounded">FABRICATION D&apos;HUILE De COCO</p>
        </div>
        
        <div className="max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 1,
              },
            }}
            className="pb-12"
          >
            {banners1.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                  {/* <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {banner.title}
                    </h3>
                    <p className="text-gray-600">
                      {banner.description}
                    </p>
                  </div> */}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 1,
              },
            }}
            className="pb-12"
          >
            {banners2.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                  {/* <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {banner.title}
                    </h3>
                    <p className="text-gray-600">
                      {banner.description}
                    </p>
                  </div> */}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="200">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 1,
              },
            }}
            className="pb-12"
          >
            {banners3.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                  {/* <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {banner.title}
                    </h3>
                    <p className="text-gray-600">
                      {banner.description}
                    </p>
                  </div> */}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default BannerSlider;