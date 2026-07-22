import { PricingPackage, Testimonial, JobOpening, BlogPost } from '../types';
import { GalleryItem } from '../components/Gallery';
import { InstagramReel } from '../components/Testimonials';
import { HeroSlide } from '../components/Hero';

// Default Seed Data from db.json
import dbData from '../../data/db.json';

const STORAGE_KEYS = {
  COURSES: 'updrive_db_courses',
  GALLERY: 'updrive_db_gallery',
  REELS: 'updrive_db_reels',
  HERO: 'updrive_db_hero',
  REVIEWS: 'updrive_db_reviews',
  JOBS: 'updrive_db_jobs',
  BLOGS: 'updrive_db_blogs',
};

// Safe localStorage wrapper to prevent QuotaExceededError crashes
function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[DataService] QuotaExceededError writing to localStorage for key ${key}:`, err);
    try {
      // Clear legacy cache keys if storage is full
      localStorage.removeItem('updrive_cache_hero');
      localStorage.removeItem('updrive_cache_gallery');
      localStorage.removeItem('updrive_cache_reels');
      localStorage.removeItem('updrive_cache_courses');
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`[DataService] Storage full, failed to save key ${key}:`, e);
    }
  }
}

// Compress Base64 images to lightweight JPEG (max 1200px, 0.75 quality)
export function compressBase64Image(base64Str: string, maxWidth = 1200, maxHeight = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image/') || base64Str.length < 50000) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
}

// Safe fetch helper with 800ms fast timeout so static web hosts never stall on offline APIs
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 800): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetchWithTimeout(url, {}, 800);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[DataService] Server API offline at ${url}, using local storage engine.`);
  }
  return null;
}

// Data Service Engine
export const dataService = {
  // Get Courses / Packages
  async getCourses(): Promise<PricingPackage[]> {
    const serverData = await safeFetchJson<PricingPackage[]>('/api/courses');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      safeSetLocalStorage(STORAGE_KEYS.COURSES, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.packages || []) as PricingPackage[];
    safeSetLocalStorage(STORAGE_KEYS.COURSES, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Courses / Packages
  async saveCourses(packages: PricingPackage[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    safeSetLocalStorage(STORAGE_KEYS.COURSES, JSON.stringify(packages));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetchWithTimeout('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(packages),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Saved to server database!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Saved to website storage!' };
  },

  // Get Gallery Items
  async getGallery(): Promise<GalleryItem[]> {
    const serverData = await safeFetchJson<GalleryItem[]>('/api/gallery');
    if (serverData && Array.isArray(serverData)) {
      safeSetLocalStorage(STORAGE_KEYS.GALLERY, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.gallery || []) as GalleryItem[];
    safeSetLocalStorage(STORAGE_KEYS.GALLERY, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Gallery Items
  async saveGallery(gallery: GalleryItem[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    safeSetLocalStorage(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetchWithTimeout('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(gallery),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Gallery saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Gallery saved to website storage!' };
  },

  // Get Reels
  async getReels(): Promise<InstagramReel[]> {
    const serverData = await safeFetchJson<InstagramReel[]>('/api/reels');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      safeSetLocalStorage(STORAGE_KEYS.REELS, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.REELS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.reels || []) as InstagramReel[];
    safeSetLocalStorage(STORAGE_KEYS.REELS, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Reels
  async saveReels(reels: InstagramReel[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    safeSetLocalStorage(STORAGE_KEYS.REELS, JSON.stringify(reels));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetchWithTimeout('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reels),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Reels saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Reels saved to website storage!' };
  },

  // Get Hero Slides
  async getHeroSlides(): Promise<HeroSlide[]> {
    const serverData = await safeFetchJson<HeroSlide[]>('/api/hero');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      safeSetLocalStorage(STORAGE_KEYS.HERO, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.HERO);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.heroSlides || []) as HeroSlide[];
    safeSetLocalStorage(STORAGE_KEYS.HERO, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Hero Slides
  async saveHeroSlides(heroSlides: HeroSlide[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    safeSetLocalStorage(STORAGE_KEYS.HERO, JSON.stringify(heroSlides));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetchWithTimeout('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(heroSlides),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Hero banner saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Hero banner saved to website storage!' };
  },

  // Get Reviews
  async getReviews(): Promise<Testimonial[]> {
    const serverData = await safeFetchJson<Testimonial[]>('/api/reviews');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.reviews || []) as Testimonial[];
    safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Reviews
  async saveReviews(reviews: Testimonial[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetchWithTimeout('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reviews),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Reviews saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Reviews saved to website storage!' };
  },

  // Get Job Openings (Careers)
  async getJobs(): Promise<JobOpening[]> {
    const serverData = await safeFetchJson<JobOpening[]>('/api/jobs');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      safeSetLocalStorage(STORAGE_KEYS.JOBS, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.jobs || []) as JobOpening[];
    safeSetLocalStorage(STORAGE_KEYS.JOBS, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Job Openings (Careers)
  async saveJobs(jobs: JobOpening[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    safeSetLocalStorage(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetchWithTimeout('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(jobs),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Careers/Jobs saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Careers/Jobs saved to website storage!' };
  },

  // Get Blog Posts (SEO)
  async getBlogs(): Promise<BlogPost[]> {
    const serverData = await safeFetchJson<BlogPost[]>('/api/blogs');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      safeSetLocalStorage(STORAGE_KEYS.BLOGS, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.BLOGS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.blogs || []) as BlogPost[];
    safeSetLocalStorage(STORAGE_KEYS.BLOGS, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Blog Posts (SEO)
  async saveBlogs(blogs: BlogPost[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    safeSetLocalStorage(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetchWithTimeout('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(blogs),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Blog posts saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Blog posts saved to website storage!' };
  },

  // Upload Image (supports compressed Base64 Data URL fallback for static hosting)
  async uploadImage(fileName: string, base64Data: string): Promise<{ success: boolean; url: string }> {
    const token = localStorage.getItem('updrive_superadmin_token');
    // Compress base64 image before sending/saving to keep storage small and fast
    const compressed = await compressBase64Image(base64Data);

    try {
      const res = await fetchWithTimeout('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fileName, base64Data: compressed }),
      }, 800);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.url) {
          return { success: true, url: data.url };
        }
      }
    } catch (e) {}
    // Fallback: Return compressed Base64 Data URL directly for self-contained static web hosting
    return { success: true, url: compressed };
  }
};
