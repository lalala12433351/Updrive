import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Image as ImageIcon } from 'lucide-react';

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

interface GalleryProps {
  items: GalleryItem[];
}

export default function Gallery({ items }: GalleryProps) {
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="py-20 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-3">
            Life at UpDrive
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <ImageIcon className="h-6 w-6 text-blue-650" />
            Our Training Gallery
          </h2>
          <p className="mt-3 text-slate-650 text-sm sm:text-base">
            Take a look at our student success stories, active driving practice sessions, and high-quality dual-control training vehicles.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`gallery-card-${item.id}`}
              className="group relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-150/40 shadow-xs hover:shadow-xl transition-all cursor-pointer aspect-4/3"
              onClick={() => setActiveImage(item)}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Image element */}
              <img
                src={item.url}
                alt={item.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Glassmorphic Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-6">
                <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-350">
                  <span className="inline-flex items-center justify-center p-1.5 bg-white/20 backdrop-blur-md rounded-lg mb-2">
                    <Maximize2 className="h-4 w-4 text-white" />
                  </span>
                  <p className="text-xs font-medium text-blue-105 uppercase tracking-widest mb-1">UpDrive Session</p>
                  <h4 className="text-sm sm:text-base font-extrabold line-clamp-2 leading-tight">
                    {item.caption}
                  </h4>
                </div>
              </div>

              {/* Small caption visible on mobile (non-hover) */}
              <div className="absolute bottom-3 left-3 right-3 sm:hidden bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-slate-900 shadow-xs">
                <p className="text-xxs font-extrabold truncate">{item.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            {/* Lightbox Card Container */}
            <motion.div
              layoutId={`gallery-card-${activeImage.id}`}
              className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl z-10 flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-950/80 text-white p-2.5 rounded-full transition-all cursor-pointer z-20"
                aria-label="Close lightbox"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Main Image */}
              <div className="w-full overflow-hidden aspect-16/10 bg-slate-900 flex items-center justify-center">
                <img
                  src={activeImage.url}
                  alt={activeImage.caption}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Caption Footer */}
              <div className="p-5 sm:p-7 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                  <span className="text-xxs font-black text-blue-655 uppercase tracking-wider">UpDrive Success Gallery</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-0.5">
                    {activeImage.caption}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveImage(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer self-start sm:self-center"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
