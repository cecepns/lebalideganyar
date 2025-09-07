import { useEffect } from 'react';
import PropTypes from 'prop-types';
import priceImage from '../assets/price.png';

const PriceListModal = ({ isOpen, onClose }) => {
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img 
          src={priceImage} 
          alt="Daftar Harga" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 z-10 transition-colors shadow-lg"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

PriceListModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PriceListModal;
