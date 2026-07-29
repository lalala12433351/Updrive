import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AboutUs from './components/AboutUs';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import LandingPopup from './components/LandingPopup';
import WhatsAppButton from './components/WhatsAppButton';
import TermsModal from './components/TermsModal';
import Gallery, { GalleryItem } from './components/Gallery';
import AdminDashboard from './components/AdminDashboard';
import CareersPage from './components/CareersPage';
import BlogPage from './components/BlogPage';
import { PricingPackage } from './types';
import { dataService } from './services/dataService';


export default function App() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('kerala');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // State-based routing for /admin, /careers and /blog view
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isCareersView, setIsCareersView] = useState<boolean>(false);
  const [isBlogView, setIsBlogView] = useState<boolean>(false);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const isSuperAdmin = window.location.pathname.endsWith('/superadmin') ||
      window.location.hash === '#superadmin' ||
      window.location.search.includes('superadmin');
    const isCareers = window.location.pathname.endsWith('/careers') ||
      window.location.hash === '#careers' ||
      window.location.search.includes('careers');
    const isBlog = window.location.pathname.includes('/blog') ||
      window.location.hash === '#blog' ||
      window.location.search.includes('blog');
    if (isSuperAdmin) {
      setIsAdminView(true);
      setIsLoading(false);
    } else if (isCareers) {
      setIsCareersView(true);
      setIsLoading(false);
    } else if (isBlog) {
      setIsBlogView(true);
      setIsLoading(false);
    } else {
      // Fetch dynamic content on mount
      const fetchContent = async () => {
        const courses = await dataService.getCourses();
        setPackages(courses);

        const gallery = await dataService.getGallery();
        setGalleryItems(gallery);

        setIsLoading(false);
      };

      fetchContent();
    }
  }, []);

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (id: string) => {
    setSelectedPackageId(id);
    // Smooth scroll to booking section so the user can easily complete the form
    handleScrollToSection('booking');
  };

  const handleClearPackage = () => {
    setSelectedPackageId('');
  };

  const handleNewBookingAdded = () => {
    window.dispatchEvent(new Event('updrive_booking_created'));
  };

  if (isAdminView) {
    return <AdminDashboard />;
  }

  if (isCareersView) {
    return <CareersPage />;
  }

  if (isBlogView) {
    return <BlogPage />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Welcome Automatic Popup Modal */}
      <LandingPopup onNewBookingAdded={handleNewBookingAdded} />

      {/* Floating WhatsApp Quick Link */}
      <WhatsAppButton />

      {/* Navigation Headers */}
      <Navbar onScrollToSection={handleScrollToSection} />

      {/* Main Content flow */}
      <main>
        {/* Hero Banner Section */}
        <Hero onScrollToSection={handleScrollToSection} />

        {/* Features / Skill Roadmaps section */}
        <Features />

        {/* About Us section */}
        <AboutUs onScrollToSection={handleScrollToSection} />

        {/* Pricing tier Packages */}
        <Pricing
          selectedPackageId={selectedPackageId}
          onSelectPackage={handleSelectPackage}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          packages={packages}
        />

        {/* Dynamic Image Gallery */}
        {!isLoading && galleryItems.length > 0 && (
          <Gallery items={galleryItems} />
        )}

        {/* Testimonials Review Section */}
        <Testimonials />

        {/* Dynamic Contact Call Response Booking Form */}
        <BookingForm
          selectedPackageId={selectedPackageId}
          selectedLocation={selectedLocation}
          onClearPackage={handleClearPackage}
          packages={packages}
        />
      </main>

      {/* Footer Branding Area */}
      <Footer onShowTerms={() => setShowTermsModal(true)} />

      {/* Trainee Terms & Conditions Popup Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}
