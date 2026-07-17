import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRICING_PACKAGES } from '../data';
import { Check, ArrowRight } from 'lucide-react';

interface PricingProps {
  selectedPackageId: string;
  onSelectPackage: (id: string) => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
}

// Custom SVG Icons representing the states
const KarnatakaIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className={`w-12 h-12 transition-all ${active ? 'text-blue-900' : 'text-slate-400 opacity-60'}`} fill="none" stroke="currentColor" strokeWidth="2">
    {/* Main building base */}
    <rect x="20" y="55" width="60" height="20" rx="2" fill={active ? "#EFF6FF" : "#F8FAFC"} />
    {/* Central dome */}
    <path d="M42 55 C42 40, 58 40, 58 55 Z" fill={active ? "#DBEAFE" : "#E2E8F0"} />
    <path d="M50 40 V32 M47 32 H53" />
    {/* Left dome tower */}
    <rect x="26" y="44" width="6" height="11" rx="1" fill={active ? "#DBEAFE" : "#E2E8F0"} />
    <path d="M26 44 L29 37 L32 44 Z" />
    {/* Right dome tower */}
    <rect x="68" y="44" width="6" height="11" rx="1" fill={active ? "#DBEAFE" : "#E2E8F0"} />
    <path d="M68 44 L71 37 L74 44 Z" />
    {/* Pillared gates */}
    <line x1="33" y1="63" x2="33" y2="70" />
    <line x1="37" y1="63" x2="37" y2="70" />
    <line x1="63" y1="63" x2="63" y2="70" />
    <line x1="67" y1="63" x2="67" y2="70" />
    <rect x="46" y="60" width="8" height="15" rx="1" />
  </svg>
);

const KeralaIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className={`w-12 h-12 transition-all ${active ? 'text-emerald-800' : 'text-slate-400 opacity-60'}`} fill="none" stroke="currentColor" strokeWidth="2">
    {/* Palm trees background */}
    <path d="M20 52 C20 32, 28 32, 28 32 M20 52 C20 37, 12 42, 12 42 M20 52 C18 40, 25 43, 25 43" strokeWidth="1.5" />
    <path d="M32 52 C32 27, 40 27, 40 27 M32 52 C32 34, 24 37, 24 37 M32 52 C29 42, 38 43, 38 43" strokeWidth="1.5" />
    {/* Houseboat hull */}
    <path d="M15 62 C30 62, 70 62, 85 55 C75 70, 25 70, 15 62 Z" fill={active ? "#ECFDF5" : "#F8FAFC"} />
    {/* Houseboat roof canopy */}
    <path d="M25 62 C25 49, 65 49, 75 54 L72 62 Z" fill={active ? "#D1FAE5" : "#E2E8F0"} />
    {/* Windows */}
    <circle cx="35" cy="57" r="2.5" />
    <circle cx="48" cy="57" r="2.5" />
    <circle cx="61" cy="57" r="2.5" />
    {/* Water waves */}
    <path d="M10 74 Q20 71 30 74 T50 74 T70 74 T90 74" />
    <path d="M15 79 Q25 77 35 79 T55 79 T75 79 T95 79" />
  </svg>
);

const TelanganaIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className={`w-12 h-12 transition-all ${active ? 'text-teal-800' : 'text-slate-400 opacity-60'}`} fill="none" stroke="currentColor" strokeWidth="2">
    {/* Base building */}
    <rect x="25" y="45" width="50" height="30" rx="2" fill={active ? "#F0FDFA" : "#F8FAFC"} />
    {/* Center archway */}
    <path d="M41 75 C41 60, 59 60, 59 75 Z" fill={active ? "#CCFBF1" : "#E2E8F0"} />
    
    {/* Outer minarets */}
    <rect x="20" y="25" width="7" height="50" rx="1" fill={active ? "#CCFBF1" : "#E2E8F0"} />
    <path d="M18 25 H28 M18 40 H28 M18 55 H28" />
    <path d="M20 25 C20 18, 27 18, 27 25 Z" />
    
    <rect x="73" y="25" width="7" height="50" rx="1" fill={active ? "#CCFBF1" : "#E2E8F0"} />
    <path d="M71 25 H81 M71 40 H81 M71 55 H81" />
    <path d="M73 25 C73 18, 80 18, 80 25 Z" />
    
    <path d="M35 45 Q50 40 65 45" />
    <circle cx="50" cy="40" r="1.5" />
  </svg>
);

const TamilNaduIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className={`w-12 h-12 transition-all ${active ? 'text-orange-700' : 'text-slate-400 opacity-60'}`} fill="none" stroke="currentColor" strokeWidth="2">
    {/* Base platform */}
    <rect x="25" y="72" width="50" height="8" rx="1" fill={active ? "#FFF7ED" : "#F8FAFC"} />
    
    {/* Gopuram tiers (tapering upwards) */}
    <rect x="30" y="60" width="40" height="12" rx="1" fill={active ? "#FFEDD5" : "#E2E8F0"} />
    <rect x="34" y="48" width="32" height="12" rx="1" fill={active ? "#FED7AA" : "#CBD5E1"} />
    <rect x="38" y="38" width="24" height="10" rx="1" fill={active ? "#FDBA74" : "#94A3B8"} />
    
    {/* Top kalasam dome */}
    <path d="M43 38 Q50 30 57 38 Z" fill={active ? "#F97316" : "#64748B"} />
    <line x1="50" y1="30" x2="50" y2="24" strokeWidth="2" />
    
    {/* Tiny gopuram decorations */}
    <line x1="38" y1="60" x2="38" y2="72" />
    <line x1="50" y1="60" x2="50" y2="72" />
    <line x1="62" y1="60" x2="62" y2="72" />
  </svg>
);

const LOCATIONS = [
  { 
    id: 'kerala', 
    name: 'Kerala', 
    isStandard: false, 
    textColor: 'text-slate-900 group-hover:text-emerald-700',
    activeTextColor: 'text-slate-950 font-black',
    borderColor: 'border-slate-200',
    activeBorderColor: 'border-slate-950',
    icon: KeralaIcon
  },
  { 
    id: 'karnataka', 
    name: 'Karnataka', 
    isStandard: true, 
    textColor: 'text-purple-600 group-hover:text-purple-700',
    activeTextColor: 'text-purple-750 font-black',
    borderColor: 'border-slate-200',
    activeBorderColor: 'border-amber-400',
    icon: KarnatakaIcon
  },
  { 
    id: 'tamilnadu', 
    name: 'Tamil Nadu', 
    isStandard: true, 
    textColor: 'text-slate-900 group-hover:text-orange-700',
    activeTextColor: 'text-slate-950 font-black',
    borderColor: 'border-slate-200',
    activeBorderColor: 'border-slate-950',
    icon: TamilNaduIcon
  },
  { 
    id: 'telangana', 
    name: 'Telangana', 
    isStandard: true, 
    textColor: 'text-slate-900 group-hover:text-teal-700',
    activeTextColor: 'text-slate-950 font-black',
    borderColor: 'border-slate-200',
    activeBorderColor: 'border-slate-950',
    icon: TelanganaIcon
  },
];

