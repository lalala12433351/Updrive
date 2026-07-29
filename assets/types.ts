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
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'list' | 'image' | 'video' | 'quote' | 'code' | 'youtube' | 'instagram' | 'newsletter';
  content: string;
  mediaUrl?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  textColor?: string; // hex color code
  backgroundColor?: string; // hex color code
  align?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

export interface BlogCommentReply {
  id: string;
  adminName: string;
  content: string;
  createdAt: string;
}

export interface BlogComment {
  id: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
  adminReplies?: BlogCommentReply[];
}

export interface BlogHistoryEntry {
  id: string;
  timestamp: string;
  title: string;
  blocks: BlogBlock[];
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
  
  // Advanced features
  excerpt?: string;
  featuredImageAlt?: string;
  featuredImageCaption?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledPublishDate?: string; // ISO or date string
  authorName?: string;
  authorBio?: string;
  categories: string[];
  category?: string;
  tags: string[];
  relatedPostIds?: string[];
  isPinned?: boolean;
  seriesName?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  views: number;
  avgTimeOnPageSeconds: number;
  likes: number;
  shares: number;
  bookingConversions: number;
  internalNotes?: string;
  comments?: BlogComment[];
  history?: BlogHistoryEntry[];
}
