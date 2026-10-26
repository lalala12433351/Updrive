import React from 'react';
import { ArrowLeft } from 'lucide-react';
import englishDocImg from '../images/student_terms_english.jpg';
import malayalamDocImg from '../images/student_terms_malayalam.jpg';
import logoFull from '../images/logo_full.png';

interface StudentTermsPageProps {
  onBackToHome?: () => void;
}

export default function StudentTermsPage({ onBackToHome }: StudentTermsPageProps) {
  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <a href="/" className="flex items-center">
            <img src={logoFull} alt="UpDrive Logo" className="h-7 w-auto" />
          </a>
        </div>
      </header>

      {/* Main Content: Displays the 2 documents in the exact same order */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Document 1: English */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <img
            src={englishDocImg}
            alt="Student Terms & conditions"
            className="w-full h-auto block"
          />
        </div>

        {/* Document 2: Malayalam */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <img
            src={malayalamDocImg}
            alt="പരിശീലനാർത്ഥികൾക്കുള്ള നിബന്ധനകളും വ്യവസ്ഥകളും"
            className="w-full h-auto block"
          />
        </div>
      </main>
    </div>
  );
}
