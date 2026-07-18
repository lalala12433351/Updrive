import { motion } from 'motion/react';

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center">
      {/* Decorative breathing/pulsing green aura */}
      <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25 scale-125 pointer-events-none" />
      
      {/* Real Floating WhatsApp Action Button */}
      <motion.a
        href="https://wa.me/919020919992?text=Hi%2C%20Can%20i%20know%20more%20about%20Updrive%3F"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba59] transition-all group border border-emerald-400"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        {/* Soft Shadow Overlay */}
        <span className="absolute inset-0 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Precise High-Fidelity SVG for WhatsApp Icon */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 sm:w-9 sm:h-9 fill-white text-white drop-shadow-md"
        >
          <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.952.563 3.774 1.533 5.313L2.2 21.8l4.63-.924c1.473.805 3.167 1.264 4.974 1.264 5.524 0 10.004-4.48 10.004-10.004C21.808 6.48 17.328 2 12.004 2zm5.724 13.91c-.244.686-1.205 1.292-1.895 1.38-.636.082-1.432.145-3.356-.653-2.46-.995-4.04-3.414-4.162-3.578-.12-.164-1.002-1.332-1.002-2.54 0-1.207.632-1.802.856-2.046.223-.245.49-.306.652-.306.163 0 .326.002.467.008.148.006.347-.056.543.414.204.49.695 1.693.756 1.815.061.122.102.265.02.428-.082.163-.122.265-.245.408-.122.143-.257.32-.367.428-.123.12-.25.253-.108.497.143.245.632 1.037 1.356 1.682.934.832 1.721 1.09 1.966 1.21.245.122.387.102.53-.06.143-.163.612-.715.775-.957.163-.245.326-.204.55-.122.224.082 1.427.673 1.672.795.245.122.408.184.469.286.061.102.061.59-.183 1.277z" />
        </svg>
      </motion.a>
    </div>
  );
}
