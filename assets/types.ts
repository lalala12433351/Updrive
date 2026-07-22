export interface PricingPackage {
  id: string;
  name: string;
  duration: string;
  originalPrice: number;
  promoPrice: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  locations?: string[];
}

export interface Testimonial {
  id: string;
  stars: number;
  text: string;
  author: string;
  avatarSeed: string;
  role?: string;
  avatarUrl?: string;
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

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: string; // e.g. "Full-time", "Part-time"
  description: string;
  requirements: string;
  isActive: boolean;
}

export interface BlogBlock {
  id: string;
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'list' | 'image' | 'video';
  content: string;
  mediaUrl?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  coverImage: string;
  blocks: BlogBlock[];
  createdAt: string;
  isPublished: boolean;
}
