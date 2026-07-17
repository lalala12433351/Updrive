import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import drivingInstructorStudent from '../images/driving_instructor_student.jpg';

interface HeroProps {
  onScrollToSection: (id: string) => void;
}

export default function Hero({ onScrollToSection }: HeroProps) {
  return (
    <section id="hero" className="relative overflow-hidden bg-white pt-10 pb-20 md:py-24 lg:py-32">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[500px] bg-sky-50/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-50/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
              Master the Road
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Got your License?<br />
              <span className="text-blue-600">Drive with Confidence.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Don't let years of lying license hold you back. UpDrive helps you rebuild your driving skills through expert, personalized sessions on real roads—at your comfort.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => onScrollToSection('pricing')}
                className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 cursor-pointer text-base"
              >
                View Pricing Plans
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onScrollToSection('testimonials')}
                className="inline-flex items-center gap-2 border border-slate-200 hover:border-blue-600 bg-slate-50 hover:bg-blue-50/30 text-slate-700 hover:text-blue-600 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer text-base"
              >
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                Check Our Rating
              </button>
            </div>
          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-6 relative mt-10 lg:mt-0">
            <div className="relative mx-auto max-w-[540px] lg:max-w-none">
              
              {/* Photo Frame Container with Gradient Blur Border */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-100 flex items-center justify-center">
                <img
                  src={drivingInstructorStudent}
                  alt="UpDrive driving class student and instructor"
                  className="w-full h-auto object-cover min-h-[300px]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay Dark Vignette on Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
              </div>

              {/* Float Card: 100% Trusted Badge */}
              <div className="absolute bottom-[10%] left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-blue-50 flex items-center gap-3 max-w-[240px] sm:max-w-[280px]">
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

        </div>
      </div>
    </section>
  );
}
