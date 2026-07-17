import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import logoFull from '../images/logo_full.png';

interface NavbarProps {
  onScrollToSection: (id: string) => void;
}

export default function Navbar({ onScrollToSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Why UpDrive?', id: 'features' },
    { label: 'Pricing Packages', id: 'pricing' },
    { label: 'Success Stories', id: 'testimonials' },
  ];

  const handleItemClick = (id: string) => {
    onScrollToSection(id);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => handleItemClick('hero')} 
            className="flex items-center cursor-pointer group"
          >
            <img 
              src={logoFull} 
              alt="UpDrive Logo" 
              className="h-7 w-auto block transition-transform group-hover:scale-[1.02]" 
            />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            
            <button
              onClick={() => handleItemClick('booking')}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/15 cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              Request to Book
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 px-3">
            <button
              onClick={() => handleItemClick('booking')}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              Request to Book
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
