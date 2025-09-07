import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import logoImage from '../assets/logo-white.png';

const HeroSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section 
      id="home" 
      className="pt-20 mt-24 min-h-96 md:min-h-screen flex items-center relative"
      style={{
        backgroundImage: `url(${logoImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Green overlay */}
      {/* <div className="absolute inset-0 bg-slate-900 bg-opacity-90"></div> */}
      
      {/* Content */}
      {/* <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            data-aos="fade-up"
          >
            Programmer Dela Journee
          </h1>
          <p 
            className="text-xl md:text-2xl text-white mb-8"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Fabrication dihuale decoo
          </p>
          <div 
            className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <a 
              href="#booking" 
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Book Now
            </a>
            <a 
              href="#services" 
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div> */}
    </section>
  );
};

export default HeroSection;