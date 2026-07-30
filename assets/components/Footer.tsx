import { Send, MapPin } from 'lucide-react';
import logoWhite from '../images/logo_white.png';

interface FooterProps {
  onShowTerms?: () => void;
}

export default function Footer({ onShowTerms }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pb-12 border-b border-slate-800">
          {/* Logo & Description */}
          <div className="md:col-span-4 space-y-5 text-left">
            <div
              onClick={handleScrollToTop}
              className="flex items-center cursor-pointer group w-fit"
            >
              <img
                src={logoWhite}
                alt="UpDrive Logo"
                className="h-7 w-auto block transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Helping licensed drivers reclaim confidence, bypass traffic panic, and enjoy independent, safe travel in real roads of our cities.
            </p>

            {/* Office Location */}
            <div className="pt-2 flex items-start gap-3 text-slate-400">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0 text-blue-400 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  OFFICE LOCATION
                </h5>
                <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
                  3rd floor, Venus Building, 3rd Main, 1/2 Kalyanarnantappa, Jakkasandra, Koramangala, HSR Layout, Bengaluru, Karnataka 560034
                </p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2 text-left">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Programs
            </h4>
            <ul className="space-y-2 text-sm text-slate-400 font-medium">
              <li>Confidence Booster (4h pack)</li>
              <li>Starter Session (1h trial)</li>
              <li>Pro-Drive Plan (10h intensive)</li>
              <li>Custom City Refresher</li>
            </ul>
          </div>

          {/* Women Trainers */}
          <div className="md:col-span-3 text-left">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Patient & Friendly Women Trainers
            </h4>
            <ul className="space-y-2 text-sm text-slate-400 font-medium">
              <li>
                <a href="tel:+919020919992" className="hover:text-white transition-colors transition-all duration-150">
                  +91 9020919992
                </a>
              </li>
              <li>
                <a href="tel:+918088990959" className="hover:text-white transition-colors transition-all duration-150">
                  +91 8088990959
                </a>
              </li>
              <li>
                <a href="tel:+918075990662" className="hover:text-white transition-colors transition-all duration-150">
                  +91 8075990662
                </a>
              </li>
              <li>
                <a href="tel:+918050004161" className="hover:text-white transition-colors transition-all duration-150">
                  +91 8050004161
                </a>
              </li>
            </ul>
          </div>

          {/* Core Support */}
          <div className="md:col-span-3 text-left">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Inquiries & Updates
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Stay in the loop with driver safety metrics and defensive tips.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-slate-800 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                disabled
              />
              <button
                type="button"
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shrink-0"
                aria-label="Submit email"
                disabled
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Meta bottom */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© {currentYear} UpDrive. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span
              onClick={onShowTerms}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </span>
            <a
              href="/careers"
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Careers
            </a>
            <a
              href="/blog"
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Blog / News
            </a>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Student Safety Code</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
