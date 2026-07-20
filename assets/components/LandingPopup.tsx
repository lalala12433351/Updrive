import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle, Phone, User, MessageSquare, Mail } from 'lucide-react';
import { BookingSubmission } from '../types';

interface LandingPopupProps {
  onNewBookingAdded: () => void;
}

export default function LandingPopup({ onNewBookingAdded }: LandingPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    // Show the popup automatically shortly after the page has loaded
    const timer = setTimeout(() => {
      // Direct open unless they already booked in this session
      const hasDismissed = sessionStorage.getItem('updrive_popup_dismissed');
      if (!hasDismissed) {
        setIsOpen(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('updrive_popup_dismissed', 'true');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contactNumber.trim() || !email.trim()) return;

    // Honeypot spam check
    if (honeypot.trim()) {
      console.warn("Spam submission blocked.");
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const newBooking: BookingSubmission = {
      fullName: fullName.trim(),
      mobileNumber: contactNumber.trim(),
      email: email.trim(),
      source: comment.trim() ? `Popup: ${comment.trim()}` : 'Popup general inquiry',
      createdAt: new Date().toLocaleString()
    };

    try {
      // Save to localStorage
      try {
        const stored = localStorage.getItem('updrive_bookings');
        const currentList: BookingSubmission[] = stored ? JSON.parse(stored) : [];
        const updatedList = [newBooking, ...currentList];
        localStorage.setItem('updrive_bookings', JSON.stringify(updatedList));
        
        // Notify parent / trigger list update
        onNewBookingAdded();
      } catch (err) {
        console.error("Failed to store booking", err);
      }

      // Submit to Web3Forms if configured
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      console.log("Submitting popup. Web3Forms key loaded:", !!web3FormsKey);
      if (web3FormsKey && web3FormsKey !== "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: web3FormsKey,
            subject: `New Booking Request (Popup) - ${fullName.trim()}`,
            from_name: "UpDrive Website",
            name: fullName.trim(),
            phone: contactNumber.trim(),
            email: email.trim(),
            source: "Popup Form",
            message: comment.trim() ? comment.trim() : "No special requests or comments."
          })
        });

        const data = await response.json();
        console.log("Web3Forms Popup response:", data);

        if (!response.ok || !data.success) {
          console.error("Web3Forms popup submission failed:", data);
          throw new Error(data.message || "Failed to send email notification");
        }
      } else {
        // Mock submitting delay if Web3Forms is not configured
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form fields
      setFullName('');
      setContactNumber('');
      setEmail('');
      setComment('');

      // Dismiss after success animation
      setTimeout(() => {
        setIsOpen(false);
        sessionStorage.setItem('updrive_popup_dismissed', 'true');
      }, 2500);

    } catch (err) {
      console.error("Failed to submit form", err);
      setErrorMsg('Failed to send request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-24 right-4 z-50 w-full max-w-sm px-2 sm:px-0">
          
          {/* Elegant Float Card without dark backdrop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50, y: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50, y: -20 }}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl shadow-blue-900/15 border border-slate-200/80 w-full relative overflow-hidden text-left"
          >
            {/* Soft decorative accent badge at top */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />

            {/* Close Cross icon */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Success View */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">Booking request sent successfully!</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Thank you, <strong>{fullName}</strong>! We will contact you at <strong>{contactNumber}</strong> shortly to schedule your session!
                </p>
              </motion.div>
            ) : (
              /* Input Form structure */
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 pt-1">
                    Start Your Drive ✨
                  </h3>
                  <p className="text-xxs sm:text-xs text-slate-500 font-medium">
                    Request to book a session with our professional driving instructor.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {errorMsg && (
                    <div className="p-2 text-xxs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg">
                      {errorMsg}
                    </div>
                  )}
                  {/* Name field */}
                  <div className="space-y-1">
                    <label htmlFor="p_fullName" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
                      Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="text"
                        id="p_fullName"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="E.g., Ananya Sharma"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Contact Number field */}
                  <div className="space-y-1">
                    <label htmlFor="p_contactNumber" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="tel"
                        id="p_contactNumber"
                        required
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="E.g., +91 XXXXX XXXXX"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1">
                    <label htmlFor="p_email" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="email"
                        id="p_email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E.g., you@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Comment field (TextArea) */}
                  <div className="space-y-1">
                    <label htmlFor="p_comment" className="block text-xxs font-bold text-slate-700 uppercase tracking-wider">
                      Comment
                    </label>
                    <div className="relative">
                      <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-slate-400">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <textarea
                        id="p_comment"
                        rows={1}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Your questions or ideal timing..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium transition-all resize-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Honeypot field for bot spam prevention */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                    <label htmlFor="p_website">Leave this field blank</label>
                    <input
                      type="text"
                      id="p_website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Prices Disclaimer Note */}
                  <div className="text-[10px] text-slate-550 font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50 text-center">
                    * Note: Prices may vary. The correct details will be communicated over the call.
                  </div>

                  {/* Double Actions Button Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors text-xs text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1 text-xs text-center cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Saving...</span>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          Request to Book
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
