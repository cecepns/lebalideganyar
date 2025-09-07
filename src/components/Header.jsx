import { useState } from 'react';
import Logo from '../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white fixed w-full top-0 z-10">
      <div className="max-w-2xl px-5 md:px-0 mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-primary-700">
            <img src={Logo} className="w-16" alt="logo"/>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            <a href="#home" className="text-gray-700 hover:text-primary-600 transition-colors text-sm">Home</a>
            <a href="#services" className="text-gray-700 hover:text-primary-600 transition-colors text-sm">Services</a>
            <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors text-sm">Pricing</a>
            <a href="#location" className="text-gray-700 hover:text-primary-600 transition-colors text-sm">Location</a>
            <a href="#booking" className="text-gray-700 hover:text-primary-600 transition-colors text-sm">Booking</a>
            <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors text-sm">Contact</a>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <a href="#home" className="text-gray-700 hover:text-primary-600 transition-colors py-2 text-sm">Home</a>
              <a href="#services" className="text-gray-700 hover:text-primary-600 transition-colors py-2 text-sm">Services</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors py-2 text-sm">Pricing</a>
              <a href="#location" className="text-gray-700 hover:text-primary-600 transition-colors py-2 text-sm">Location</a>
              <a href="#booking" className="text-gray-700 hover:text-primary-600 transition-colors py-2 text-sm">Booking</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors py-2 text-sm">Contact</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;