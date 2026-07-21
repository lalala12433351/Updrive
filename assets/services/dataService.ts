import { PricingPackage } from '../types';
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
};

// Safe JSON fetch helper
async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[DataService] Server API unavailable at ${url}, using local storage engine:`, err);
  }
  return null;
}

// Data Service Engine
export const dataService = {
  // Get Courses / Packages
  async getCourses(): Promise<PricingPackage[]> {
    const serverData = await safeFetchJson<PricingPackage[]>('/api/courses');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.packages || []) as PricingPackage[];
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Courses / Packages
  async saveCourses(packages: PricingPackage[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(packages));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(packages),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Saved to server database!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Saved to local website storage!' };
  },

  // Get Gallery Items
  async getGallery(): Promise<GalleryItem[]> {
    const serverData = await safeFetchJson<GalleryItem[]>('/api/gallery');
    if (serverData && Array.isArray(serverData)) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.gallery || []) as GalleryItem[];
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Gallery Items
  async saveGallery(gallery: GalleryItem[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(gallery),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Gallery saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Gallery saved to local storage!' };
  },

  // Get Reels
  async getReels(): Promise<InstagramReel[]> {
    const serverData = await safeFetchJson<InstagramReel[]>('/api/reels');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      localStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.REELS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.reels || []) as InstagramReel[];
    localStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Reels
  async saveReels(reels: InstagramReel[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    localStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(reels));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reels),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Reels saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Reels saved to local storage!' };
  },

  // Get Hero Slides
  async getHeroSlides(): Promise<HeroSlide[]> {
    const serverData = await safeFetchJson<HeroSlide[]>('/api/hero');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(serverData));
      return serverData;
    }
    const local = localStorage.getItem(STORAGE_KEYS.HERO);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    const defaultData = (dbData.heroSlides || []) as HeroSlide[];
    localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(defaultData));
    return defaultData;
  },

  // Save Hero Slides
  async saveHeroSlides(heroSlides: HeroSlide[]): Promise<{ success: boolean; mode: 'server' | 'local'; message?: string }> {
    localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(heroSlides));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(heroSlides),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return { success: true, mode: 'server', message: 'Hero banner saved to server!' };
        }
      }
    } catch (e) {}
    return { success: true, mode: 'local', message: 'Hero banner saved to local storage!' };
  },

  // Upload Image (supports Base64 Data URL fallback for static hosting)
  async uploadImage(fileName: string, base64Data: string): Promise<{ success: boolean; url: string }> {
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fileName, base64Data }),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.url) {
          return { success: true, url: data.url };
        }
      }
    } catch (e) {}
    // Fallback: Return Base64 Data URL directly for self-contained static web hosting
    return { success: true, url: base64Data };
  }
};
