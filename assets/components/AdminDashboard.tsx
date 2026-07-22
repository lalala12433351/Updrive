import React, { useState, useEffect, useRef } from 'react';
import { Settings, Plus, Trash2, LogOut, Globe, Lock, FileText, Image as ImageIcon, Upload, Check, Loader2, Save, X, Play, Star, Briefcase, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { PricingPackage, Testimonial, JobOpening, BlogPost } from '../types';
import { GalleryItem } from './Gallery';
import { InstagramReel } from './Testimonials';
import { HeroSlide } from './Hero';
import { dataService } from '../services/dataService';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'gallery' | 'reels' | 'hero' | 'reviews' | 'jobs' | 'blog'>('home');
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Form saving states
  const [isSavingCourses, setIsSavingCourses] = useState<boolean>(false);
  const [isSavingGallery, setIsSavingGallery] = useState<boolean>(false);
  const [isSavingReels, setIsSavingReels] = useState<boolean>(false);
  const [isSavingHero, setIsSavingHero] = useState<boolean>(false);
  const [isSavingReviews, setIsSavingReviews] = useState<boolean>(false);
  const [isSavingJobs, setIsSavingJobs] = useState<boolean>(false);
  const [isSavingBlogs, setIsSavingBlogs] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFetchingCoverIdx, setIsFetchingCoverIdx] = useState<number | null>(null);

  // Uploading states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadingReelCover, setIsUploadingReelCover] = useState<boolean>(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  
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

    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const VALID_USER_PASS: Record<string, string[]> = {
      'libin': ['Libin123@', 'libin123@', '123456'],
      'suhaib': ['Assalamu123!@#', 'assalamu123!@#', '123456']
    };

    if (VALID_USER_PASS[cleanUser] && VALID_USER_PASS[cleanUser].includes(cleanPass)) {
      localStorage.setItem('updrive_superadmin_token', 'static-session-' + Date.now());
      setIsAuthenticated(true);
      fetchData();
      setIsLoggingIn(false);
      return;
    }

    setLoginError('Invalid username or password.');
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('updrive_superadmin_token');
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const courses = await dataService.getCourses();
      setPackages(courses);

      const galleryData = await dataService.getGallery();
      setGallery(galleryData);

      const reelsData = await dataService.getReels();
      setReels(reelsData);

      const heroData = await dataService.getHeroSlides();
      setHeroSlides(heroData);

      const reviewsData = await dataService.getReviews();
      setReviews(reviewsData);

      const jobsData = await dataService.getJobs();
      setJobs(jobsData);

      const blogsData = await dataService.getBlogs();
      setBlogs(blogsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('error', 'Failed to load database records.');
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
    try {
      const result = await dataService.saveCourses(packages);
      showToast('success', result.message || 'Pricing packages saved!');
    } catch (err) {
      showToast('error', 'Error saving course packages.');
    } finally {
      setIsSavingCourses(false);
    }
  };

  // Gallery management helpers
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadRes = await dataService.uploadImage(file.name, base64Data);
        if (uploadRes.success && uploadRes.url) {
          const newItem: GalleryItem = {
            id: 'g-' + Date.now(),
            url: uploadRes.url,
            caption: uploadCaption.trim() || 'Driving session highlight'
          };
          const updatedGallery = [newItem, ...gallery];
          setGallery(updatedGallery);
          await dataService.saveGallery(updatedGallery);
          setUploadCaption('');
          showToast('success', 'Image uploaded successfully!');
        } else {
          showToast('error', 'Upload failed.');
        }
      } catch (err) {
        showToast('error', 'Error during image upload.');
      } finally {
        setIsUploading(false);
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
    try {
      const result = await dataService.saveGallery(gallery);
      showToast('success', result.message || 'Gallery items saved!');
    } catch (err) {
      showToast('error', 'Error saving gallery media.');
    } finally {
      setIsSavingGallery(false);
    }
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
    try {
      const result = await dataService.saveReels(reels);
      showToast('success', result.message || 'Instagram reels saved!');
    } catch (err) {
      showToast('error', 'Error saving Instagram reels.');
    } finally {
      setIsSavingReels(false);
    }
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
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadRes = await dataService.uploadImage(file.name, base64Data);
        if (uploadRes.success && uploadRes.url) {
          handleReelFieldChange(reelIdx, 'imageUrl', uploadRes.url);
          showToast('success', 'Reel cover image updated!');
        } else {
          showToast('error', 'Cover upload failed.');
        }
      } catch (err) {
        showToast('error', 'Error during cover upload.');
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
    try {
      const result = await dataService.saveHeroSlides(heroSlides);
      showToast('success', result.message || 'Hero banner saved!');
    } catch (err) {
      showToast('error', 'Error saving hero slides.');
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>, slideIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHeroImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadRes = await dataService.uploadImage(file.name, base64Data);
        if (uploadRes.success && uploadRes.url) {
          handleHeroFieldChange(slideIdx, 'imageUrl', uploadRes.url);
          showToast('success', 'Hero image updated!');
        } else {
          showToast('error', 'Hero image upload failed.');
        }
      } catch (err) {
        showToast('error', 'Error during hero image upload.');
      } finally {
        setIsUploadingHeroImage(false);
      }
    };
  };
  // Reviews (Testimonials) management helpers
  const handleAddReview = () => {
    const newReview: Testimonial = {
      id: 't-' + Date.now(),
      stars: 5,
      text: 'The training class exceeded my expectations. Very professional team!',
      author: 'Aarav S.',
      avatarSeed: 'Aarav' + Date.now(),
      role: 'Confident Driver, Cochin'
    };
    setReviews([...reviews, newReview]);
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const handleReviewFieldChange = (index: number, field: keyof Testimonial, value: any) => {
    const updated = [...reviews];
    updated[index] = { ...updated[index], [field]: value };
    setReviews(updated);
  };

  const handleSaveReviews = async () => {
    setIsSavingReviews(true);
    try {
      const result = await dataService.saveReviews(reviews);
      showToast('success', result.message || 'Reviews saved successfully!');
    } catch (err) {
      showToast('error', 'Error saving reviews.');
    } finally {
      setIsSavingReviews(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>, reviewIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadRes = await dataService.uploadImage(file.name, base64Data);
        if (uploadRes.success && uploadRes.url) {
          handleReviewFieldChange(reviewIdx, 'avatarUrl', uploadRes.url);
          showToast('success', 'Profile photo uploaded!');
        } else {
          showToast('error', 'Profile photo upload failed.');
        }
      } catch (err) {
        showToast('error', 'Error during profile photo upload.');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
  };

  // Job openings management helpers
  const handleAddJob = () => {
    const newJob: JobOpening = {
      id: 'job-' + Date.now(),
      title: 'Professional Driving Instructor (Female)',
      location: 'Bangalore, Karnataka',
      type: 'Full-time / Part-time',
      description: 'We are seeking patient, well-mannered female driving instructors to train students on automatic and manual cars.',
      requirements: '- Valid License for at least 3 years\n- Patient and supportive communication skills',
      isActive: true
    };
    setJobs([...jobs, newJob]);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleJobFieldChange = (index: number, field: keyof JobOpening, value: any) => {
    const updated = [...jobs];
    updated[index] = { ...updated[index], [field]: value } as JobOpening;
    setJobs(updated);
  };

  const handleSaveJobs = async () => {
    setIsSavingJobs(true);
    try {
      const result = await dataService.saveJobs(jobs);
      showToast('success', result.message || 'Job openings saved successfully!');
    } catch (err) {
      showToast('error', 'Error saving job openings.');
    } finally {
      setIsSavingJobs(false);
    }
  };

  // Blog (SEO) management helpers
  const handleAddBlogPost = () => {
    const newId = 'blog-' + Date.now();
    const newPost: BlogPost = {
      id: newId,
      slug: 'new-blog-post-' + Date.now(),
      title: 'New Article Title',
      metaTitle: 'New Article Title | UpDrive',
      metaDescription: 'Read this dynamic new article from UpDrive.',
      coverImage: '',
      createdAt: new Date().toISOString().split('T')[0],
      isPublished: false,
      blocks: [
        { id: 'block-' + Date.now() + '-1', type: 'paragraph', content: 'Type your introduction paragraph here...' }
      ]
    };
    setBlogs([...blogs, newPost]);
    setEditingPostId(newId);
  };

  const handleDeleteBlogPost = (id: string) => {
    setBlogs(blogs.filter(b => b.id !== id));
  };

  const handleBlogFieldChange = (index: number, field: keyof BlogPost, value: any) => {
    const updated = [...blogs];
    updated[index] = { ...updated[index], [field]: value } as BlogPost;
    setBlogs(updated);
  };

  const handleAddBlogBlock = (postIndex: number, type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'list' | 'image' | 'video') => {
    const updated = [...blogs];
    const newBlock = {
      id: 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      content: type === 'list' ? '- Bullet point 1\n- Bullet point 2' : 'Enter block content...',
      mediaUrl: ''
    };
    updated[postIndex].blocks = [...updated[postIndex].blocks, newBlock];
    setBlogs(updated);
  };

  const handleAddBlogBlockAtIndex = (postIndex: number, insertIndex: number, type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'list' | 'image' | 'video') => {
    const updated = [...blogs];
    const newBlock = {
      id: 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      content: type === 'list' ? '- Bullet point 1\n- Bullet point 2' : 'Enter block content...',
      mediaUrl: ''
    };
    const currentBlocks = [...updated[postIndex].blocks];
    currentBlocks.splice(insertIndex, 0, newBlock);
    updated[postIndex].blocks = currentBlocks;
    setBlogs(updated);
  };

  const handleDeleteBlogBlock = (postIndex: number, blockIndex: number) => {
    const updated = [...blogs];
    updated[postIndex].blocks = updated[postIndex].blocks.filter((_, idx) => idx !== blockIndex);
    setBlogs(updated);
  };

  const handleBlogBlockFieldChange = (postIndex: number, blockIndex: number, field: 'content' | 'mediaUrl', value: string) => {
    const updated = [...blogs];
    const updatedBlocks = [...updated[postIndex].blocks];
    updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], [field]: value };
    updated[postIndex].blocks = updatedBlocks;
    setBlogs(updated);
  };

  const handleMoveBlogBlock = (postIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const updated = [...blogs];
    const blocks = [...updated[postIndex].blocks];
    if (direction === 'up' && blockIndex > 0) {
      const temp = blocks[blockIndex];
      blocks[blockIndex] = blocks[blockIndex - 1];
      blocks[blockIndex - 1] = temp;
    } else if (direction === 'down' && blockIndex < blocks.length - 1) {
      const temp = blocks[blockIndex];
      blocks[blockIndex] = blocks[blockIndex + 1];
      blocks[blockIndex + 1] = temp;
    }
    updated[postIndex].blocks = blocks;
    setBlogs(updated);
  };

  const handleUploadBlogMedia = async (e: React.ChangeEvent<HTMLInputElement>, postIndex: number, blockIndex: number | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadRes = await dataService.uploadImage(file.name, base64Data);
        if (uploadRes.success && uploadRes.url) {
          if (blockIndex === null) {
            handleBlogFieldChange(postIndex, 'coverImage', uploadRes.url);
          } else {
            handleBlogBlockFieldChange(postIndex, blockIndex, 'mediaUrl', uploadRes.url);
          }
          showToast('success', 'Media uploaded successfully!');
        } else {
          showToast('error', 'Media upload failed.');
        }
      } catch (err) {
        showToast('error', 'Error processing media file.');
      }
    };
  };

  const handleSaveBlogs = async () => {
    setIsSavingBlogs(true);
    try {
      const result = await dataService.saveBlogs(blogs);
      showToast('success', result.message || 'Blog posts saved successfully!');
    } catch (err) {
      showToast('error', 'Failed to save blog posts.');
    } finally {
      setIsSavingBlogs(false);
    }
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
        
        {/* Home Dashboard or Section Content */}
        {isLoadingData ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 text-blue-650 animate-spin" />
            <span className="text-slate-500 text-sm font-semibold">Syncing database changes...</span>
          </div>
        ) : activeTab === 'home' ? (
          /* ===== HOME DASHBOARD GRID ===== */
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome to UpDrive Dashboard</h2>
              <p className="text-slate-500 text-sm font-semibold max-w-lg mx-auto">Select a section below to manage your website content.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {/* Course Packages */}
              <button
                onClick={() => setActiveTab('courses')}
                className="group bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-6 text-left space-y-4 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">Course Packages</h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Manage pricing plans & driving course packages</p>
                </div>
              </button>

              {/* Gallery Media */}
              <button
                onClick={() => setActiveTab('gallery')}
                className="group bg-white border border-slate-200 hover:border-emerald-300 rounded-3xl p-6 text-left space-y-4 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center transition-colors">
                  <ImageIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">Gallery Media</h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Upload & manage photo gallery images</p>
                </div>
              </button>

              {/* Instagram Reels */}
              <button
                onClick={() => setActiveTab('reels')}
                className="group bg-white border border-slate-200 hover:border-pink-300 rounded-3xl p-6 text-left space-y-4 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-pink-50 group-hover:bg-pink-100 rounded-2xl flex items-center justify-center transition-colors">
                  <Play className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-pink-600 transition-colors">Instagram Reels</h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Manage Instagram reel embeds & covers</p>
                </div>
              </button>

              {/* Hero Banner */}
              <button
                onClick={() => setActiveTab('hero')}
                className="group bg-white border border-slate-200 hover:border-amber-300 rounded-3xl p-6 text-left space-y-4 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-amber-50 group-hover:bg-amber-100 rounded-2xl flex items-center justify-center transition-colors">
                  <Settings className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">Hero Banner</h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Edit hero slides, buttons & banners</p>
                </div>
              </button>

              {/* Reviews */}
              <button
                onClick={() => setActiveTab('reviews')}
                className="group bg-white border border-slate-200 hover:border-yellow-300 rounded-3xl p-6 text-left space-y-4 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-yellow-50 group-hover:bg-yellow-100 rounded-2xl flex items-center justify-center transition-colors">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-yellow-600 transition-colors">Reviews</h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Manage student testimonials & ratings</p>
                </div>
              </button>

              {/* Careers */}
              <button
                onClick={() => setActiveTab('jobs')}
                className="group bg-white border border-slate-200 hover:border-violet-300 rounded-3xl p-6 text-left space-y-4 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-violet-50 group-hover:bg-violet-100 rounded-2xl flex items-center justify-center transition-colors">
                  <Briefcase className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors">Careers</h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Post job openings & manage applications</p>
                </div>
              </button>

              {/* Blog / SEO */}
              <button
                onClick={() => setActiveTab('blog')}
                className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-6 text-left space-y-4 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center transition-colors">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Blog / SEO</h3>
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Write SEO blog posts with the Gutenberg editor</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* ===== SUB-SECTION CONTENT ===== */
          <div>
            {/* Back to Dashboard button */}
            <div className="mb-6">
              <button
                onClick={() => { setActiveTab('home'); setEditingPostId(null); }}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
              </button>
            </div>
            
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

            {/* Reviews (Testimonials) Management */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Customer Reviews & Testimonials</h3>
                    <p className="text-slate-500 text-xs">Manage the student success stories and star reviews displayed on the website.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddReview}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Review
                    </button>
                    
                    <button
                      onClick={handleSaveReviews}
                      disabled={isSavingReviews}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2.5 px-4.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {isSavingReviews ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save All Reviews
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div key={review.id} className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-xs hover:border-slate-350 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                        <span className="inline-block px-2.5 py-1 text-xxs font-black text-blue-600 bg-blue-50 rounded-lg uppercase tracking-wider">
                          Review Card: {review.id}
                        </span>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-xs font-bold text-red-655 hover:text-red-750 px-3.5 py-1.5 border border-red-150 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Review
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Author Name</label>
                              <input
                                type="text"
                                value={review.author}
                                onChange={(e) => handleReviewFieldChange(index, 'author', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Role / Location Info</label>
                              <input
                                type="text"
                                value={review.role || ''}
                                onChange={(e) => handleReviewFieldChange(index, 'role', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Star Rating (1 - 5)</label>
                              <select
                                value={review.stars}
                                onChange={(e) => handleReviewFieldChange(index, 'stars', parseInt(e.target.value) || 5)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 bg-white"
                              >
                                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                                <option value="3">⭐⭐⭐ (3 Stars)</option>
                                <option value="2">⭐⭐ (2 Stars)</option>
                                <option value="1">⭐ (1 Star)</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Review Message / Feedback</label>
                            <textarea
                              rows={3}
                              value={review.text}
                              onChange={(e) => handleReviewFieldChange(index, 'text', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-center items-center text-center space-y-3">
                          <span className="block text-xxs font-black text-slate-455 uppercase tracking-wider">Profile Photo</span>
                          
                          <div className="relative">
                            {review.avatarUrl ? (
                              <div className="relative">
                                <img
                                  src={review.avatarUrl}
                                  alt=""
                                  className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleReviewFieldChange(index, 'avatarUrl', '')}
                                  className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-750 text-white rounded-full p-1 transition-all cursor-pointer shadow-md"
                                  title="Remove Photo"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shadow-inner">
                                {review.author ? review.author.charAt(0) : 'U'}
                              </div>
                            )}
                          </div>

                          <div className="w-full">
                            <input
                              type="file"
                              accept="image/*"
                              id={`upload-avatar-${review.id}`}
                              className="hidden"
                              onChange={(e) => handleUploadAvatar(e, index)}
                              disabled={isUploadingAvatar}
                            />
                            <label
                              htmlFor={`upload-avatar-${review.id}`}
                              className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-[10px] cursor-pointer transition-colors"
                            >
                              <Upload className="h-3 w-3" />
                              {review.avatarUrl ? 'Change Photo' : 'Upload Photo'}
                            </label>
                          </div>
                          
                          <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                            {review.avatarUrl ? 'Custom Image Set' : 'Initials fallback active'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveReviews}
                    disabled={isSavingReviews}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-8 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    {isSavingReviews ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" />
                        Save All Reviews
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Careers (Job Openings) Management */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Careers & Job Openings</h3>
                    <p className="text-slate-500 text-xs">Manage active job openings, requirements, and listings on the Careers portal.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddJob}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Job Position
                    </button>
                    
                    <button
                      onClick={handleSaveJobs}
                      disabled={isSavingJobs}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2.5 px-4.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {isSavingJobs ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Careers Info
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {jobs.map((job, index) => (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-xs hover:border-slate-350 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-3 text-left">
                        <div className="flex items-center gap-3">
                          <span className="inline-block px-2.5 py-1 text-xxs font-black text-blue-600 bg-blue-50 rounded-lg uppercase tracking-wider">
                            Job ID: {job.id}
                          </span>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                            <input
                              type="checkbox"
                              checked={job.isActive}
                              onChange={(e) => handleJobFieldChange(index, 'isActive', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            Active Listing
                          </label>
                        </div>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-xs font-bold text-red-655 hover:text-red-750 px-3.5 py-1.5 border border-red-150 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Position
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Job Title *</label>
                            <input
                              type="text"
                              value={job.title}
                              onChange={(e) => handleJobFieldChange(index, 'title', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Location / Office *</label>
                            <input
                              type="text"
                              value={job.location}
                              onChange={(e) => handleJobFieldChange(index, 'location', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Job Type (e.g. Full-time) *</label>
                            <input
                              type="text"
                              value={job.type}
                              onChange={(e) => handleJobFieldChange(index, 'type', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Short Job Description</label>
                          <textarea
                            rows={2}
                            value={job.description}
                            onChange={(e) => handleJobFieldChange(index, 'description', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Requirements & Qualifications (use \n or bullet points)</label>
                          <textarea
                            rows={4}
                            value={job.requirements}
                            onChange={(e) => handleJobFieldChange(index, 'requirements', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveJobs}
                    disabled={isSavingJobs}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-8 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    {isSavingJobs ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" />
                        Save Careers Info
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Blog Posts (SEO) Management */}
            {activeTab === 'blog' && (
              <div className="space-y-6">
                
                {/* 1. WordPress style Posts Dashboard List (when not editing a post) */}
                {editingPostId === null ? (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">Posts</h3>
                          <button
                            onClick={handleAddBlogPost}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-650 font-bold py-1 px-3.5 rounded-xl text-xs border border-blue-150 transition-all cursor-pointer"
                          >
                            Add New Post
                          </button>
                        </div>
                        <p className="text-slate-500 text-xs">Manage blog posts, configure URLs, and write SEO content to rank on search engines.</p>
                      </div>
                      
                      <button
                        onClick={handleSaveBlogs}
                        disabled={isSavingBlogs}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer self-start sm:self-auto"
                      >
                        {isSavingBlogs ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save All Changes
                          </>
                        )}
                      </button>
                    </div>

                    {/* Blog Posts Table */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                      {blogs.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                          <p className="text-slate-500 font-semibold text-sm">No blog posts found.</p>
                          <button
                            onClick={handleAddBlogPost}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs cursor-pointer shadow-md"
                          >
                            Create Your First Post
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-xxs font-black text-slate-455 uppercase tracking-wider">
                                <th className="py-4 px-6">Title</th>
                                <th className="py-4 px-6">Slug</th>
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {blogs.map((post) => (
                                <tr key={post.id} className="hover:bg-slate-50/70 transition-colors group">
                                  <td className="py-4 px-6 font-bold text-slate-800 text-xs max-w-xs truncate">
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setEditingPostId(post.id)}>
                                        {post.title}
                                      </span>
                                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 mt-1.5 text-[10px] font-bold text-slate-400 transition-opacity">
                                        <button onClick={() => setEditingPostId(post.id)} className="text-blue-600 hover:underline">Edit</button>
                                        <span>|</span>
                                        <button onClick={() => handleDeleteBlogPost(post.id)} className="text-red-550 hover:underline">Trash</button>
                                        <span>|</span>
                                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-slate-550 hover:underline">View Post</a>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-xs font-semibold text-slate-500 max-w-[150px] truncate">
                                    /{post.slug}
                                  </td>
                                  <td className="py-4 px-6 text-xs text-slate-500">
                                    {post.createdAt}
                                  </td>
                                  <td className="py-4 px-6">
                                    {post.isPublished ? (
                                      <span className="inline-block px-2 py-0.5 text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-lg uppercase tracking-wider">
                                        Published
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2 py-0.5 text-[9px] font-black text-slate-500 bg-slate-100 rounded-lg uppercase tracking-wider">
                                        Draft
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <button
                                      onClick={() => setEditingPostId(post.id)}
                                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-4 rounded-xl text-xxs transition-colors cursor-pointer"
                                    >
                                      Edit Post
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  
                  /* 2. WordPress Gutenberg Editor Composer Workspace */
                  (() => {
                    const postIdx = blogs.findIndex(b => b.id === editingPostId);
                    if (postIdx === -1) {
                      setEditingPostId(null);
                      return null;
                    }
                    const post = blogs[postIdx];

                    return (
                      <div className="space-y-6 animate-fadeIn">
                        {/* Editor Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-3xl p-5 gap-4">
                          <button
                            onClick={() => setEditingPostId(null)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Posts
                          </button>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xxs font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg">
                              WordPress Gutenberg view
                            </span>
                            <button
                              onClick={handleSaveBlogs}
                              disabled={isSavingBlogs}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                            >
                              {isSavingBlogs ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save & Update
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Composer Split Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          
                          {/* Left Workspace: Gutenberg Block Editor Area (8 cols) */}
                          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
                            
                            {/* WordPress Title field */}
                            <input
                              type="text"
                              value={post.title}
                              onChange={(e) => handleBlogFieldChange(postIdx, 'title', e.target.value)}
                              placeholder="Add Title"
                              className="w-full text-3.5xl font-black tracking-tight text-slate-900 border-b border-transparent focus:border-slate-100 pb-3 focus:outline-none placeholder-slate-300"
                            />

                            {/* Blocks Stack container */}
                            <div className="space-y-2">
                              {post.blocks && post.blocks.map((block, blockIdx) => (
                                <div key={block.id} className="space-y-2">
                                  
                                  {/* Block container with WordPress-like Hover side controls */}
                                  <div className="group relative border border-transparent hover:border-slate-150 hover:bg-slate-50/20 rounded-2xl p-4 transition-all">
                                    
                                    {/* Left Gutter Floating Toolbar (Gutenberg style) */}
                                    <div className="absolute -left-3.5 top-3 flex-col gap-1 items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs hidden group-hover:flex z-10 transition-all">
                                      <button
                                        type="button"
                                        onClick={() => handleMoveBlogBlock(postIdx, blockIdx, 'up')}
                                        className="p-1 hover:text-blue-600 hover:bg-slate-50 text-[10px] rounded-md"
                                        title="Move Up"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveBlogBlock(postIdx, blockIdx, 'down')}
                                        className="p-1 hover:text-blue-600 hover:bg-slate-50 text-[10px] rounded-md"
                                        title="Move Down"
                                      >
                                        ▼
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteBlogBlock(postIdx, blockIdx)}
                                        className="p-1 text-red-500 hover:text-red-750 hover:bg-red-50 text-[9px] rounded-md border-t border-slate-100 mt-0.5"
                                        title="Delete block"
                                      >
                                        ✕
                                      </button>
                                    </div>

                                    {/* Block Content Inputs */}
                                    {['paragraph', 'h1', 'h2', 'h3', 'list'].includes(block.type) ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                          <span>{block.type} Block</span>
                                          {block.type === 'list' && <span>(bullets separated by newlines)</span>}
                                        </div>
                                        <textarea
                                          rows={block.type === 'paragraph' ? 3 : 1}
                                          value={block.content}
                                          onChange={(e) => handleBlogBlockFieldChange(postIdx, blockIdx, 'content', e.target.value)}
                                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-slate-200 p-0 text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none leading-relaxed text-xs sm:text-sm"
                                          placeholder={
                                            block.type === 'h1' ? 'Heading 1...' :
                                            block.type === 'h2' ? 'Heading 2...' :
                                            block.type === 'h3' ? 'Heading 3...' :
                                            block.type === 'list' ? '- Point 1\n- Point 2...' :
                                            'Start writing your text...'
                                          }
                                        />
                                      </div>
                                    ) : block.type === 'image' || block.type === 'video' ? (
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{block.type} Block</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                          <div className="sm:col-span-4 space-y-2">
                                            <input
                                              type="file"
                                              accept={block.type === 'image' ? 'image/*' : 'video/*'}
                                              id={`upload-gutenberg-${block.id}`}
                                              className="hidden"
                                              onChange={(e) => handleUploadBlogMedia(e, postIdx, blockIdx)}
                                            />
                                            <label
                                              htmlFor={`upload-gutenberg-${block.id}`}
                                              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xxs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xxs"
                                            >
                                              <Upload className="h-3.5 w-3.5" />
                                              {block.mediaUrl ? 'Replace File' : 'Upload File'}
                                            </label>
                                          </div>
                                          
                                          <div className="sm:col-span-8">
                                            <input
                                              type="text"
                                              value={block.content}
                                              onChange={(e) => handleBlogBlockFieldChange(postIdx, blockIdx, 'content', e.target.value)}
                                              className="w-full bg-transparent border-0 border-b border-slate-100 focus:border-blue-500 py-1 px-0 text-xs placeholder-slate-400 focus:ring-0 focus:outline-none font-medium"
                                              placeholder="Write caption / description (optional)"
                                            />
                                          </div>
                                        </div>

                                        {block.mediaUrl && (
                                          <div className="mt-2 max-w-[300px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                            {block.type === 'image' ? (
                                              <img src={block.mediaUrl} alt="" className="w-full h-auto object-cover max-h-[160px]" />
                                            ) : (
                                              <video src={block.mediaUrl} controls className="w-full max-h-[160px]" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>

                                  {/* Gutenberg style Inline Add block inserter (shows when hover between blocks) */}
                                  <div className="group/line relative py-1.5 flex items-center justify-center">
                                    <div className="absolute inset-x-0 h-px bg-slate-200/40 opacity-0 group-hover/line:opacity-100 transition-opacity" />
                                    <div className="opacity-0 group-hover/line:opacity-100 transition-opacity z-10 bg-white border border-slate-200 rounded-full p-1 shadow-sm flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'h1')}
                                        className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500"
                                        title="Add H1 Heading"
                                      >
                                        H1
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'paragraph')}
                                        className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500"
                                        title="Add Paragraph"
                                      >
                                        P
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'h2')}
                                        className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500"
                                        title="Add H2 Heading"
                                      >
                                        H2
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'list')}
                                        className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500"
                                        title="Add Bullet List"
                                      >
                                        •
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'image')}
                                        className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500"
                                        title="Add Photo"
                                      >
                                        📷
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>

                            {/* Append Block buttons at the end */}
                            <div className="border-t border-slate-100 pt-6 flex flex-wrap items-center justify-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Add Content block:</span>
                              <button
                                type="button"
                                onClick={() => handleAddBlogBlock(postIdx, 'h1')}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xxs cursor-pointer"
                              >
                                + Heading H1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddBlogBlock(postIdx, 'h2')}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xxs cursor-pointer"
                              >
                                + Heading H2
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddBlogBlock(postIdx, 'h3')}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xxs cursor-pointer"
                              >
                                + Heading H3
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddBlogBlock(postIdx, 'paragraph')}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xxs cursor-pointer"
                              >
                                + Paragraph
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddBlogBlock(postIdx, 'list')}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xxs cursor-pointer"
                              >
                                + Bullet List
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddBlogBlock(postIdx, 'image')}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xxs cursor-pointer"
                              >
                                + Add Image
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddBlogBlock(postIdx, 'video')}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xxs cursor-pointer"
                              >
                                + Add Video
                              </button>
                            </div>

                          </div>

                          {/* Right Workspace Sidebar: Document inspector & SEO panel (4 cols) */}
                          <div className="lg:col-span-4 space-y-6">
                            
                            {/* Panel 1: Document & Publish Options */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                              <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                                Document Status
                              </h4>

                              <div className="flex items-center justify-between">
                                <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">Publish Visibility</label>
                                <select
                                  value={post.isPublished ? 'published' : 'draft'}
                                  onChange={(e) => handleBlogFieldChange(postIdx, 'isPublished', e.target.value === 'published')}
                                  className="border border-slate-250 rounded-xl px-2.5 py-1 text-xxs font-bold text-slate-700 focus:outline-none"
                                >
                                  <option value="draft">Draft (Private)</option>
                                  <option value="published">Published (Public)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xxs font-black text-slate-455 uppercase tracking-wider block">Publish Date</label>
                                <input
                                  type="date"
                                  value={post.createdAt}
                                  onChange={(e) => handleBlogFieldChange(postIdx, 'createdAt', e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/50"
                                />
                              </div>
                            </div>

                            {/* Panel 2: Featured Image */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                              <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
                                Featured Image (Cover)
                              </h4>

                              <div className="space-y-3">
                                {post.coverImage ? (
                                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-50">
                                    <img
                                      src={post.coverImage}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleBlogFieldChange(postIdx, 'coverImage', '')}
                                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-750 text-white rounded-full p-1.5 cursor-pointer shadow-md transition-all"
                                      title="Remove Image"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 text-xs">
                                    No featured image set
                                  </div>
                                )}

                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`wp-cover-file-${post.id}`}
                                  className="hidden"
                                  onChange={(e) => handleUploadBlogMedia(e, postIdx, null)}
                                />
                                <label
                                  htmlFor={`wp-cover-file-${post.id}`}
                                  className="w-full bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xxs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xxs"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                  {post.coverImage ? 'Change Featured Image' : 'Select Featured Image'}
                                </label>
                              </div>
                            </div>

                            {/* Panel 3: SEO Configuration & Character limits check */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                              <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
                                RankMath SEO Inspector
                              </h4>

                              {/* Slug */}
                              <div className="space-y-1">
                                <label className="text-xxs font-black text-slate-455 uppercase tracking-wider block">Permalink / Slug *</label>
                                <input
                                  type="text"
                                  value={post.slug}
                                  onChange={(e) => handleBlogFieldChange(postIdx, 'slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''))}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                />
                                <div className="text-[10px] text-slate-400 font-bold break-all bg-slate-50 p-1.5 rounded-lg border border-slate-150">
                                  Url preview: <span className="text-blue-650">/blog/{post.slug}</span>
                                </div>
                              </div>

                              {/* Meta Title */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">SEO Title *</label>
                                  <span className={`text-[10px] font-bold ${
                                    post.metaTitle.length >= 45 && post.metaTitle.length <= 60
                                      ? 'text-emerald-600'
                                      : 'text-red-500'
                                  }`}>
                                    {post.metaTitle.length} / 60 chars
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={post.metaTitle}
                                  onChange={(e) => handleBlogFieldChange(postIdx, 'metaTitle', e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                  placeholder="SEO Meta Title"
                                />
                              </div>

                              {/* Meta Description */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <label className="text-xxs font-black text-slate-455 uppercase tracking-wider">SEO Description *</label>
                                  <span className={`text-[10px] font-bold ${
                                    post.metaDescription.length >= 120 && post.metaDescription.length <= 160
                                      ? 'text-emerald-600'
                                      : 'text-red-500'
                                  }`}>
                                    {post.metaDescription.length} / 160 chars
                                  </span>
                                </div>
                                <textarea
                                  rows={3}
                                  value={post.metaDescription}
                                  onChange={(e) => handleBlogFieldChange(postIdx, 'metaDescription', e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                                  placeholder="SEO Meta Description"
                                />
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
