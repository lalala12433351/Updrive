import { ArrowLeft } from 'lucide-react';
import logoFull from '../images/logo_full.png';

interface InstructorTermsPageProps {
  onBackToHome?: () => void;
}

const orderedFilenames = [
  '01_trainer_terms_english_page_01.jpg',
  '01_trainer_terms_english_page_02.jpg',
  '02_trainer_terms_malayalam_page_01.jpg',
  '02_trainer_terms_malayalam_page_02.jpg',
  '03_instructor_training_checklist_english_page_01.jpg',
  '03_instructor_training_checklist_english_page_02.jpg',
  '03_instructor_training_checklist_english_page_03.jpg',
  '03_instructor_training_checklist_english_page_04.jpg',
  '03_instructor_training_checklist_english_page_05.jpg',
  '03_instructor_training_checklist_english_page_06.jpg',
  '03_instructor_training_checklist_english_page_07.jpg',
  '03_instructor_training_checklist_english_page_08.jpg',
  '03_instructor_training_checklist_english_page_09.jpg',
  '03_instructor_training_checklist_english_page_10.jpg',
  '03_instructor_training_checklist_english_page_11.jpg',
  '03_instructor_training_checklist_english_page_12.jpg',
  '03_instructor_training_checklist_english_page_13.jpg',
  '04_instructor_training_checklist_malayalam_page_01.jpg',
  '04_instructor_training_checklist_malayalam_page_02.jpg',
  '04_instructor_training_checklist_malayalam_page_03.jpg',
  '04_instructor_training_checklist_malayalam_page_04.jpg',
  '04_instructor_training_checklist_malayalam_page_05.jpg',
  '04_instructor_training_checklist_malayalam_page_06.jpg',
  '04_instructor_training_checklist_malayalam_page_07.jpg',
  '04_instructor_training_checklist_malayalam_page_08.jpg',
  '04_instructor_training_checklist_malayalam_page_09.jpg',
  '04_instructor_training_checklist_malayalam_page_10.jpg',
  '04_instructor_training_checklist_malayalam_page_11.jpg',
  '04_instructor_training_checklist_malayalam_page_12.jpg',
  '04_instructor_training_checklist_malayalam_page_13.jpg',
];

export default function InstructorTermsPage({ onBackToHome }: InstructorTermsPageProps) {
  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col text-slate-900 font-sans antialiased">
      <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <a href="/" className="flex items-center">
            <img src={logoFull} alt="UpDrive Logo" className="h-7 w-auto" />
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto py-6 sm:py-10 space-y-4">
        {orderedFilenames.map((filename, index) => (
          <img
            key={filename}
            src={`/instructor_docs/${filename}`}
            alt={`Instructor terms and conditions, page ${index + 1}`}
            loading="lazy"
            className="w-full h-auto block bg-white"
          />
        ))}
      </main>
    </div>
  );
}