export default function Pricing({ 
  selectedPackageId, 
  onSelectPackage,
  selectedLocation,
  onSelectLocation
}: PricingProps) {
  const location = selectedLocation;
  const setLocation = onSelectLocation;
  // Price package is only shown once the customer clicks on the state/location button
  const [priceVisible, setPriceVisible] = useState(false);

  const activeLoc = LOCATIONS.find(l => l.id === location) || LOCATIONS[0];

  const getPackageById = (id: string) => PRICING_PACKAGES.find(p => p.id === id);

  const ownCar10 = getPackageById('split-10-own');
  const ownCar6 = getPackageById('split-6-own');
  const updriveCar10 = getPackageById('split-10-updrive');
  const updriveCar6 = getPackageById('split-6-updrive');
  const mixedCar10 = getPackageById('split-10-mixed');
  const mixedCar6 = getPackageById('split-6-mixed');
  const oneDayPkg = getPackageById('oneday-7');

  const handleLocationClick = (locId: string) => {
    setLocation(locId);
    setPriceVisible(true);
  };

  const renderCard = (pkg: any, isOneDay = false) => {
    if (!pkg) return null;
    const isSelected = selectedPackageId === pkg.id;
    
    // Extract days representation
    let daysText = "1 DAY / 2 DAY / 3 DAY / 4 DAY / 5 DAY";
    if (pkg.id.includes('6-')) {
      daysText = "1 DAY / 2 DAY / 3 DAY";
    } else if (isOneDay) {
      daysText = "1 DAY";
    }

    // Extract hours text
    let hoursText = "10 HOURS";
    if (pkg.id.includes('6-')) {
      hoursText = "6 HOURS";
    } else if (isOneDay) {
      hoursText = "7 HOURS";
    }

    return (
      <div 
        className={`rounded-2xl p-5 border text-left flex flex-col justify-between transition-all bg-white relative hover:shadow-md ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-500/10' 
            : 'border-slate-100 shadow-xs'
        }`}
      >
        <div className="space-y-3.5">
          {/* Days Indicator */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {daysText}
          </div>

          {/* Practice Hours */}
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {hoursText}
          </div>

          {/* Pricing Details */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-blue-600">
              ₹{pkg.promoPrice.toLocaleString('en-IN')}
            </span>
            {pkg.originalPrice && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                ₹{pkg.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Brief package description */}
          <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
            {pkg.description}
          </p>

          {/* Mini Features Checklist */}
          <ul className="space-y-1.5 border-t border-slate-50 pt-3">
            {pkg.features.slice(0, 3).map((feat: string, idx: number) => (
              <li key={idx} className="flex items-start gap-1.5 text-xxs text-slate-600">
                <div className="mt-0.5 p-0.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onSelectPackage(pkg.id)}
          className={`w-full mt-4 py-2.5 px-3 rounded-lg font-bold text-center text-xs transition-all shadow-xs cursor-pointer ${
            isSelected 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Choose Plan & Book'}
        </button>
      </div>
    );
  };

  return (
    <section id="pricing" className="py-20 bg-slate-50/30 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-3">
            Simple, Honest Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Practice Program
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Choose your state below to see pricing, schedules, and custom packages tailored for you.
          </p>
        </div>

        {/* Circular Buttons Location Selector */}
        <div className="max-w-4xl mx-auto mb-16 text-center space-y-6">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <span>Select state to view prices</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[9px] font-bold uppercase animate-pulse">
              Click Below
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14">
            {LOCATIONS.map(loc => {
              const active = location === loc.id;
              const IconComp = loc.icon;

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleLocationClick(loc.id)}
                  className="group flex flex-col items-center gap-3 focus:outline-none cursor-pointer transition-all transform active:scale-95"
                >
                  {/* Circle Frame */}
                  <div 
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex items-center justify-center bg-white shadow-xs transition-all duration-300 relative ${
                      active 
                        ? `${loc.activeBorderColor} scale-105 shadow-md ring-4 ring-slate-100` 
                        : 'border-slate-200 group-hover:border-slate-350'
                    }`}
                  >
                    <IconComp active={active} />
                    
                    {/* Small dot indicating pre-selected / clicked status */}
                    {active && (
                      <span className="absolute top-0 right-1 w-3 h-3 bg-blue-600 border-2 border-white rounded-full animate-ping" />
                    )}
                  </div>

                  {/* Text Label */}
                  <span 
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      active ? loc.activeTextColor : 'text-slate-800 group-hover:text-slate-950'
                    }`}
                    style={{ color: active && loc.id === 'karnataka' ? '#7C3AED' : undefined }} // Karnataka Purple text
                  >
                    {loc.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing List with Transition Animations */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {!priceVisible ? (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-md mx-auto text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center gap-4 cursor-pointer hover:border-slate-200 transition-colors group"
                onClick={() => handleLocationClick('kerala')}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-605 flex items-center justify-center animate-bounce">
                  <ArrowRight className="h-5 w-5 rotate-90 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Please select a location above</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Click Kerala (Default) or any other state to unlock specific price packages.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {activeLoc.isStandard ? (
                  <div className="space-y-16">
                    
                    {/* Split Class Section */}
                    <div className="space-y-10">
                      <div className="text-left border-b border-slate-100 pb-3">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                          Split Class
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Spread your training hours across multiple days at your convenience.
                        </p>
                      </div>

                      {/* 3 Columns for Vehicle options */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                        
                        {/* Column 1: with your own car */}
                        <div className="space-y-5 pb-8 lg:pb-0 lg:pr-6 text-left">
                          <div className="mb-1">
                            <span className="text-xs font-black tracking-wider text-slate-700 uppercase">with your own car</span>
                            <p className="text-slate-400 text-xxs mt-0.5 leading-snug">Practice in your personal car with our instructor</p>
                          </div>
                          {renderCard(ownCar10)}
                          {renderCard(ownCar6)}
                        </div>

                        {/* Column 2: with updrive car */}
                        <div className="space-y-5 pt-8 pb-8 lg:pt-0 lg:pb-0 lg:pl-10 lg:pr-6 text-left">
                          <div className="mb-1">
                            <span className="text-xs font-black tracking-wider text-slate-700 uppercase">with updrive car</span>
                            <p className="text-slate-400 text-xxs mt-0.5 leading-snug">Learn on our modern dual-control training cars</p>
                          </div>
                          {renderCard(updriveCar10)}
                          {renderCard(updriveCar6)}
                        </div>

                        {/* Column 3: with updrive car + Own car */}
                        <div className="space-y-5 pt-8 lg:pt-0 lg:pl-10 text-left">
                          <div className="mb-1">
                            <span className="text-xs font-black tracking-wider text-slate-700 uppercase">with updrive car + Own car</span>
                            <p className="text-slate-400 text-xxs mt-0.5 leading-snug">Hybrid sessions transitioning from our car to yours</p>
                          </div>
                          {renderCard(mixedCar10)}
                          {renderCard(mixedCar6)}
                        </div>

                      </div>
                    </div>

                    {/* Separator Line */}
                    <div className="h-px bg-slate-100 w-full" />

                    {/* One Day Class Section */}
                    <div className="space-y-8">
                      <div className="text-left">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                          One Day Class
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Intensive single-day marathon practice session for rapid skill locking.
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <div className="w-full max-w-sm">
                          {renderCard(oneDayPkg, true)}
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Kerala specific view (only One Day class) */
                  <div className="space-y-8 max-w-sm mx-auto">
                    <div className="text-left">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                        One Day Class
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Intensive single-day practice programs available in Kerala.
                      </p>
                    </div>

                    <div>
                      {renderCard(oneDayPkg, true)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
