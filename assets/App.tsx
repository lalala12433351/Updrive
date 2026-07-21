import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import LandingPopup from './components/LandingPopup';
import WhatsAppButton from './components/WhatsAppButton';
import TermsModal from './components/TermsModal';
import Gallery, { GalleryItem } from './components/Gallery';
import AdminDashboard from './components/AdminDashboard';
import { PricingPackage } from './types';

export default function App() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('kerala');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // State-based routing for /admin view
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const isSuperAdmin = window.location.pathname.endsWith('/superadmin') || 
                         window.location.hash === '#superadmin' || 
                         window.location.search.includes('superadmin');
    if (isSuperAdmin) {
      setIsAdminView(true);
      setIsLoading(false);
    } else {
      // Fetch dynamic content on mount
      const fetchContent = async () => {
        try {
          const coursesRes = await fetch('/api/courses');
          const contentType = coursesRes.headers.get('content-type');
          if (coursesRes.ok && contentType && contentType.includes('application/json')) {
            const coursesData = await coursesRes.json();
            if (Array.isArray(coursesData) && coursesData.length > 0) {
              setPackages(coursesData);
              localStorage.setItem('updrive_cache_courses', JSON.stringify(coursesData));
            }
          } else {
            const cached = localStorage.getItem('updrive_cache_courses');
            if (cached) setPackages(JSON.parse(cached));
          }
        } catch (err) {
          console.warn("API unreachable, loading cached courses:", err);
          const cached = localStorage.getItem('updrive_cache_courses');
          if (cached) setPackages(JSON.parse(cached));
        }

        try {
          const galleryRes = await fetch('/api/gallery');
          const contentType = galleryRes.headers.get('content-type');
          if (galleryRes.ok && contentType && contentType.includes('application/json')) {
            const galleryData = await galleryRes.json();
            if (Array.isArray(galleryData)) {
              setGalleryItems(galleryData);
              localStorage.setItem('updrive_cache_gallery', JSON.stringify(galleryData));
            }
          } else {
            const cached = localStorage.getItem('updrive_cache_gallery');
            if (cached) setGalleryItems(JSON.parse(cached));
          }
        } catch (err) {
          console.warn("API unreachable, loading cached gallery:", err);
          const cached = localStorage.getItem('updrive_cache_gallery');
          if (cached) setGalleryItems(JSON.parse(cached));
        }
        
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
