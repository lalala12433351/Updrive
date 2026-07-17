/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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

export default function App() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('kerala');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

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
        />

        {/* Testimonials Review Section */}
        <Testimonials />

        {/* Dynamic Contact Call Response Booking Form */}
        <BookingForm 
          selectedPackageId={selectedPackageId} 
          selectedLocation={selectedLocation}
          onClearPackage={handleClearPackage} 
        />
      </main>

      {/* Footer Branding Area */}
      <Footer onShowTerms={() => setShowTermsModal(true)} />

      {/* Trainee Terms & Conditions Popup Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}

