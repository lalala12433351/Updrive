import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TESTIMONIALS } from '../data';
import { Star, Quote, Instagram, Play } from 'lucide-react';
import { dataService } from '../services/dataService';

export interface InstagramReel {
  id: string;
  caption: string;
  views: string;
  imageUrl?: string;
  image?: string; // fallback for static
  reelUrl: string;
}

import reelParkingImg from '../images/reel_parking_masterclass.png';
import reelTrafficImg from '../images/reel_traffic_navigation.png';
import reelDrivingImg from '../images/reel_driving_success.png';

const INSTAGRAM_REELS = [
  {
    id: 'reel-1',
    caption: 'Priya\'s parallel parking breakthrough! Mastered in under 3 minutes. 🚗🏆',
    views: '85.5K views',
    image: reelParkingImg,
    reelUrl: 'https://www.instagram.com/updrive.official?igsh=MTdjcW9yYzYzM2kxcg%3D%3D&utm_source=qr', // Replace with your actual parallel parking reel link
  },
  {
    id: 'reel-2',
    caption: 'Day 5 navigation through Bangalore\'s heavy bumper-to-bumper traffic. 🚙💨',
    views: '95.3K views',
    image: reelTrafficImg,
    reelUrl: 'https://www.instagram.com/updrive.official?igsh=MTdjcW9yYzYzM2kxcg%3D%3D&utm_source=qr', // Replace with your actual traffic navigation reel link
  },
  {
    id: 'reel-3',
    caption: 'From license-holder in theory to driving independently on the highway! 🎉🛣️',
    views: '43.2K views',
    image: reelDrivingImg,
    reelUrl: 'https://www.instagram.com/updrive.official?igsh=MTdjcW9yYzYzM2kxcg%3D%3D&utm_source=qr', // Replace with your actual highway driving reel link
  },
];

export default function Testimonials() {
  const [reels, setReels] = useState<InstagramReel[]>([]);

  useEffect(() => {
    const fetchReels = async () => {
      const reelsData = await dataService.getReels();
      if (reelsData && reelsData.length > 0) {
        setReels(reelsData);
      } else {
        setReels(INSTAGRAM_REELS);
      }
    };

    fetchReels();
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-3">
            Real Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by Drivers Who Regained Control
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            See how past students went from license-holders in theory to confident, independent drivers in real traffic.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col justify-between relative text-left"
            >
              {/* Floating Quote Icon decorative background */}
              <div className="absolute top-6 right-6 text-slate-100/80 pointer-events-none">
                <Quote className="h-8 w-8 stroke-[1.5]" />
              </div>

              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 text-amber-400 fill-amber-400 shrink-0" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed mb-6 font-medium">
                  "{t.text}"
                </p>
              </div>

              {/* Reviewer Meta info */}
              <div className="flex items-center gap-3 border-t border-slate-50 pt-5 mt-auto">
                {/* Simulated minimal avatar profile badge */}
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.author}</h4>
                  {t.role && (
                    <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instagram Reels Section */}
        <div className="mt-24 pt-16 border-t border-slate-200">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-3">
              <Instagram className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              Featured Reels
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Watch Our Drivers In Action
            </h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Follow our official channel <a href="https://www.instagram.com/updrive.official?igsh=MTdjcW9yYzYzM2kxcg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">@updrive.official</a> for daily student transformations, driving tips, and confidence-building highlights.
            </p>
          </div>

          {/* Grid & Carousel */}
          <div className="flex overflow-x-auto gap-6 pb-6 px-4 no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:pb-0 md:px-0 md:overflow-x-visible max-w-5xl mx-auto">
            {reels.map((reel, index) => (
              <motion.a
                key={reel.id}
                href={reel.reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-3xl overflow-hidden aspect-[9/16] group shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col justify-end bg-slate-900 flex-none w-[82vw] max-w-[290px] snap-start md:w-auto md:max-w-none md:snap-align-none"
              >
                {/* Cover Image */}
                <img
                  src={reel.imageUrl || reel.image}
                  alt={reel.caption}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300 transform group-hover:scale-110 shadow-md">
                    <Play className="h-6 w-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Instagram Logo Overlay */}
                <div className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                  <Instagram className="h-5 w-5" />
                </div>

                {/* Card Content Footer */}
                <div className="relative z-10 p-5 space-y-2 text-left">
                  <p className="text-white text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                    "{reel.caption}"
                  </p>
                  
                  {/* Meta Details */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 border-t border-white/10 pt-3 mt-1 uppercase tracking-wider">
                    <span>@updrive.official</span>
                    <span>{reel.views}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
