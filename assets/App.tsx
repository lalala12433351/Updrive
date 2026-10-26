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
import StudentTermsPage from './components/StudentTermsPage';
import InstructorTermsPage from './components/InstructorTermsPage';
import { PricingPackage } from './types';
import { dataService } from './services/dataService';


export default function App() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('kerala');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // State-based routing for /admin, /careers, /blog, /t&c/students and /t&c/instructors view
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isCareersView, setIsCareersView] = useState<boolean>(false);
  const [isBlogView, setIsBlogView] = useState<boolean>(false);
  const [isStudentTermsView, setIsStudentTermsView] = useState<boolean>(false);
  const [isInstructorTermsView, setIsInstructorTermsView] = useState<boolean>(false);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleRouteChange = () => {
      const rawPath = window.location.pathname;
      let decodedPath = '';
      try {
        decodedPath = decodeURIComponent(rawPath).toLowerCase();
      } catch {
        decodedPath = rawPath.toLowerCase();
      }
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isSuperAdmin = decodedPath.endsWith('/superadmin') ||
        hash === '#superadmin' ||
        search.includes('superadmin');
      const isCareers = decodedPath.endsWith('/careers') ||
        hash === '#careers' ||
        search.includes('careers');
      const isBlog = decodedPath.includes('/blog') ||
        hash === '#blog' ||
        search.includes('blog');
      const isStudentTerms = 
        decodedPath.includes('/t&c/students') ||
        rawPath.toLowerCase().includes('/t%26c/students') ||
        decodedPath.includes('/tc/students') ||
        decodedPath.includes('/terms/students') ||
        hash.includes('t&c/students') ||
        hash.includes('tc/students') ||
        search.includes('t&c/students') ||
        search.includes('tc/students');
      const isInstructorTerms = 
        decodedPath.includes('/t&c/instructors') ||
        rawPath.toLowerCase().includes('/t%26c/instructors') ||
        decodedPath.includes('/tc/instructors') ||
        decodedPath.includes('/terms/instructors') ||
        hash.includes('t&c/instructors') ||
        hash.includes('tc/instructors') ||
        search.includes('t&c/instructors') ||
        search.includes('tc/instructors');

      if (isSuperAdmin) {
        setIsAdminView(true);
        setIsStudentTermsView(false);
        setIsInstructorTermsView(false);
        setIsCareersView(false);
        setIsBlogView(false);
        setIsLoading(false);
      } else if (isInstructorTerms) {
        setIsInstructorTermsView(true);
        setIsStudentTermsView(false);
        setIsAdminView(false);
        setIsCareersView(false);
        setIsBlogView(false);
        setIsLoading(false);
      } else if (isStudentTerms) {
        setIsStudentTermsView(true);
        setIsInstructorTermsView(false);
        setIsAdminView(false);
        setIsCareersView(false);
        setIsBlogView(false);
        setIsLoading(false);
      } else if (isCareers) {
        setIsCareersView(true);
        setIsAdminView(false);
        setIsStudentTermsView(false);
        setIsInstructorTermsView(false);
        setIsBlogView(false);
        setIsLoading(false);
      } else if (isBlog) {
        setIsBlogView(true);
        setIsAdminView(false);
        setIsStudentTermsView(false);
        setIsInstructorTermsView(false);
        setIsCareersView(false);
        setIsLoading(false);
      } else {
        setIsAdminView(false);
        setIsStudentTermsView(false);
        setIsInstructorTermsView(false);
        setIsCareersView(false);
        setIsBlogView(false);

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
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
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

  if (isInstructorTermsView) {
    return (
      <InstructorTermsPage 
        onBackToHome={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }} 
      />
    );
  }

  if (isStudentTermsView) {
    return (
      <StudentTermsPage 
        onBackToHome={() => {
          window.history.pushState({}, '', '/');
          setIsStudentTermsView(false);
        }} 
      />
    );
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
