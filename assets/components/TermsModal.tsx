import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, FileText, UserCheck, ShieldCheck, DollarSign } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-10"
          >
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                    Trainee Terms & Conditions
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    Please read and abide by these training guidelines.
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Terms Content */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-6 text-left max-h-[55vh]">
              
              {/* Category 1: Licensing & Documentation */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  1. Licensing & Documentation
                </h4>
                <ul className="space-y-2.5 pl-6 list-decimal text-slate-600 text-xs leading-relaxed font-medium">
                  <li>The trainee must possess a valid Learning License or Driving License before the commencement of training sessions.</li>
                  <li>The trainee must ensure that the training vehicle has valid insurance, Registration Certificate (RC), and all legally required documents.</li>
                </ul>
              </div>

              {/* Category 2: Attendance & Conduct */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  2. Attendance & Conduct
                </h4>
                <ul className="space-y-2.5 pl-6 list-decimal text-slate-600 text-xs leading-relaxed font-medium">
                  <li>The trainee must report on time for all scheduled training sessions and inform in advance in case of delay or absence.</li>
                  <li>The trainee must strictly follow the trainer’s instructions during all training sessions.</li>
                  <li>The trainee must respect the trainer’s time, training methods, and company policies.</li>
                  <li>The trainee shall not consume alcohol, tobacco, or any intoxicating substances before or during training sessions.</li>
                  <li>The trainee must not use or attend mobile phones while learning. In case of emergency calls, the vehicle must be safely parked before attending the call.</li>
                </ul>
              </div>

              {/* Category 3: Safety & Liability */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  3. Safety & Liability
                </h4>
                <ul className="space-y-2.5 pl-6 list-decimal text-slate-600 text-xs leading-relaxed font-medium">
                  <li>The trainee must follow all traffic rules, road regulations, and safety instructions at all times.</li>
                  <li>The trainee shall be fully responsible for any damage, loss, or liability caused due to the trainee’s negligence during training.</li>
                  <li>The trainee must cooperate with the trainer and comply with all legal, safety, and procedural requirements in the event of a serious accident.</li>
                  <li>The trainee must not request, encourage, or insist on unsafe, rash, or illegal driving practices.</li>
                </ul>
              </div>

              {/* Category 4: Fees, Bookings & Cancellations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  4. Fees, Bookings & Cancellations
                </h4>
                <ul className="space-y-2.5 pl-6 list-decimal text-slate-600 text-xs leading-relaxed font-medium">
                  <li>The trainee must pay all training fees only through company-approved payment methods.</li>
                  <li>The trainee must make full payment to the company once the trainer reaches the training location.</li>
                  <li>The trainee shall not directly book future sessions or make any payments to the trainer.</li>
                  <li>Once the advance payment is made, it is non-refundable. However, the trainee may postpone the class by informing the company in advance.</li>
                  <li>If the training session is stopped or discontinued due to the learner’s reasons, the amount paid will not be refunded.</li>
                </ul>
              </div>

              {/* Category 5: Feedback & Termination */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  5. General Policies
                </h4>
                <ul className="space-y-2.5 pl-6 list-decimal text-slate-600 text-xs leading-relaxed font-medium">
                  <li>The trainee must communicate any complaints, concerns, or feedback only through official company channels.</li>
                  <li>The company reserves the right to suspend or cancel training in cases of repeated misconduct, indiscipline, non-compliance, or safety violations by the trainee.</li>
                </ul>
              </div>

            </div>

            {/* Footer Acceptance CTA */}
            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                I Understand & Accept
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
