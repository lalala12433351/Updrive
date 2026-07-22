import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ArrowLeft, Send, CheckCircle, Phone, User, Mail, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { JobOpening } from '../types';
import { dataService } from '../services/dataService';
import Footer from './Footer';
import TermsModal from './TermsModal';

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Application Modal state
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await dataService.getJobs();
        setJobs(data.filter(j => j.isActive));
      } catch (err) {
        console.error('Failed to load careers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedJobId(prev => (prev === id ? null : id));
  };

  const handleOpenApplyModal = (job: JobOpening) => {
    setSelectedJob(job);
    setIsSuccess(false);
    setErrorMsg('');
  };

  const handleCloseApplyModal = () => {
    setSelectedJob(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setExperience('');
    setResumeUrl('');
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const newBooking = {
      fullName: fullName.trim(),
      mobileNumber: phone.trim(),
      email: email.trim(),
      source: `Job Application: ${selectedJob?.title || 'Unknown Position'}`,
      createdAt: new Date().toLocaleString()
    };

    try {
      // 1. Save to local storage bookings list
      const stored = localStorage.getItem('updrive_bookings');
      const currentList = stored ? JSON.parse(stored) : [];
      localStorage.setItem('updrive_bookings', JSON.stringify([newBooking, ...currentList]));

      // 2. Push to GTM dataLayer for Conversion tracking
      try {
        const dataLayer = (window as any).dataLayer || [];
        dataLayer.push({
          event: 'contactFormSubmitted',
          formId: 63,
          'gtm.uniqueEventId': 14,
          inputs: [
            { name: 'your-name', value: fullName.trim() },
            { name: 'your-email', value: email.trim() },
            { name: 'your-phone', value: phone.trim() },
            { name: 'your-subject', value: `Job Application - ${selectedJob?.title}` },
            { name: 'your-message', value: `Experience: ${experience.trim()}. Resume: ${resumeUrl.trim()}` }
          ]
        });
      } catch (gtmErr) {
        console.warn('GTM dataLayer push failed:', gtmErr);
      }

      // 3. Submit to Web3Forms if configured
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      if (web3FormsKey && web3FormsKey !== "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: web3FormsKey,
            subject: `New Job Application - ${selectedJob?.title} - ${fullName.trim()}`,
            from_name: "UpDrive Careers Portal",
            name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            source: "Careers Form",
            message: `Position: ${selectedJob?.title}\nExperience Overview: ${experience.trim()}\nResume / Profile Link: ${resumeUrl.trim() || 'Not Provided'}`
          })
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setIsSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        handleCloseApplyModal();
      }, 2500);
    } catch (err) {
      console.error('Failed to submit application:', err);
      setErrorMsg('Submission failed. Please check your network and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased text-left">
      
      {/* Careers Header */}
      <header className="bg-white border-b border-slate-200 py-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </a>
          <div>
            <span className="text-xxs font-black text-blue-650 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Careers Portal</span>
          </div>
        </div>
      </header>

      {/* Main Careers Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Careers Hero Callout */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
            Join the UpDrive Team
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Build Confidence on the Roads
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            We are looking for patient, empathetic driving instructors, customer coordinators, and support staff to help new and anxious drivers regain independence and road confidence.
          </p>
        </div>

        {/* Job Listings Area */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-200 pb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Current Job Openings ({jobs.length})
          </h2>

          {isLoading ? (
            <div className="py-16 text-center text-slate-500 font-medium animate-pulse">
              Loading available positions...
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
              <h4 className="font-bold text-slate-800">No active openings right now</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We're always looking for great talent. Send an email to support or check back soon as we expand our operation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isExpanded = expandedJobId === job.id;
                return (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-350 transition-colors shadow-xs relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <h3 className="text-lg font-black text-slate-900 leading-snug tracking-tight">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(job.id)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Hide Details
                              <ChevronUp className="h-4.5 w-4.5 text-slate-400" />
                            </>
                          ) : (
                            <>
                              View Details
                              <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenApplyModal(job)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-600 max-w-3xl leading-relaxed text-left">
                      <p>{job.description}</p>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-slate-100 text-left space-y-3 animate-fadeIn">
                        <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest">Requirements & Qualifications</h4>
                        <div className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                          {job.requirements}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Application Form Overlay Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleCloseApplyModal} />
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 space-y-5 max-h-[90vh] overflow-y-auto text-left">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Apply for Position</h3>
              <p className="text-xs text-blue-655 font-bold">{selectedJob.title}</p>
            </div>

            {isSuccess ? (
              <div className="py-10 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for applying, <strong>{fullName}</strong>. We will review your submission and contact you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                {errorMsg && (
                  <div className="p-2.5 text-xxs font-bold text-red-650 bg-red-50 border border-red-100 rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="E.g., Priya Kumar"
                      className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-slate-55/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-slate-55/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Mobile Number *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 XXXXX"
                        className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-slate-55/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Experience Overview / Cover Note</label>
                  <textarea
                    rows={3}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Briefly state your driving/coordinating experience..."
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-55/40 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Resume Link / LinkedIn URL (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or LinkedIn profile"
                      className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-55/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseApplyModal}
                    className="w-full py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer onShowTerms={() => setShowTermsModal(true)} />
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}
