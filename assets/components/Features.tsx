import { motion } from 'motion/react';
import { Sliders, Check } from 'lucide-react';
import { FEATURE_SKILLS } from '../data';

export default function Features() {

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'instructor':
        return (
          <svg viewBox="0 0 100 100" className="w-6 h-6 text-blue-600 stroke-blue-600 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Shield path */}
            <path d="M 50 15 C 65 15, 78 20, 80 40 C 80 65, 50 85, 50 85 C 50 85, 20 65, 20 40 C 22 20, 35 15, 50 15 Z" />
            {/* Heart path */}
            <path d="M 50 40 C 45 32, 34 32, 34 42 C 34 52, 50 64, 50 64 C 50 64, 66 52, 66 42 C 66 32, 55 32, 50 40 Z" />
            {/* Checkmark path */}
            <path d="M 72 45 L 82 55 L 95 32" strokeWidth="4" />
          </svg>
        );
      case 'gps':
        return (
          <svg viewBox="0 0 100 100" className="w-6 h-6 text-emerald-600 stroke-emerald-600 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Steering wheel circle */}
            <circle cx="45" cy="50" r="30" />
            {/* Spokes */}
            <path d="M 45 50 L 45 20" />
            <path d="M 45 50 L 20 65" />
            <path d="M 45 50 L 70 65" />
            {/* Checklist ticks */}
            <path d="M 78 28 L 84 34 L 92 22" strokeWidth="4" />
            <path d="M 78 48 L 84 54 L 92 42" strokeWidth="4" />
            <path d="M 78 68 L 84 74 L 92 62" strokeWidth="4" />
          </svg>
        );
      case 'personalized':
        return <Sliders className="h-6 w-6 text-indigo-600" />;
      default:
        return <Sliders className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBgClass = (iconName: string) => {
    switch (iconName) {
      case 'instructor':
        return 'bg-blue-50 border-blue-100';
      case 'gps':
        return 'bg-emerald-50 border-emerald-100';
      case 'personalized':
        return 'bg-indigo-50 border-indigo-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <section id="features" className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-3">
            Real Road Scenarios
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Learn the Skills You Actually Need
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            We don't just teach you how to pass the test—we build real confidence so you can handle real-world driving safely and independently.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURE_SKILLS.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col hover:shadow-xl hover:border-slate-200/60 transition-all text-left"
            >
              <div>
                {/* Feature Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getBgClass(skill.iconName)} mb-6`}>
                  {getIcon(skill.iconName)}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  {skill.title}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {skill.description}
                </p>
              </div>

              {/* Action Checkpoints */}
              <div className="border-t border-slate-50 pt-5 mt-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">
                  {skill.detailsTitle || "What You'll Learn:"}
                </h4>
                <ul className="space-y-3">
                  {skill.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="mt-0.5 p-0.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
