import { useEffect } from 'react';

const LanguageAlertModal = ({ isOpen, onClose }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl">
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              <h3 className="text-xl font-bold text-gray-800">Important Notice / Avis Important</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* French Text */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <span className="mr-2">⚠️</span>
              Important – Merci de lire !
              <span className="ml-2">⚠️</span>
            </h4>
            <p className="text-blue-700 leading-relaxed">
              Cette activité est réservée uniquement aux participants francophones, car le guide ne parle pas anglais ni d'autres langues.
            </p>
          </div>

          {/* English Text */}
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
              <span className="mr-2">⚠️</span>
              Important – Please Read!
              <span className="ml-2">⚠️</span>
            </h4>
            <p className="text-amber-700 leading-relaxed">
              This activity is exclusively for French-speaking guests, as the guide does not speak English or other languages.
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              I Understand / Je Comprends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageAlertModal;
