import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, User, MessageCircle, Calendar, Sparkles, CheckCircle, Mail } from 'lucide-react';
import { PRICING_PACKAGES } from '../data';
import { BookingSubmission, PricingPackage } from '../types';

interface BookingFormProps {
  selectedPackageId: string;
  selectedLocation?: string;
  onClearPackage: () => void;
  compact?: boolean;
  packages?: PricingPackage[];
}

export default function BookingForm({ selectedPackageId, selectedLocation, onClearPackage, compact = false, packages = [] }: BookingFormProps) {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [packageId, setPackageId] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const activePackages = packages && packages.length > 0 ? packages : PRICING_PACKAGES;

  // Sync state when parent changes selected package
  useEffect(() => {
    if (selectedPackageId) {
      setPackageId(selectedPackageId);
    }
  }, [selectedPackageId]);

  // Sync state when parent changes selected location
  useEffect(() => {
    if (selectedLocation) {
      setLocation(selectedLocation);
    }
  }, [selectedLocation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Honeypot spam check
    if (honeypot.trim()) {
      console.warn("Spam submission blocked.");
      setIsSubmitted(true);
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMsg('Please enter your contact number.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new booking object
      const newBooking: BookingSubmission = {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        source: 'Landing Page Form',
        selectedPackageId: packageId || undefined,
        location: location || undefined,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for persistence/mock server
      const existingBookingsStr = localStorage.getItem('updrive_bookings') || '[]';
      const existingBookings = JSON.parse(existingBookingsStr);
      existingBookings.push(newBooking);
      localStorage.setItem('updrive_bookings', JSON.stringify(existingBookings));

      // Submit to Web3Forms if configured
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      console.log("Submitting form. Web3Forms key loaded:", !!web3FormsKey);
      if (web3FormsKey && web3FormsKey !== "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: web3FormsKey,
            subject: `New Booking Request - ${fullName.trim()}`,
            from_name: "UpDrive Website",
            name: fullName.trim(),
            phone: mobileNumber.trim(),
            email: email.trim(),
            source: "Landing Page Form",
            selected_package: packageId || "None / Discuss Later",
            location: location || "Not Selected",
            message: comment.trim() ? comment.trim() : "No special requests or comments."
          })
        });

        const data = await response.json();
        console.log("Web3Forms API response:", data);

        if (!response.ok || !data.success) {
          console.error("Web3Forms submission failed:", data);
          throw new Error(data.message || "Failed to send email notification");
        }
      } else {
        // Mock submitting delay if Web3Forms is not yet configured
        await new Promise(resolve => setTimeout(resolve, 700));
      }

      // Trigger global event notifying any listener (like LandingPopup)
      window.dispatchEvent(new Event('updrive_booking_created'));

      setIsSubmitted(true);
      // Reset form
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setComment('');
      onClearPackage();
    } catch (err) {
      setErrorMsg('Something went wrong. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="text-center py-6 space-y-4"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
            Booking request sent successfully!
          </h3>
          <p className="text-slate-600 text-xs max-w-sm mx-auto leading-relaxed">
            Thank you! We've received your request. One of our instructors will contact you shortly.
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="mt-4 border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors text-xs cursor-pointer"
          >
            Send Another Request
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {compact && (
            <div className="mb-2 text-left">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                Request to Book ✨
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                No payment required. Speak with an instructor, discuss routes and custom options.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
              Your Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Priya Patel"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label htmlFor="mobileNumber" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
              Mobile / Contact Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="E.g., +91 XXXXX XXXXX"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g., you@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
                required
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-1 text-left">
            <label htmlFor="formLocation" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
              Your Location / State *
            </label>
            <select
              id="formLocation"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all cursor-pointer text-slate-900"
              required
            >
              <option value="">-- Select Your State --</option>
              <option value="kerala">Kerala</option>
              <option value="karnataka">Karnataka</option>
              <option value="tamilnadu">Tamil Nadu</option>
              <option value="telangana">Telangana</option>
            </select>
          </div>

          {/* Program Selection */}
          <div className="space-y-1">
            <label htmlFor="packageId" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
              Selected Program Pack (Optional)
            </label>
            <select
              id="packageId"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all cursor-pointer"
            >
              <option value="">-- Choose/Discuss Later --</option>
              {activePackages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.duration} - ₹{pkg.promoPrice.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label htmlFor="comment" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
              Special Requests / Ideal Calling Hours
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
                <MessageCircle className="h-4 w-4" />
              </div>
              <textarea
                id="comment"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="E.g., Call me weekend evenings, focus on parking"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all resize-none min-h-[54px]"
              />
            </div>
          </div>

          {/* Honeypot field for bot spam prevention */}
          <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
            <label htmlFor="website">Leave this field blank</label>
            <input
              type="text"
              id="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Prices Disclaimer Note */}
          <div className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 text-center">
            * Note: Course prices may vary depending on custom route configurations and timings. The correct finalised details will be communicated directly over your consultation call.
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/15 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Locking Your Slot...</span>
            ) : (
              <>
                <Phone className="h-4 w-4 shrink-0" />
                Request to Book
              </>
            )}
          </button>

        </form>
      )}
    </AnimatePresence>
  );

  if (compact) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-blue-900/5 p-6 sm:p-8 relative text-left max-w-[480px] mx-auto w-full">
        {formContent}
      </div>
    );
  }

  return (
    <section id="booking" className="py-20 bg-linear-to-b from-white to-slate-50 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header container */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-3">
            Secure Your Slot
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Request to Book
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            No payments required yet. Speak to our head driving instructor, discuss your routes, and lock in your session timeline.
          </p>
        </div>

        {/* Card Form container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden text-left relative grid grid-cols-1 md:grid-cols-12">
          
          {/* Form Left Side Info Accent */}
          <div className="md:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="inline-block p-2 bg-white/10 rounded-2xl w-fit">
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </span>
              <h3 className="text-2xl font-black leading-tight tracking-tight">
                Let's get you behind the steering wheel safely!
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                Our consultant will review your confidence needs, map out low-traffic safe practicing environments near your place, and configure your schedule.
              </p>
            </div>

            <div className="space-y-4 pt-10 border-t border-white/10 mt-8 md:mt-0">
              <div className="flex items-center gap-3.5 text-xs text-blue-50">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-emerald-300" />
                </div>
                <span>Flexible hourly durations</span>
              </div>
              <div className="flex items-center gap-3.5 text-xs text-blue-50">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-emerald-300" />
                </div>
                <span>1-on-1 private attention</span>
              </div>
            </div>
          </div>

          {/* Form Right Side Area */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            {formContent}
          </div>

        </div>

      </div>
    </section>
  );
}
