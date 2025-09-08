import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import BannerSlider from "./components/BannerSlider";
import PriceList from "./components/PriceList";
import LocationMap from "./components/LocationMap";
import BookingSection from "./components/BookingSection";
import ContactSection from "./components/ContactSection";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminBookings from "./components/admin/AdminBookings";
import AdminBookingLimits from "./components/admin/AdminBookingLimits";
import AdminReports from "./components/admin/AdminReports";
import LanguageAlertModal from "./components/LanguageAlertModal";
import BookingModal from "./components/BookingModal";
import PriceListModal from "./components/PriceListModal";
import WhatsAppButton from "./components/WhatsAppButton";
import BackgroundImage from "./assets/background.png";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [showLanguageAlert, setShowLanguageAlert] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAdmin(true);
      setAdminUser({ username: "admin" }); // In real app, decode token
    }
  }, []);

  const handleAdminLogin = (user) => {
    setIsAdmin(true);
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
    setAdminUser(null);
  };

  const handleCloseLanguageAlert = () => {
    setShowLanguageAlert(false);
  };

  const handleOpenBookingModal = () => {
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  const handleOpenPriceModal = () => {
    setShowPriceModal(true);
  };

  const handleClosePriceModal = () => {
    setShowPriceModal(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App relative">
               <div 
                className="absolute inset-0 bg-no-repeat bg-cover bg-center bg-fixed"
                style={{
                  backgroundImage: `url(${BackgroundImage})`,
                  filter: 'blur(7px)',
                  zIndex: -1
                }}
              ></div>
              
              <Header />
              <div
                className="max-w-2xl mx-auto bg-fixed bg-cover bg-center bg-no-repeat relative backdrop-blur-sm"
                style={{ backgroundImage: `url(${BackgroundImage})` }}
              >
                {/* Black overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                
                {/* Content with relative positioning to appear above overlay */}
                <div className="relative z-10">
                  <HeroSection />
                  <BannerSlider />
                  <PriceList onOpenPriceModal={handleOpenPriceModal} />
                  <LocationMap />
                  <BookingSection onOpenBooking={handleOpenBookingModal} />
                  <ContactSection />
                </div>
              </div>
              
              {/* Modals - positioned outside content to ensure proper z-index */}
              <LanguageAlertModal
                isOpen={showLanguageAlert}
                onClose={handleCloseLanguageAlert}
              />
              <BookingModal
                isOpen={showBookingModal}
                onClose={handleCloseBookingModal}
              />
              <PriceListModal
                isOpen={showPriceModal}
                onClose={handleClosePriceModal}
              />
              
              {/* WhatsApp Floating Button */}
              <WhatsAppButton />
            </div>
          }
        />

        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminDashboard user={adminUser} onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />

        <Route
          path="/admin/bookings"
          element={
            isAdmin ? (
              <AdminBookings user={adminUser} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route
          path="/admin/booking-limits"
          element={
            isAdmin ? (
              <AdminBookingLimits user={adminUser} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route
          path="/admin/reports"
          element={
            isAdmin ? (
              <AdminReports user={adminUser} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
