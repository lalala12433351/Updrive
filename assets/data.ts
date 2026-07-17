import { PricingPackage, Testimonial, FeatureSkill } from './types';

export const FEATURE_SKILLS: FeatureSkill[] = [
  {
    id: 'why-updrive',
    title: 'Why book with updrive?',
    iconName: 'instructor',
    description: "The driving industry has long struggled with instructor misbehavior toward women, fraud, poor service, and time-wasting classes that push new packages. updrive fixes all of this.",
    detailsTitle: "WHAT YOU'LL GET",
    details: [
      "Women instructors for women",
      "Empathetic approach from start to end",
      "Well-trained and certified trainers",
      "Instructor will come to your doorstep",
      "Call center support"
    ]
  },
  {
    id: 'readiness',
    title: 'Real Road & Test Readiness',
    iconName: 'gps',
    description: "Go beyond basics — get trained on real traffic conditions and RTO test routes so you're confident on day one, license in hand.",
    detailsTitle: "WHAT YOU'LL LEARN:",
    details: [
      "Real traffic, real conditions, real confidence",
      "Mock test sessions before your final test",
      "Tips from instructors who know local RTO patterns"
    ]
  },
  {
    id: 'personalized',
    title: 'Personalized Classes',
    iconName: 'personalized',
    description: "Your lessons, your way. We tailor each session to match your pace, skill level, and schedule—whether you're a beginner or need a refresher.",
    detailsTitle: "WHAT YOU'LL LEARN:",
    details: [
      "Car basics to highway-ready, step by step",
      "Parking, narrow roads & real driving practice",
      "Maintenance and safety essentials",
      "Final evaluation with personalized feedback"
    ]
  }
];

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'split-10-own',
    name: 'Split Class - 10 Hours (Own Car)',
    duration: '10 Hours (Flexible Days)',
    originalPrice: 9000,
    promoPrice: 7499,
    description: 'Practice on your own car with our expert instructor.',
    features: [
      "10 hours of personalized training",
      "Flexible split sessions (1 to 5 days)",
      "Steering control, reverse & parallel parking",
      "Practice on routes you actually use"
    ]
  },
  {
    id: 'split-6-own',
    name: 'Split Class - 6 Hours (Own Car)',
    duration: '6 Hours (Flexible Days)',
    originalPrice: 5000,
    promoPrice: 3999,
    description: 'Perfect for brushing up on specific city driving skills.',
    features: [
      "6 hours of personalized training",
      "Flexible split sessions (1 to 3 days)",
      "Focus on specific problem areas",
      "Real-world city road traffic practice"
    ]
  },
  {
    id: 'split-10-updrive',
    name: 'Split Class - 10 Hours (UpDrive Car)',
    duration: '10 Hours (Flexible Days)',
    originalPrice: 10000,
    promoPrice: 8499,
    description: 'Learn on our fully-equipped dual-control vehicles.',
    features: [
      "10 hours of intensive training",
      "Flexible split sessions (1 to 5 days)",
      "Dual-control car provided for safety",
      "Complete driving confidence report"
    ]
  },
  {
    id: 'split-6-updrive',
    name: 'Split Class - 6 Hours (UpDrive Car)',
    duration: '6 Hours (Flexible Days)',
    originalPrice: 7000,
    promoPrice: 5549,
    description: 'Mid-level booster package using our training cars.',
    features: [
      "6 hours of intensive training",
      "Flexible split sessions (1 to 3 days)",
      "Dual-control car provided for safety",
      "Traffic and reverse driving techniques"
    ]
  },
  {
    id: 'split-10-mixed',
    name: 'Split Class - 10 Hours (UpDrive + Own Car)',
    duration: '10 Hours (Mixed)',
    originalPrice: 10000,
    promoPrice: 8499,
    description: 'Get the best of both: transition from our car to yours.',
    features: [
      "10 hours of hybrid training sessions",
      "First sessions on UpDrive dual-control car",
      "Final sessions on your own personal car",
      "Smooth transition guidance by instructor"
    ]
  },
  {
    id: 'split-6-mixed',
    name: 'Split Class - 6 Hours (UpDrive + Own Car)',
    duration: '6 Hours (Mixed)',
    originalPrice: 7000,
    promoPrice: 5549,
    description: 'Quick transition booster from our car to yours.',
    features: [
      "6 hours of hybrid training sessions",
      "First sessions on UpDrive dual-control car",
      "Final sessions on your own personal car",
      "Targeted parking and city confidence"
    ]
  },
  {
    id: 'oneday-7',
    name: 'One Day Class - 7 Hours',
    duration: '1 Day (7 Hours)',
    originalPrice: 7500,
    promoPrice: 6000,
    description: 'Intense single-day marathon to lock in your driving confidence.',
    features: [
      "7 hours of continuous on-road training",
      "Dual-control training car provided",
      "Covers highway, city traffic & parking",
      "Perfect for fast learners & tight schedules"
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    stars: 5,
    text: "The trainer was patient, polite, I finally drive in traffic without panic. Highly recommend",
    author: "Ananya K.",
    avatarSeed: "Ananya",
    role: "New Car Owner, Bangalore"
  },
  {
    id: 't2',
    stars: 5,
    text: "I learned more in 4 sessions at UpDrive than I learned in years! Supportive team & real roads.",
    author: "Sneha R.",
    avatarSeed: "Sneha",
    role: "Working Mother, Hyderabad"
  },
  {
    id: 't3',
    stars: 5,
    text: "They build skills & confidence. Forever thankful for my UpDrive journey.",
    author: "Meera C.",
    avatarSeed: "Meera",
    role: "College Student, Mumbai"
  }
];
