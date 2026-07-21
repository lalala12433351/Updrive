import React, { useState, useEffect, useRef } from 'react';
import { Settings, Plus, Trash2, LogOut, Globe, Lock, FileText, Image as ImageIcon, Upload, Check, Loader2, Save, X, Play } from 'lucide-react';
import { PricingPackage } from '../types';
import { GalleryItem } from './Gallery';
import { InstagramReel } from './Testimonials';
import { HeroSlide } from './Hero';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'courses' | 'gallery' | 'reels' | 'hero'>('courses');
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Form saving states
  const [isSavingCourses, setIsSavingCourses] = useState<boolean>(false);
  const [isSavingGallery, setIsSavingGallery] = useState<boolean>(false);
  const [isSavingReels, setIsSavingReels] = useState<boolean>(false);
  const [isSavingHero, setIsSavingHero] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFetchingCoverIdx, setIsFetchingCoverIdx] = useState<number | null>(null);

  // Uploading states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadingReelCover, setIsUploadingReelCover] = useState<boolean>(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState<boolean>(false);
  
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('updrive_superadmin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('updrive_superadmin_token', data.token);
          setIsAuthenticated(true);
          fetchData();
          return;
        } else {
          setLoginError(data.message || 'Invalid username or password.');
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API offline, attempting client hash check:", err);
    }

    // Static Host Fallback: Supports Web Crypto API (HTTPS) + fallback direct check (HTTP)
    try {
      let matched = false;
      const HASH_CREDENTIALS: Record<string, string> = {
        'Libin': 'd18ab703e9564051ba5f4859c954658381fdbe729f7615ab14f8003cb80253d4',
        'suhaib': 'ce6b9dcc724136bffd6364eb9b7416ad9965801fe0473e18d3541495be69e863'
      };
      const RAW_CREDENTIALS: Record<string, string> = {
        'Libin': 'Libin123@',
        'suhaib': 'Assalamu123!@#'
      };

      if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        if (HASH_CREDENTIALS[username] && HASH_CREDENTIALS[username] === inputHash) {
          matched = true;
        }
      }

      if (!matched && RAW_CREDENTIALS[username] && RAW_CREDENTIALS[username] === password) {
        matched = true;
      }

      if (matched) {
        localStorage.setItem('updrive_superadmin_token', 'static-session-' + Date.now());
        setIsAuthenticated(true);
        fetchData();
        return;
      } else {
        setLoginError('Invalid username or password.');
      }
    } catch (fallbackErr) {
      console.error("Fallback auth error:", fallbackErr);
      setLoginError('Invalid username or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('updrive_superadmin_token');
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    
    try {
      const coursesRes = await fetch('/api/courses');
      if (coursesRes.ok && coursesRes.headers.get('content-type')?.includes('application/json')) {
        const data = await coursesRes.json();
        setPackages(data);
        localStorage.setItem('updrive_cache_courses', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('updrive_cache_courses');
        if (cached) setPackages(JSON.parse(cached));
      }
    } catch (e) {
      const cached = localStorage.getItem('updrive_cache_courses');
      if (cached) setPackages(JSON.parse(cached));
    }

    try {
      const galleryRes = await fetch('/api/gallery');
      if (galleryRes.ok && galleryRes.headers.get('content-type')?.includes('application/json')) {
        const data = await galleryRes.json();
        setGallery(data);
        localStorage.setItem('updrive_cache_gallery', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('updrive_cache_gallery');
        if (cached) setGallery(JSON.parse(cached));
      }
    } catch (e) {
      const cached = localStorage.getItem('updrive_cache_gallery');
      if (cached) setGallery(JSON.parse(cached));
    }

    try {
      const reelsRes = await fetch('/api/reels');
      if (reelsRes.ok && reelsRes.headers.get('content-type')?.includes('application/json')) {
        const data = await reelsRes.json();
        setReels(data);
        localStorage.setItem('updrive_cache_reels', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('updrive_cache_reels');
        if (cached) setReels(JSON.parse(cached));
      }
    } catch (e) {
      const cached = localStorage.getItem('updrive_cache_reels');
      if (cached) setReels(JSON.parse(cached));
    }

    try {
      const heroRes = await fetch('/api/hero');
      if (heroRes.ok && heroRes.headers.get('content-type')?.includes('application/json')) {
        const data = await heroRes.json();
        setHeroSlides(data);
        localStorage.setItem('updrive_cache_hero', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('updrive_cache_hero');
        if (cached) setHeroSlides(JSON.parse(cached));
      }
    } catch (e) {
      const cached = localStorage.getItem('updrive_cache_hero');
      if (cached) setHeroSlides(JSON.parse(cached));
    } finally {
      setIsLoadingData(false);
    }
  };

  // Course management helpers
  const handleAddPackage = () => {
    const newPkg: PricingPackage = {
      id: 'pkg-' + Date.now(),
      name: 'New Practice Class Package',
      duration: '10 Hours',
      originalPrice: 10000,
      promoPrice: 8500,
      description: 'Describe the new driving package here.',
      features: ['1-on-1 private attention', 'Doorstep pickup'],
      locations: ['karnataka', 'tamilnadu', 'telangana']
    };
    setPackages([...packages, newPkg]);
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  const handlePackageFieldChange = (index: number, field: keyof PricingPackage, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const handlePackageFeatureChange = (pkgIdx: number, featIdx: number, value: string) => {
    const updated = [...packages];
    const feats = [...updated[pkgIdx].features];
    feats[featIdx] = value;
    updated[pkgIdx] = { ...updated[pkgIdx], features: feats };
    setPackages(updated);
  };

  const handleAddFeature = (pkgIdx: number) => {
    const updated = [...packages];
    updated[pkgIdx] = { ...updated[pkgIdx], features: [...updated[pkgIdx].features, 'New package feature detail'] };
    setPackages(updated);
  };

  const handleDeleteFeature = (pkgIdx: number, featIdx: number) => {
    const updated = [...packages];
    updated[pkgIdx] = { ...updated[pkgIdx], features: updated[pkgIdx].features.filter((_, idx) => idx !== featIdx) };
    setPackages(updated);
  };

  const handleSaveCourses = async () => {
    setIsSavingCourses(true);
    localStorage.setItem('updrive_cache_courses', JSON.stringify(packages));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(packages)
      });
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          showToast('success', 'Pricing packages saved to server!');
          return;
        }
      }
    } catch (err) {
      console.warn("Server API offline, saved locally:", err);
    }
    showToast('success', 'Pricing packages saved locally!');
    setIsSavingCourses(false);
  };

  // Gallery management helpers
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const token = localStorage.getItem('updrive_superadmin_token');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fileName: file.name, base64Data })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          const newItem: GalleryItem = {
            id: 'g-' + Date.now(),
            url: data.url,
            caption: uploadCaption.trim() || 'Driving session highlight'
          };
          setGallery([newItem, ...gallery]);
          setUploadCaption('');
          showToast('success', 'Image uploaded successfully!');
        } else {
          showToast('error', data.message || 'Upload failed.');
        }
      } catch (err) {
        showToast('error', 'Connection error during image upload.');
      } finally {
        setIsUploading(false);
        // Reset file input
        e.target.value = '';
      }
    };
  };

  const handleDeleteGalleryItem = (id: string) => {
    setGallery(gallery.filter(item => item.id !== id));
  };

  const handleGalleryCaptionChange = (index: number, caption: string) => {
    const updated = [...gallery];
    updated[index] = { ...updated[index], caption };
    setGallery(updated);
  };

  const handleSaveGallery = async () => {
    setIsSavingGallery(true);
    localStorage.setItem('updrive_cache_gallery', JSON.stringify(gallery));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gallery)
      });
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          showToast('success', 'Gallery items saved to server!');
          setIsSavingGallery(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Server API offline, saved locally:", err);
    }
    showToast('success', 'Gallery items saved locally!');
    setIsSavingGallery(false);
  };

  // Reels management helpers
  const handleAddReel = () => {
    const newReel: InstagramReel = {
      id: 'reel-' + Date.now(),
      caption: 'New Instagram Reel success story! 🚗🔥',
      views: '10.5K views',
      imageUrl: '/assets/images/reel_parking_masterclass.png', // default
      reelUrl: 'https://www.instagram.com/updrive.official'
    };
    setReels([...reels, newReel]);
  };

  const handleDeleteReel = (id: string) => {
    setReels(reels.filter(r => r.id !== id));
  };

  const handleReelFieldChange = (index: number, field: keyof InstagramReel, value: any) => {
    const updated = [...reels];
    updated[index] = { ...updated[index], [field]: value };
    setReels(updated);
  };

  const handleSaveReels = async () => {
    setIsSavingReels(true);
    localStorage.setItem('updrive_cache_reels', JSON.stringify(reels));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const response = await fetch('/api/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reels)
      });
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          showToast('success', 'Instagram reels saved to server!');
          setIsSavingReels(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Server API offline, saved locally:", err);
    }
    showToast('success', 'Instagram reels saved locally!');
    setIsSavingReels(false);
  };

  const handleFetchReelCover = async (index: number, reelUrl: string) => {
    if (!reelUrl) {
      showToast('error', 'Please enter an Instagram Reel URL first.');
      return;
    }
    
    setIsFetchingCoverIdx(index);
    const token = localStorage.getItem('updrive_superadmin_token');
    
    try {
      const response = await fetch('/api/reels/fetch-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reelUrl })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        handleReelFieldChange(index, 'imageUrl', data.imageUrl);
        showToast('success', 'Instagram cover photo fetched successfully!');
      } else {
        showToast('error', data.message || 'Failed to fetch cover. Is the Reel public?');
      }
    } catch (err) {
      showToast('error', 'Connection error while fetching Instagram cover.');
    } finally {
      setIsFetchingCoverIdx(null);
    }
  };

  const handleUploadReelCover = async (e: React.ChangeEvent<HTMLInputElement>, reelIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReelCover(true);
    const token = localStorage.getItem('updrive_superadmin_token');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fileName: file.name, base64Data })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          handleReelFieldChange(reelIdx, 'imageUrl', data.url);
          showToast('success', 'Reel cover image uploaded!');
        } else {
          showToast('error', data.message || 'Cover upload failed.');
        }
      } catch (err) {
        showToast('error', 'Connection error during cover upload.');
      } finally {
        setIsUploadingReelCover(false);
      }
    };
  };

  // Hero management helpers
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: 'hero-' + Date.now(),
      badge: 'Master the Road',
      title: 'Got your License?\nDrive with Confidence.',
      subtitle: 'Don\'t let years of lying license hold you back. UpDrive helps you rebuild your driving skills.',
      imageUrl: '/assets/images/driving_instructor_student.jpg',
      btn1Text: 'View Pricing Plans',
      btn1Url: '#pricing',
      btn2Text: 'Check Our Rating',
      btn2Url: '#testimonials'
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const handleDeleteHeroSlide = (id: string) => {
    setHeroSlides(heroSlides.filter(h => h.id !== id));
  };

  const handleHeroFieldChange = (index: number, field: keyof HeroSlide, value: any) => {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], [field]: value };
    setHeroSlides(updated);
  };

  const handleSaveHero = async () => {
    setIsSavingHero(true);
    localStorage.setItem('updrive_cache_hero', JSON.stringify(heroSlides));
    const token = localStorage.getItem('updrive_superadmin_token');
    try {
      const response = await fetch('/api/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(heroSlides)
      });
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          showToast('success', 'Hero banner slides saved to server!');
          setIsSavingHero(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Server API offline, saved locally:", err);
    }
    showToast('success', 'Hero banner slides saved locally!');
    setIsSavingHero(false);
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>, slideIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHeroImage(true);
    const token = localStorage.getItem('updrive_superadmin_token');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fileName: file.name, base64Data })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          handleHeroFieldChange(slideIdx, 'imageUrl', data.url);
          showToast('success', 'Hero slide image uploaded!');
        } else {
          showToast('error', data.message || 'Hero image upload failed.');
        }
      } catch (err) {
        showToast('error', 'Connection error during hero image upload.');
      } finally {
        setIsUploadingHeroImage(false);
      }
    };
  };

  // Non-authenticated view (Login form)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-left selection:bg-blue-500 selection:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e293b,transparent_60%)] z-0" />
        <div className="bg-slate-850/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full relative z-10 space-y-6">
          
          {/* Logo / Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Superadmin Portal</h2>
            <p className="text-xs text-slate-400 font-medium">Log in to update courses, prices and media gallery.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center">
              {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/15 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Secure Log In'
              )}
            </button>
          </form>

          {/* Back button */}
          <div className="text-center pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              Return to Website
            </a>
          </div>

        </div>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="min-h-screen bg-slate-50 text-left font-sans antialiased text-slate-900 selection:bg-blue-500 selection:text-white relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {toastMessage.type === 'success' ? (
              <div className="p-1 rounded-full bg-emerald-550 text-white">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-red-550 text-white">
                <X className="h-4 w-4" />
              </div>
            )}
            <span className="text-xs font-bold">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Settings className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">UpDrive Control Panel</h1>
              <p className="text-slate-500 text-xxs font-bold uppercase tracking-wider">Dynamic Site Content Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs font-bold text-slate-655 hover:text-slate-905 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <Globe className="h-4 w-4" />
              Live Site
            </a>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:text-red-700 px-4 py-2 border border-red-100 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'courses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            Manage Course Packages
          </button>
          
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="h-4.5 w-4.5" />
            Manage Gallery Media
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reels'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="h-4.5 w-4.5" />
            Manage Instagram Reels
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hero'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            Manage Hero Banner
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoadingData ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 text-blue-650 animate-spin" />
            <span className="text-slate-500 text-sm font-semibold">Syncing database changes...</span>
          </div>
        ) : (
          <div>
            
            {/* Courses / Packages Management */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                
                {/* Section Info Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Practice Courses List</h3>
                    <p className="text-slate-500 text-xs">Configure the package items displayed under the dynamic location-based pricing section.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddPackage}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Course Pack
                    </button>
                    
                    <button
                      onClick={handleSaveCourses}
                      disabled={isSavingCourses}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2.5 px-4.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {isSavingCourses ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save All Packages
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Packages Grid/Accordion List */}
                <div className="space-y-6">
                  {packages.map((pkg, pkgIdx) => (
                    <div key={pkg.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-slate-350 transition-colors">
                      
                      {/* Card Header row with non-overlapping Delete Package */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                        <span className="inline-block px-2.5 py-1 text-xxs font-black text-blue-600 bg-blue-50 rounded-lg uppercase tracking-wider">
                          Course Package ID: {pkg.id}
                        </span>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-xs font-bold text-red-655 hover:text-red-750 px-3.5 py-1.5 border border-red-150 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                          title="Delete Package"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Package
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Package Info Inputs */}
                        <div className="md:col-span-7 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Available States / Locations</label>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {['kerala', 'karnataka', 'tamilnadu', 'telangana'].map(loc => {
                                  const isSelected = pkg.locations?.includes(loc) || false;
                                  return (
                                    <label
                                      key={loc}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer capitalize ${
                                        isSelected
                                          ? 'bg-blue-600 border-blue-600 text-white'
                                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          const currentLocs = pkg.locations || [];
                                          const updatedLocs = e.target.checked
                                            ? [...currentLocs, loc]
                                            : currentLocs.filter(l => l !== loc);
                                          handlePackageFieldChange(pkgIdx, 'locations', updatedLocs);
                                        }}
                                        className="sr-only"
                                      />
                                      {loc === 'tamilnadu' ? 'Tamil Nadu' : loc}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Package Duration Label</label>
                              <input
                                type="text"
                                value={pkg.duration}
                                onChange={(e) => handlePackageFieldChange(pkgIdx, 'duration', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Course / Class Name</label>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => handlePackageFieldChange(pkgIdx, 'name', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold focus:outline-none focus:border-blue-500 text-slate-900"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Promo Price (₹)</label>
                              <input
                                type="number"
                                value={pkg.promoPrice}
                                onChange={(e) => handlePackageFieldChange(pkgIdx, 'promoPrice', parseInt(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Original Price (₹)</label>
                              <input
                                type="number"
                                value={pkg.originalPrice}
                                onChange={(e) => handlePackageFieldChange(pkgIdx, 'originalPrice', parseInt(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Brief Description</label>
                            <textarea
                              rows={2}
                              value={pkg.description}
                              onChange={(e) => handlePackageFieldChange(pkgIdx, 'description', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none"
                            />
                          </div>
                        </div>

                        {/* Package Features list editing */}
                        <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 space-y-3 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xxs font-black text-slate-455 uppercase tracking-wider">Package Checklist / Features</span>
                            <button
                              onClick={() => handleAddFeature(pkgIdx)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              Add Feature
                            </button>
                          </div>

                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {pkg.features.map((feat, featIdx) => (
                              <div key={featIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={feat}
                                  onChange={(e) => handlePackageFeatureChange(pkgIdx, featIdx, e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xxs font-medium focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={() => handleDeleteFeature(pkgIdx, featIdx)}
                                  className="text-slate-400 hover:text-red-650 p-1 transition-colors cursor-pointer"
                                  title="Delete detail line"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveCourses}
                    disabled={isSavingCourses}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-8 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    {isSavingCourses ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" />
                        Save All Packages
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

            {/* Gallery Media Management */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                
                {/* Upload Image Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Upload New Gallery Item</h3>
                    <p className="text-slate-500 text-xs">Add photos of driving instruction practice, student license achievements, or school road trips.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-1.5">
                      <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Image Caption / Title *</label>
                      <input
                        type="text"
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="E.g., Priya Patel scoring perfect score on RTO H-track"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImage}
                        disabled={isUploading}
                        id="gallery-file-upload"
                        className="hidden"
                      />
                      <label
                        htmlFor="gallery-file-upload"
                        className={`w-full bg-slate-50 border-2 border-dashed border-slate-250 hover:border-blue-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isUploading ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading static file...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Choose Image & Upload
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Gallery List Header */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Gallery Grid Manager</h3>
                    <p className="text-slate-500 text-[11px]">Edit descriptions, review static links or delete entries.</p>
                  </div>
                  
                  <button
                    onClick={handleSaveGallery}
                    disabled={isSavingGallery}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2.5 px-4.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer self-start sm:self-center"
                  >
                    {isSavingGallery ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Gallery Captions
                      </>
                    )}
                  </button>
                </div>

                {/* Gallery Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                  {gallery.map((item, index) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:border-slate-350 transition-all flex flex-col justify-between">
                      {/* Image Preview */}
                      <div className="relative aspect-video bg-slate-900">
                        <img
                          src={item.url}
                          alt={item.caption}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Delete absolute tag */}
                        <button
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="absolute top-3 right-3 bg-red-600 hover:bg-red-750 text-white p-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-500/10"
                          title="Delete image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Text Input area */}
                      <div className="p-4 space-y-3 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider">Image Source Path</label>
                          <input
                            type="text"
                            value={item.url}
                            disabled
                            className="w-full bg-slate-50 border border-slate-150 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-500 truncate"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider">Caption / Title</label>
                          <textarea
                            rows={2}
                            value={item.caption}
                            onChange={(e) => handleGalleryCaptionChange(index, e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none leading-relaxed text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveGallery}
                    disabled={isSavingGallery}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-8 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    {isSavingGallery ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" />
                        Save Gallery Captions
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

            {/* Instagram Reels Management */}
            {activeTab === 'reels' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Instagram Reels List</h3>
                    <p className="text-slate-500 text-xs">Manage the featured vertical reels shown under the testimonials section on the frontend.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddReel}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Reel
                    </button>
                    
                    <button
                      onClick={handleSaveReels}
                      disabled={isSavingReels}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2.5 px-4.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {isSavingReels ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save All Reels
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {reels.map((reel, index) => (
                    <div key={reel.id} className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-xs hover:border-slate-350 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                        <span className="inline-block px-2.5 py-1 text-xxs font-black text-blue-600 bg-blue-50 rounded-lg uppercase tracking-wider">
                          Instagram Reel: {reel.id}
                        </span>
                        <button
                          onClick={() => handleDeleteReel(reel.id)}
                          className="text-xs font-bold text-red-655 hover:text-red-750 px-3.5 py-1.5 border border-red-150 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Reel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Instagram URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={reel.reelUrl}
                                  onChange={(e) => handleReelFieldChange(index, 'reelUrl', e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleFetchReelCover(index, reel.reelUrl)}
                                  disabled={isFetchingCoverIdx === index}
                                  className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold px-3 py-2 rounded-xl text-xxs border border-slate-200 hover:border-blue-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  {isFetchingCoverIdx === index ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Fetching...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3" />
                                      Auto-Fetch
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Views Label</label>
                              <input
                                type="text"
                                value={reel.views}
                                onChange={(e) => handleReelFieldChange(index, 'views', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Caption / Title</label>
                            <textarea
                              rows={2}
                              value={reel.caption}
                              onChange={(e) => handleReelFieldChange(index, 'caption', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between items-slate-stretch">
                          <div className="space-y-3">
                            <span className="block text-xxs font-black text-slate-455 uppercase tracking-wider">Cover Image</span>
                            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                              {reel.imageUrl ? (
                                <img src={reel.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xxs font-semibold">No Image Set</div>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Cover Image URL</label>
                              <input
                                type="text"
                                value={reel.imageUrl || ''}
                                onChange={(e) => handleReelFieldChange(index, 'imageUrl', e.target.value)}
                                placeholder="E.g., /uploads/image.jpg or https://..."
                                className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="pt-4">
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => { fileInputRefs.current[index] = el; }}
                              className="hidden"
                              onChange={(e) => handleUploadReelCover(e, index)}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[index]?.click()}
                              disabled={isUploadingReelCover}
                              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xxs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Upload className="h-3 w-3" />
                              Upload Custom Cover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveReels}
                    disabled={isSavingReels}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-8 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    {isSavingReels ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" />
                        Save All Reels
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Hero slides Management */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Hero Banner Slides</h3>
                    <p className="text-slate-500 text-xs">Configure hero slides. If you add more than 1 slide, the header banner will auto-cycle as a carousel (5 seconds per slide).</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddHeroSlide}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Slide
                    </button>
                    
                    <button
                      onClick={handleSaveHero}
                      disabled={isSavingHero}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2.5 px-4.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {isSavingHero ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Hero Slides
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {heroSlides.map((slide, index) => (
                    <div key={slide.id} className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-xs hover:border-slate-350 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                        <span className="inline-block px-2.5 py-1 text-xxs font-black text-blue-600 bg-blue-50 rounded-lg uppercase tracking-wider">
                          Hero Slide: {slide.id}
                        </span>
                        <button
                          onClick={() => handleDeleteHeroSlide(slide.id)}
                          className="text-xs font-bold text-red-655 hover:text-red-750 px-3.5 py-1.5 border border-red-150 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Slide
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Badge Tag</label>
                              <input
                                type="text"
                                value={slide.badge}
                                onChange={(e) => handleHeroFieldChange(index, 'badge', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Headline Title (use \n for line break)</label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => handleHeroFieldChange(index, 'title', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold focus:outline-none focus:border-blue-500 text-slate-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Paragraph Subtitle</label>
                            <textarea
                              rows={3}
                              value={slide.subtitle}
                              onChange={(e) => handleHeroFieldChange(index, 'subtitle', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                            {/* Button 1 */}
                            <div className="space-y-3">
                              <span className="block text-xxs font-black text-blue-650 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider self-start w-fit">Primary Button (Left)</span>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Button Label Text</label>
                                <input
                                  type="text"
                                  value={slide.btn1Text || ''}
                                  onChange={(e) => handleHeroFieldChange(index, 'btn1Text', e.target.value)}
                                  placeholder="E.g., View Pricing Plans"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Link URL or Section Target (e.g. #pricing)</label>
                                <input
                                  type="text"
                                  value={slide.btn1Url || ''}
                                  onChange={(e) => handleHeroFieldChange(index, 'btn1Url', e.target.value)}
                                  placeholder="E.g., #pricing or https://..."
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            {/* Button 2 */}
                            <div className="space-y-3">
                              <span className="block text-xxs font-black text-slate-650 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider self-start w-fit">Secondary Button (Right)</span>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Button Label Text</label>
                                <input
                                  type="text"
                                  value={slide.btn2Text || ''}
                                  onChange={(e) => handleHeroFieldChange(index, 'btn2Text', e.target.value)}
                                  placeholder="E.g., Check Our Rating"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Link URL or Section Target (e.g. #testimonials)</label>
                                <input
                                  type="text"
                                  value={slide.btn2Url || ''}
                                  onChange={(e) => handleHeroFieldChange(index, 'btn2Url', e.target.value)}
                                  placeholder="E.g., #testimonials or https://..."
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between items-stretch">
                          <div className="space-y-3">
                            <span className="block text-xxs font-black text-slate-455 uppercase tracking-wider">Visual Background Image</span>
                            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                              <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div className="pt-4">
                            <input
                              type="file"
                              accept="image/*"
                              id={`upload-hero-${slide.id}`}
                              className="hidden"
                              onChange={(e) => handleUploadHeroImage(e, index)}
                              disabled={isUploadingHeroImage}
                            />
                            <label
                              htmlFor={`upload-hero-${slide.id}`}
                              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xxs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Upload className="h-3 w-3" />
                              Upload Slide Image
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveHero}
                    disabled={isSavingHero}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-8 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    {isSavingHero ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" />
                        Save Hero Slides
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
