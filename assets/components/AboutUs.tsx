import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ShieldCheck, HeartHandshake, Award, Users, CheckCircle2, Target } from 'lucide-react';
import drivingInstructorStudent from '../images/driving_instructor_student.jpg';
import jaseenaImg from '../images/jaseena.jpg';
import jyothishImg from '../images/jyothish.png';
import sugeshImg from '../images/sugesh.png';
import faisalImg from '../images/faisal.png';
import jabirImg from '../images/jabir.png';

interface AboutUsProps {
  onScrollToSection?: (id: string) => void;
}

interface AnimatedCounterProps {
  numericValue: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ numericValue, decimals = 0, prefix = '', suffix = '', duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = easeProgress * numericValue;

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, numericValue, duration]);

  const formattedValue = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

export default function AboutUs({ onScrollToSection }: AboutUsProps) {
  const stats = [
    {
      numericValue: 10000,
      suffix: '+',
      decimals: 0,
      label: 'Confident Graduates',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100'
    },
    {
      numericValue: 99.4,
      suffix: '%',
      decimals: 1,
      label: 'Test Pass Rate',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      numericValue: 100,
      suffix: '%',
      decimals: 0,
      label: 'Judgment-Free Guarantee',
      icon: HeartHandshake,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      numericValue: 15,
      suffix: '+',
      decimals: 0,
      label: 'Certified Instructors',
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    }
  ];

  const pillars = [
    {
      title: 'Patient & Certified Instructors',
      description: 'Our hand-picked trainers are certified professionals trained in empathetic, stress-free teaching methods tailored for all skill levels.',
      icon: HeartHandshake,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Dual-Control Safety Vehicles',
      description: 'Learn with complete peace of mind in modern, dual-controlled cars that prioritize your safety every second on the road.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Personalized 1-on-1 Training',
      description: 'Every lesson is customized to your personal learning speed, focusing on building real confidence rather than rushing syllabus items.',
      icon: Target,
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];

  const team = [
    {
      name: 'JASEENA',
      role: 'Cofounder',
      image: jaseenaImg
    },
    {
      name: 'JYOTHISH RAMACHANDRAN',
      role: 'Managing Director (MD)',
      image: jyothishImg
    },
    {
      name: 'SUGESH RAGHAVAN',
      role: 'Chief Technology Officer (CTO)',
      image: sugeshImg
    },
    {
      name: 'FAISAL C',
      role: 'Chief Operating Officer (COO)',
      image: faisalImg
    },
    {
      name: 'JABIR C',
      role: 'Chief Executive Officer (CEO)',
      image: jabirImg
    }
  ];

  return (
    <section id="aboutus" className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 border border-blue-100 rounded-full mb-4 shadow-sm">
            About UpDrive Driving School
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Empowering Drivers with Confidence, Safety & Empathy
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            UpDrive was created with a single mission: to transform driving education into an empowering, stress-free, and enjoyable journey. We replace anxiety with real-world skill and confidence.
          </p>
        </div>

        {/* Leadership Team Section */}
        <div id="leadership" className="mb-20 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Leadership & Executive Team
            </h3>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              Meet the visionary team steering UpDrive towards excellence in driver education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all overflow-hidden flex flex-col group"
              >
                <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 text-center flex-1 flex flex-col justify-center bg-white">
                  <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                    {member.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content & Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">

          {/* Left Column: Story & Pillars */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Why Thousands Choose UpDrive to Master the Road
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Whether you're stepping behind the wheel for the first time or looking to rebuild lost confidence, UpDrive provides a structured, judgment-free environment where every question is welcomed and every milestone is celebrated.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="space-y-4 pt-2">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
                  >
                    <div className={`p-3 rounded-xl ${pillar.color} shrink-0 mt-0.5`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{pillar.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            {onScrollToSection && (
              <div className="pt-2">
                <button
                  onClick={() => onScrollToSection('pricing')}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 hover:shadow-lg cursor-pointer gap-2"
                >
                  Explore Training Packages
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Right Column: Featured Image with Badges */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-white group">
              <img
                src={drivingInstructorStudent}
                alt="UpDrive instructor teaching a student"
                className="w-full h-[420px] sm:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

              {/* Overlay Glass Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  Certified & Insured
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800">
                  "Our goal isn't just to help you pass your driving test—it's to make you a safer, calmer driver for life."
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Animated Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/40 text-center flex flex-col items-center hover:border-slate-200 hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color} mb-3 shadow-xs`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  <AnimatedCounter
                    numericValue={stat.numericValue}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    duration={2200}
                  />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

