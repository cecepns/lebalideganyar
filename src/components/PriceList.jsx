import PropTypes from 'prop-types';

const PriceList = ({ onOpenPriceModal }) => {

  return (
    <section id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-white mb-4">Cliquez ci-dessous pour voir les prix des activités</h2>
        </div>

        <div className="flex justify-center items-center">
          <button 
            onClick={onOpenPriceModal}
            className="bg-[#4c621a] text-white px-8 py-4 rounded-lg text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            data-aos="fade-up"
          >
            <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tarifs des activités
          </button>
        </div>
      </div>
    </section>
  );
};

PriceList.propTypes = {
  onOpenPriceModal: PropTypes.func.isRequired,
};

export default PriceList;