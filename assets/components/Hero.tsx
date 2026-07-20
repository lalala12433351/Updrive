import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import drivingInstructorStudent from '../images/driving_instructor_student.jpg';

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  btn1Text?: string;
  btn1Url?: string;
  btn2Text?: string;
  btn2Url?: string;
  imageFile?: string; // fallback
}

interface HeroProps {
  onScrollToSection: (id: string) => void;
}

const DEFAULT_SLIDE: HeroSlide = {
  id: 'default',
  badge: 'Master the Road',
  title: 'Got your License?\nDrive with Confidence.',
  subtitle: "Don't let years of lying license hold you back. UpDrive helps you rebuild your driving skills through expert, personalized sessions on real roads—at your comfort.",
  imageUrl: drivingInstructorStudent,
  btn1Text: 'View Pricing Plans',
  btn1Url: '#pricing',
  btn2Text: 'Check Our Rating',
  btn2Url: '#testimonials'
};

export default function Hero({ onScrollToSection }: HeroProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([DEFAULT_SLIDE]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const response = await fetch('/api/hero');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setSlides(data);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load hero slides from API:", err);
      }
    };

    fetchHero();
  }, []);

  // Slide Carousel rotation (every 7 seconds)
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [slides]);

  const slide = slides[currentIndex] || DEFAULT_SLIDE;

  return (
    <section id="hero" className="relative overflow-hidden bg-white pt-10 pb-20 md:py-24 lg:py-32 min-h-[620px] flex items-center">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[500px] bg-sky-50/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-50/30 rounded-full blur-3xl" />

      {/* Viewport Container with fixed boundaries */}
      <div className="max-w-7xl mx-auto w-full overflow-hidden px-4 sm:px-6 lg:px-8 relative min-h-[650px] sm:min-h-[580px] lg:min-h-[480px]">
        
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.75 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full"
          >
            
            {/* Hero Left Content */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-6 md:space-y-8 pr-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
                  {slide.badge}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight whitespace-pre-line">
                {slide.title}
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {slide.subtitle}
              </p>
              
              {/* Buttons Row */}
              <div className="pt-2 flex flex-wrap gap-4 items-center">
                {slide.btn1Text && (
                  <button
                    onClick={() => {
                      const target = slide.btn1Url || '#pricing';
                      if (target.startsWith('#')) {
                        onScrollToSection(target.replace('#', ''));
                      } else {
                        window.open(target, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 cursor-pointer text-base"
                  >
                    {slide.btn1Text}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {slide.btn2Text && (
                  <button
                    onClick={() => {
                      const target = slide.btn2Url || '#testimonials';
                      if (target.startsWith('#')) {
                        onScrollToSection(target.replace('#', ''));
                      } else {
                        window.open(target, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="inline-flex items-center gap-2 border border-slate-200 hover:border-blue-600 bg-slate-50 hover:bg-blue-50/30 text-slate-700 hover:text-blue-600 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer text-base"
                  >
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    {slide.btn2Text}
                  </button>
                )}
              </div>
            </div>

            {/* Hero Right Visual Column */}
            <div className="lg:col-span-6 relative mt-10 lg:mt-0">
              <div className="relative mx-auto max-w-[540px] lg:max-w-none">
                
                {/* Photo Frame Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-100 aspect-[4/3] sm:aspect-16/10 lg:aspect-4/3">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay Dark Vignette on Bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none z-10" />
                </div>

                {/* Float Card: 100% Trusted Badge */}
                <div className="absolute bottom-[10%] left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-blue-50 flex items-center gap-3 max-w-[240px] sm:max-w-[280px] z-20">
                  <div className="p-2 bg-blue-50 rounded-xl shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">100% Trusted</h4>
                    <p className="text-slate-500 text-xxs sm:text-xs">By Thousands of Learners Across India</p>
                  </div>
                </div>

                {/* Decorative driving road-element */}
                <div className="absolute -bottom-6 -left-6 -z-10 h-24 w-24 bg-dots-grid text-slate-200 pointer-events-none opacity-40" />
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Dots indicators for carousel (under the track) */}
        {slides.length > 1 && (
          <div className="flex gap-2 pt-10 justify-start relative z-30">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-200 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
