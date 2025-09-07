const BookingSection = ({ onOpenBooking }) => {

  return (
    <section id="booking" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-white mb-6">Veuillez réserver ci-dessous</h2>
          
          <button 
            onClick={onOpenBooking}
            className="bg-[#4c621a] text-white px-8 py-4 rounded-lg font-semibold text-lg"
          >
            Prendre rendez-vous
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;