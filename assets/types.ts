export interface PricingPackage {
  id: string;
  name: string;
  duration: string;
  originalPrice: number;
  promoPrice: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface Testimonial {
  id: string;
  stars: number;
  text: string;
  author: string;
  avatarSeed: string;
  role?: string;
}

export interface FeatureSkill {
  id: string;
  title: string;
  description: string;
  iconName: string;
  details: string[];
  detailsTitle?: string;
}

export interface BookingSubmission {
  fullName: string;
  mobileNumber: string;
  email?: string;
  source: string;
  selectedPackageId?: string;
  location?: string;
  createdAt: string;
}
