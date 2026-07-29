import React, { useState, useEffect, useRef } from 'react';
import { Settings, Plus, Trash2, LogOut, Globe, Lock, FileText, Image as ImageIcon, Upload, Check, Loader2, Save, X, Play, Star, Briefcase, ArrowLeft, LayoutDashboard, Copy, MessageSquare, Award, ShieldAlert } from 'lucide-react';
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
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isFetchingCoverIdx, setIsFetchingCoverIdx] = useState<number | null>(null);

  // Blog Portal States & Debounced Autosave
  const [selectedSubTab, setSelectedSubTab] = useState<'editor' | 'comments' | 'analytics'>('editor');
  const [commentReplyText, setCommentReplyText] = useState<Record<string, string>>({});
  const [autosaveStatus, setAutosaveStatus] = useState<string>('');
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'writer'>('admin');
  const [activeBlockIdx, setActiveBlockIdx] = useState<number | null>(null);
  const [selectedCoursePkgId, setSelectedCoursePkgId] = useState<string | null>(null);

  // WordPress-like Editor Mock States
  const [classicMode, setClassicMode] = useState<boolean>(false);
  const [showInserter, setShowInserter] = useState<boolean>(false);
  const [inserterSearch, setInserterSearch] = useState<string>('');
  const [activeInserterCat, setActiveInserterCat] = useState<'Text' | 'Media' | 'Design' | 'Widgets' | 'Yoast'>('Text');
  const [collapsedPanels, setCollapsedPanels] = useState<Record<string, boolean>>({
    status: false,
    cover: false,
    seo: false,
    cats: true,
    author: true,
    related: true,
    notes: true
  });

  // Classic editor undo / redo stack references
  const classicUndoStack = React.useRef<string[]>([]);
  const classicRedoStack = React.useRef<string[]>([]);

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

  // Autosave blog draft changes dynamically
  useEffect(() => {
    if (editingPostId === null || blogs.length === 0) return;
    const postIdx = blogs.findIndex(b => b.id === editingPostId);
    if (postIdx === -1) return;

    setAutosaveStatus('Draft autosaving...');
    const timer = setTimeout(async () => {
      try {
        await dataService.saveBlogs(blogs);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setAutosaveStatus(`Saved at ${timeStr}`);
      } catch (err) {
        setAutosaveStatus('Autosave failed');
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(timer);
  }, [blogs, editingPostId]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
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
      'suhaib': ['Assalamu1', 'Assalamu123!@#', 'assalamu123!@#', '123456']
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
      if (courses.length > 0) {
        setSelectedCoursePkgId(prev => prev || courses[0].id);
      }

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
    setSelectedCoursePkgId(newPkg.id);
  };

  const handleDeletePackage = (id: string) => {
    const nextPkg = packages.find(p => p.id !== id);
    setPackages(packages.filter(p => p.id !== id));
    if (selectedCoursePkgId === id) {
      setSelectedCoursePkgId(nextPkg ? nextPkg.id : null);
    }
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
      status: 'draft',
      categories: ['Driving Tips'],
      category: 'Driving Tips',
      tags: ['Beginners'],
      views: 0,
      avgTimeOnPageSeconds: 0,
      likes: 0,
      shares: 0,
      bookingConversions: 0,
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

  const handleAddBlogBlock = (postIndex: number, type: string) => {
    const updated = [...blogs];
    let content = 'Enter block content...';
    if (type === 'list') {
      content = '- Bullet point 1\n- Bullet point 2';
    } else if (type === 'table') {
      content = 'Column 1 | Column 2\nRow 1 Cell 1 | Row 1 Cell 2\nRow 2 Cell 1 | Row 2 Cell 2';
    } else if (type === 'yoast-faq') {
      content = '[{"q":"Question 1","a":"Answer to question 1"}]';
    } else if (type === 'yoast-howto') {
      content = '{"title":"How to...","steps":["Step 1 details","Step 2 details"]}';
    } else if (type === 'yoast-toc') {
      content = 'Table of Contents (Heading Outline)';
    } else if (type === 'yoast-breadcrumbs') {
      content = 'Home / Blog / Article';
    } else if (type === 'yoast-reading-time') {
      content = 'Calculating reading time...';
    } else if (type === 'yoast-ai-summarize') {
      content = 'AI Summary placeholder...';
    } else if (type === 'separator') {
      content = '---';
    } else if (type === 'spacer') {
      content = '40';
    }
    const newBlock = {
      id: 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      content,
      mediaUrl: ''
    };
    updated[postIndex].blocks = [...updated[postIndex].blocks, newBlock];
    setBlogs(updated);
  };

  const handleAddBlogBlockAtIndex = (postIndex: number, insertIndex: number, type: string) => {
    const updated = [...blogs];
    let content = 'Enter block content...';
    if (type === 'list') {
      content = '- Bullet point 1\n- Bullet point 2';
    } else if (type === 'table') {
      content = 'Column 1 | Column 2\nRow 1 Cell 1 | Row 1 Cell 2\nRow 2 Cell 1 | Row 2 Cell 2';
    } else if (type === 'yoast-faq') {
      content = '[{"q":"Question 1","a":"Answer to question 1"}]';
    } else if (type === 'yoast-howto') {
      content = '{"title":"How to...","steps":["Step 1 details","Step 2 details"]}';
    } else if (type === 'yoast-toc') {
      content = 'Table of Contents (Heading Outline)';
    } else if (type === 'yoast-breadcrumbs') {
      content = 'Home / Blog / Article';
    } else if (type === 'yoast-reading-time') {
      content = 'Calculating reading time...';
    } else if (type === 'yoast-ai-summarize') {
      content = 'AI Summary placeholder...';
    } else if (type === 'separator') {
      content = '---';
    } else if (type === 'spacer') {
      content = '40';
    }
    const newBlock = {
      id: 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      content,
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

  const handleBlogBlockFieldChange = (postIndex: number, blockIndex: number, field: keyof import('../types').BlogBlock, value: any) => {
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

  const handleClassicTextChange = (postId: string, postIdx: number, value: string) => {
    const currentVal = blogs[postIdx].blocks[0]?.content || '';
    if (currentVal !== value) {
      classicUndoStack.current.push(currentVal);
      if (classicUndoStack.current.length > 50) {
        classicUndoStack.current.shift();
      }
      classicRedoStack.current = [];
    }
    handleBlogBlockFieldChange(postIdx, 0, 'content', value);
  };

  const handleClassicUndo = (postIdx: number) => {
    if (classicUndoStack.current.length > 0) {
      const prev = classicUndoStack.current.pop()!;
      const current = blogs[postIdx].blocks[0]?.content || '';
      classicRedoStack.current.push(current);
      handleBlogBlockFieldChange(postIdx, 0, 'content', prev);
      showToast('success', 'Undo successful');
    } else {
      showToast('info', 'Nothing to undo');
    }
  };

  const handleClassicRedo = (postIdx: number) => {
    if (classicRedoStack.current.length > 0) {
      const next = classicRedoStack.current.pop()!;
      const current = blogs[postIdx].blocks[0]?.content || '';
      classicUndoStack.current.push(current);
      handleBlogBlockFieldChange(postIdx, 0, 'content', next);
      showToast('success', 'Redo successful');
    } else {
      showToast('info', 'Nothing to redo');
    }
  };

  const applyClassicFormat = (postId: string, postIdx: number, formatType: string, extraVal?: string) => {
    const textarea = document.getElementById(`classic-textarea-${postId}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let formattedText = '';
    switch (formatType) {
      case 'bold':
        formattedText = `<strong>${selectedText || 'bold text'}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText || 'italic text'}</em>`;
        break;
      case 'quote':
        formattedText = `<blockquote>${selectedText || 'quote'}</blockquote>`;
        break;
      case 'bullet':
        formattedText = `<ul>\n  <li>${selectedText || 'list item'}</li>\n</ul>`;
        break;
      case 'number':
        formattedText = `<ol>\n  <li>${selectedText || 'list item'}</li>\n</ol>`;
        break;
      case 'align-left':
        formattedText = `<div style="text-align: left;">${selectedText || 'aligned text'}</div>`;
        break;
      case 'align-center':
        formattedText = `<div style="text-align: center;">${selectedText || 'aligned text'}</div>`;
        break;
      case 'align-right':
        formattedText = `<div style="text-align: right;">${selectedText || 'aligned text'}</div>`;
        break;
      case 'link':
        formattedText = `<a href="${extraVal || '#'}">${selectedText || 'link text'}</a>`;
        break;
      case 'unlink':
        formattedText = selectedText.replace(/<\/?a[^>]*>/g, '');
        break;
      case 'h1':
        formattedText = `<h1>${selectedText || 'Heading 1'}</h1>`;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText || 'Heading 2'}</h2>`;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText || 'Heading 3'}</h3>`;
        break;
      case 'blockquote':
        formattedText = `<blockquote>${selectedText || 'quote'}</blockquote>`;
        break;
      case 'paragraph':
        formattedText = `<p>${selectedText || 'paragraph text'}</p>`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = text.substring(0, start) + formattedText + text.substring(end);
    handleClassicTextChange(postId, postIdx, newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 50);
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
            if (classicMode && blockIndex === 0) {
              const textarea = document.getElementById(`classic-textarea-${blogs[postIndex].id}`) as HTMLTextAreaElement;
              if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                const imgTag = `<img src="${uploadRes.url}" alt="${file.name}" style="max-width:100%;height:auto;margin:12px 0;" />`;
                const newContent = text.substring(0, start) + imgTag + text.substring(end);
                handleClassicTextChange(blogs[postIndex].id, postIndex, newContent);
                showToast('success', 'Image inserted into editor!');
                return;
              }
            }
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
                  <p className="text-xxs text-slate-500 font-semibold mt-1">Write SEO blog posts with the block editor</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* ===== SUB-SECTION CONTENT ===== */
          <div>
            {/* Back to Dashboard button */}
            {editingPostId === null && (
              <div className="mb-6">
                <button
                  onClick={() => { setActiveTab('home'); setEditingPostId(null); }}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Dashboard
                </button>
              </div>
            )}
            
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

                {/* Course Selector Slider Tabs */}
                {packages.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-100 scrollbar-none">
                    {packages.map((p) => {
                      const isActive = selectedCoursePkgId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedCoursePkgId(p.id)}
                          className={`shrink-0 px-4.5 py-2.5 rounded-2xl text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xxs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {p.name || 'Unnamed Package'} {p.isPopular ? '★' : ''}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Packages Grid/Accordion List */}
                <div className="space-y-6">
                  {packages.map((pkg, pkgIdx) => {
                    if (selectedCoursePkgId && pkg.id !== selectedCoursePkgId) return null;
                    return (
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

                          {/* Highlight as Top Card Switch / Slider */}
                          <div className="flex items-center justify-between bg-slate-50/50 border border-slate-150 p-4.5 rounded-2xl shadow-xxs">
                            <div className="space-y-0.5 text-left">
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Highlight as Top Card</span>
                              <span className="text-[9px] text-slate-400 font-bold block max-w-sm">Featured as the "Most Popular" plan with highlighted badge on the website</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pkg.isPopular || false}
                                onChange={(e) => handlePackageFieldChange(pkgIdx, 'isPopular', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
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
                  );
                })}
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
                {/* 1. WordPress style Posts Sub-Tab Headers (when not in editor) */}
                {editingPostId === null && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 gap-2">
                    <div className="flex flex-wrap">
                      <button
                        onClick={() => setSelectedSubTab('editor')}
                        className={`py-2.5 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedSubTab === 'editor'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                        All Posts ({blogs.length})
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('comments')}
                        className={`py-2.5 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedSubTab === 'comments'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Comments Queue ({blogs.flatMap(b => b.comments || []).filter(c => !c.isApproved).length} Pending)
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('analytics')}
                        className={`py-2.5 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedSubTab === 'analytics'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Award className="h-4 w-4" />
                        Traffic & Conversion Stats
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 pb-2 sm:pb-0 px-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Role:</span>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as 'admin' | 'editor' | 'writer')}
                        className="border border-slate-200 rounded-xl px-2.5 py-1 text-xxs font-extrabold text-slate-700 bg-white focus:outline-none"
                      >
                        <option value="admin">Administrator (Full Access)</option>
                        <option value="editor">Editor (Reviews & Publish)</option>
                        <option value="writer">Writer (Draft Only)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ===== SUB-TAB 1: POSTS LISTING ===== */}
                {editingPostId === null && selectedSubTab === 'editor' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">Articles Feed</h3>
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
                                <th className="py-4 px-6">SEO Score</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {blogs.map((post) => {
                                const keyword = (post.focusKeyword || '').toLowerCase().trim();
                                let score = 20;
                                if (keyword) {
                                  if (post.title.toLowerCase().includes(keyword)) score += 20;
                                  if (post.slug.toLowerCase().includes(keyword)) score += 20;
                                  if (post.metaDescription.toLowerCase().includes(keyword)) score += 20;
                                  if (post.metaDescription.length >= 120 && post.metaDescription.length <= 160) score += 20;
                                } else {
                                  score = 50;
                                }

                                return (
                                  <tr key={post.id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="py-4 px-6 font-bold text-slate-800 text-xs max-w-xs truncate">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                          {post.isPinned && <span className="text-[10px] text-amber-500 bg-amber-50 border border-amber-150 px-1.5 py-0.5 rounded font-black">PINNED</span>}
                                          <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setEditingPostId(post.id)}>
                                            {post.title}
                                          </span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 mt-1.5 text-[10px] font-bold text-slate-400 transition-opacity">
                                          <button onClick={() => setEditingPostId(post.id)} className="text-blue-600 hover:underline">Edit</button>
                                          <span>|</span>
                                          <button 
                                            disabled={userRole === 'writer'} 
                                            onClick={() => handleDeleteBlogPost(post.id)} 
                                            className="text-red-550 hover:underline disabled:text-slate-300 disabled:no-underline"
                                          >
                                            Trash
                                          </button>
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
                                      <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider ${
                                        post.status === 'published' ? 'text-emerald-600 bg-emerald-50' :
                                        post.status === 'scheduled' ? 'text-blue-600 bg-blue-50' :
                                        post.status === 'archived' ? 'text-amber-600 bg-amber-50' :
                                        'text-slate-500 bg-slate-100'
                                      }`}>
                                        {post.status || 'draft'}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                          <div className={`h-full ${score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-700">{score}/100</span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <button
                                        onClick={() => setEditingPostId(post.id)}
                                        className="bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-4 rounded-xl text-xxs transition-colors cursor-pointer"
                                      >
                                        Edit Post
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== SUB-TAB 2: COMMENTS MODERATION QUEUE ===== */}
                {editingPostId === null && selectedSubTab === 'comments' && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
                    <div className="space-y-1 text-left">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Comment Moderation Queue</h3>
                      <p className="text-slate-500 text-xs">Approve new reader submissions, reply directly as admin, or delete spam comments.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xxs font-black text-slate-455 uppercase tracking-wider">
                            <th className="py-3 px-6">Commenter</th>
                            <th className="py-3 px-6">Content</th>
                            <th className="py-3 px-6">On Article</th>
                            <th className="py-3 px-6">Date</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {blogs.flatMap((post, postIdx) => 
                            (post.comments || []).map((comm) => ({ ...comm, post, postIdx }))
                          ).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                No comments found.
                              </td>
                            </tr>
                          ) : (
                            blogs.flatMap((post, postIdx) => 
                              (post.comments || []).map((comm, commIdx) => {
                                return (
                                  <tr key={comm.id} className="hover:bg-slate-50/50 transition-colors text-xs font-medium text-slate-600">
                                    <td className="py-4 px-6">
                                      <div className="font-extrabold text-slate-900">{comm.authorName}</div>
                                      <div className="text-[10px] text-slate-400">{comm.authorEmail || 'No Email'}</div>
                                    </td>
                                    <td className="py-4 px-6 max-w-sm text-left">
                                      <p className="leading-relaxed">{comm.content}</p>
                                      {comm.adminReplies && comm.adminReplies.length > 0 && (
                                        <div className="mt-2 space-y-1.5">
                                          {comm.adminReplies.map(rep => (
                                            <div key={rep.id} className="bg-blue-50/50 p-2 rounded-lg border-l-2 border-blue-450 text-[11px]">
                                              <span className="font-bold text-blue-650">Admin: </span>{rep.content}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {/* Inline admin reply dialog */}
                                      <div className="mt-2 flex gap-1.5">
                                        <input
                                          type="text"
                                          value={commentReplyText[comm.id] || ''}
                                          onChange={(e) => setCommentReplyText({ ...commentReplyText, [comm.id]: e.target.value })}
                                          placeholder="Type admin reply..."
                                          className="flex-grow border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] focus:outline-none"
                                        />
                                        <button
                                          onClick={async () => {
                                            const replyVal = commentReplyText[comm.id];
                                            if (!replyVal || !replyVal.trim()) return;
                                            
                                            const newReply = {
                                              id: 'reply-' + Date.now(),
                                              adminName: 'UpDrive Admin',
                                              content: replyVal,
                                              createdAt: new Date().toISOString().split('T')[0]
                                            };
                                            
                                            const postBlogs = [...blogs];
                                            const targetPost = postBlogs[comm.postIdx];
                                            const targetComment = targetPost.comments?.[commIdx];
                                            if (targetComment) {
                                              targetComment.adminReplies = [...(targetComment.adminReplies || []), newReply];
                                              targetComment.isApproved = true; // Auto approve if admin replies
                                            }
                                            
                                            setBlogs(postBlogs);
                                            await dataService.saveBlogs(postBlogs);
                                            setCommentReplyText({ ...commentReplyText, [comm.id]: '' });
                                            showToast('success', 'Admin reply posted!');
                                          }}
                                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-2.5 rounded-lg text-[9px] cursor-pointer"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-slate-800 max-w-[150px] truncate">
                                      {comm.post.title}
                                    </td>
                                    <td className="py-4 px-6 text-slate-400">
                                      {comm.createdAt}
                                    </td>
                                    <td className="py-4 px-6 text-right space-y-1">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {!comm.isApproved ? (
                                          <button
                                            onClick={async () => {
                                              const postBlogs = [...blogs];
                                              const targetComment = postBlogs[comm.postIdx].comments?.[commIdx];
                                              if (targetComment) targetComment.isApproved = true;
                                              setBlogs(postBlogs);
                                              await dataService.saveBlogs(postBlogs);
                                              showToast('success', 'Comment Approved!');
                                            }}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-md text-[10px] cursor-pointer"
                                          >
                                            Approve
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-emerald-600 font-bold">Approved</span>
                                        )}
                                        <button
                                          onClick={async () => {
                                            const postBlogs = [...blogs];
                                            postBlogs[comm.postIdx].comments = postBlogs[comm.postIdx].comments?.filter(c => c.id !== comm.id);
                                            setBlogs(postBlogs);
                                            await dataService.saveBlogs(postBlogs);
                                            showToast('success', 'Comment Deleted.');
                                          }}
                                          className="bg-red-50 hover:bg-red-100 text-red-650 font-bold px-2 py-1 rounded-md text-[10px] cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ===== SUB-TAB 3: TRAFFIC & CONVERSIONS ANALYTICS ===== */}
                {editingPostId === null && selectedSubTab === 'analytics' && (
                  <div className="space-y-6 animate-fadeIn text-left">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Blog Insights & Traffic Conversion</h3>
                        <p className="text-slate-500 text-xs">Verify page performance, subscriber signups, and average reading time metrics.</p>
                      </div>
                      <span className="text-xxs font-black text-indigo-650 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-xl">Real-time Analytics Engine</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-1 shadow-xxs">
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Total Blog Views</span>
                        <h4 className="text-2xl font-black text-slate-900">{blogs.reduce((acc, b) => acc + (b.views || 0), 0)}</h4>
                        <p className="text-[10px] text-emerald-650 font-bold uppercase tracking-wider">▲ 14% growth this month</p>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-1 shadow-xxs">
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Avg Time on Page</span>
                        <h4 className="text-2xl font-black text-slate-900">
                          {blogs.length > 0 ? Math.round(blogs.reduce((acc, b) => acc + (b.avgTimeOnPageSeconds || 45), 0) / blogs.length) : 0}s
                        </h4>
                        <p className="text-[10px] text-emerald-650 font-bold uppercase tracking-wider">▲ 24s above industry average</p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-1 shadow-xxs">
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Post-to-Booking Conversions</span>
                        <h4 className="text-2xl font-black text-slate-900">{blogs.reduce((acc, b) => acc + (b.bookingConversions || 0), 0)}</h4>
                        <p className="text-[10px] text-emerald-650 font-bold uppercase tracking-wider">▲ 8% conversion rate</p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-1 shadow-xxs">
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Newsletter Subscribers</span>
                        <h4 className="text-2xl font-black text-slate-900">1,245</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Synced from active list</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Top Performing Posts</h4>
                        <div className="space-y-3.5 text-left">
                          {blogs.slice(0, 3).map((post, i) => (
                            <div key={post.id} className="flex items-center justify-between text-xs font-semibold">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-slate-800">{post.title}</span>
                                <p className="text-[10px] text-slate-400">/{post.slug}</p>
                              </div>
                              <div className="text-right shrink-0 pl-4">
                                <p className="font-extrabold text-slate-900">{post.views || 0} views</p>
                                <span className="text-[10px] text-emerald-600 font-bold">{post.bookingConversions || 0} bookings</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Traffic Channels</h4>
                        <div className="space-y-4 pt-1">
                          <div className="space-y-1 text-xxs font-bold">
                            <div className="flex justify-between">
                              <span className="text-slate-500 uppercase tracking-wider">Organic Google Search</span>
                              <span className="text-slate-700">54%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full" style={{ width: '54%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-xxs font-bold">
                            <div className="flex justify-between">
                              <span className="text-slate-500 uppercase tracking-wider">Direct Access</span>
                              <span className="text-slate-700">30%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: '30%' }}></div>
                            </div>
                          </div>

                          <div className="space-y-1 text-xxs font-bold">
                            <div className="flex justify-between">
                              <span className="text-slate-500 uppercase tracking-wider">Social / Instagram Referral</span>
                              <span className="text-slate-700">16%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-pink-500 h-full" style={{ width: '16%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {editingPostId !== null && (
                  
                  /* 2. WordPress Gutenberg Editor Composer Workspace */
                  (() => {
                    const postIdx = blogs.findIndex(b => b.id === editingPostId);
                    if (postIdx === -1) {
                      setEditingPostId(null);
                      return null;
                    }
                    const post = blogs[postIdx];
                    return (
                      <div className="space-y-6 animate-fadeIn text-left">

                        {/* 2. Page Title / Breadcrumbs Header Row */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6 font-sans text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('home');
                                setEditingPostId(null);
                              }}
                              className="hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              Dashboard
                            </button>
                            <span className="text-slate-350">/</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPostId(null);
                                setSelectedSubTab('editor');
                              }}
                              className="hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              Blog
                            </button>
                            <span className="text-slate-350">/</span>
                            <span className="text-slate-800 font-black truncate max-w-[200px] sm:max-w-xs">
                              {post.title || 'Untitled Post'}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPostId(null);
                            }}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-1 px-2.5 rounded-lg text-xxs transition-all shadow-xxs cursor-pointer flex items-center gap-1"
                          >
                            <ArrowLeft className="h-3 w-3" />
                            Back to Pages List
                          </button>
                        </div>

                        {/* 3. Success Notice alert bar */}
                        {post.status === 'published' && (
                          <div className="bg-white border-l-4 border-emerald-500 p-3.5 flex items-center justify-between shadow-xxs rounded-r-xl border border-slate-200 mb-4 font-sans">
                            <span className="text-xs font-semibold text-slate-700">
                              Page published successfully. <button onClick={() => {
                                const w = window.open('', '_blank');
                                if (w) {
                                  w.document.write(`<title>${post.title}</title><body style="font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px;"><h1>${post.title}</h1><pre style="white-space:pre-wrap;font-family:inherit;font-size:16px;">${post.blocks.map(b => b.content).join('\n\n')}</pre></body>`);
                                }
                              }} className="underline text-[#2271b1] hover:text-blue-800 cursor-pointer">View Page</button>
                            </span>
                            <button
                              type="button"
                              onClick={() => showToast('success', 'Notice closed')}
                              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {/* 4. Editor Main Workspace Grid */}
                        <div className="w-full font-sans">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                            
                            {/* Editor Column (8 cols) */}
                            <div className="lg:col-span-8 space-y-4 w-full">
                              
                              {/* Title Block */}
                              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs">
                                <input
                                  type="text"
                                  value={post.title}
                                  onChange={(e) => handleBlogFieldChange(postIdx, 'title', e.target.value)}
                                  placeholder="Add title"
                                  className="w-full text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 border-0 border-b border-transparent focus:border-slate-100 pb-2 focus:outline-none placeholder-slate-400 focus:ring-0"
                                />
                                <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                                  <strong>Permalink:</strong>
                                  <span className="text-slate-400 font-mono">mysite.com/blog/</span>
                                  <input
                                    type="text"
                                    value={post.slug}
                                    onChange={(e) => handleBlogFieldChange(postIdx, 'slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                    className="border border-slate-200 rounded px-1.5 py-0.5 text-xxs font-mono focus:outline-none focus:border-blue-500 bg-slate-50 w-36"
                                  />
                                </div>
                              </div>

                              {/* Excerpt Summary Card */}
                              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Excerpt / Excerpt Summary</label>
                                <textarea
                                  rows={2}
                                  value={post.excerpt || ''}
                                  onChange={(e) => handleBlogFieldChange(postIdx, 'excerpt', e.target.value)}
                                  placeholder="Write a short summary teaser teaser teaser..."
                                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 leading-relaxed resize-none focus:ring-0"
                                />
                              </div>

                              {/* Gutenberg Style Block Toolbar */}
                              <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-wrap items-center gap-2 shadow-xxs">
                                <button
                                  type="button"
                                  onClick={() => setShowInserter(true)}
                                  className="bg-[#1d2327] hover:bg-[#2271b1] text-white w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                                  title="Add block"
                                >
                                  ＋
                                </button>
                                <div className="w-px h-5 bg-slate-200 mx-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddBlogBlock(postIdx, 'paragraph');
                                    showToast('success', 'Paragraph block added!');
                                  }}
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-1 px-2.5 rounded-lg text-xxs flex items-center gap-1 cursor-pointer"
                                >
                                  ¶ Paragraph
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddBlogBlock(postIdx, 'h2');
                                    showToast('success', 'Heading block added!');
                                  }}
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-1 px-2.5 rounded-lg text-xxs flex items-center gap-1 cursor-pointer"
                                >
                                  🔖 Heading
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddBlogBlock(postIdx, 'list');
                                    showToast('success', 'List block added!');
                                  }}
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-1 px-2.5 rounded-lg text-xxs flex items-center gap-1 cursor-pointer"
                                >
                                  ≣ List
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddBlogBlock(postIdx, 'image');
                                    showToast('success', 'Image block added!');
                                  }}
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-1 px-2.5 rounded-lg text-xxs flex items-center gap-1 cursor-pointer"
                                >
                                  🖼 Image
                                </button>
                                
                                <div className="w-px h-5 bg-slate-200 mx-1 ml-auto" />
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Classic mode toggle
                                    if (classicMode) {
                                      // Switching from Classic to Block: split content by newlines
                                      const firstBlock = post.blocks[0];
                                      const textContent = firstBlock ? firstBlock.content : '';
                                      const paragraphs = textContent.split('\n\n').filter(Boolean);
                                      const newBlocks = paragraphs.map((text, idx) => ({
                                        id: 'block-split-' + Date.now() + '-' + idx,
                                        type: text.startsWith('## ') ? 'h2' : text.startsWith('# ') ? 'h1' : 'paragraph',
                                        content: text.replace(/^#\s+/, '').replace(/^##\s+/, ''),
                                        mediaUrl: ''
                                      }));
                                      handleBlogFieldChange(postIdx, 'blocks', newBlocks.length > 0 ? newBlocks : [{
                                        id: 'block-default-' + Date.now(),
                                        type: 'paragraph',
                                        content: '',
                                        mediaUrl: ''
                                      }]);
                                      setClassicMode(false);
                                      showToast('success', 'Switched to Gutenberg Block Editor mode!');
                                    } else {
                                      // Switching from Block to Classic: join block contents
                                      const combinedText = post.blocks.map(b => {
                                        if (b.type === 'h1') return `# ${b.content}`;
                                        if (b.type === 'h2') return `## ${b.content}`;
                                        return b.content;
                                      }).join('\n\n');
                                      const classicBlock = {
                                        id: 'block-classic-' + Date.now(),
                                        type: 'paragraph',
                                        content: combinedText,
                                        mediaUrl: ''
                                      };
                                      handleBlogFieldChange(postIdx, 'blocks', [classicBlock]);
                                      setClassicMode(true);
                                      showToast('success', 'Switched to Classic WYSIWYG Editor mode!');
                                    }
                                  }}
                                  className="text-[#2271b1] hover:underline text-xxs font-semibold cursor-pointer"
                                >
                                  {classicMode ? 'Switch to Block Editor' : 'Switch to Classic Editor'}
                                </button>
                              </div>

                              {/* Editor Main Canvas Body */}
                              {!classicMode ? (
                                
                                /* Gutenberg Block Mode Canvas */
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 min-h-[420px] space-y-4">
                                  {post.blocks.length === 0 ? (
                                    <div className="text-center text-slate-400 text-xs py-16">
                                      This page is empty. Use the ＋ button above to add your first block.
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {post.blocks.map((block, blockIdx) => (
                                        <div key={block.id} className="space-y-2">
                                          
                                          {/* Individual Gutenberg Block */}
                                          <div 
                                            onClick={() => setActiveBlockIdx(blockIdx)}
                                            className={`group relative border rounded-2xl p-4 transition-all ${
                                              activeBlockIdx === blockIdx 
                                                ? 'border-blue-500 bg-blue-50/5 shadow-xs' 
                                                : 'border-transparent hover:border-slate-200 hover:bg-slate-50/10'
                                            }`}
                                          >
                                            
                                            {/* Floating Mini Inline Format Bar */}
                                            {activeBlockIdx === blockIdx && ['paragraph', 'h1', 'h2', 'h3', 'list', 'quote', 'code'].includes(block.type) && (
                                              <div className="absolute -top-7 left-4 bg-slate-900 border border-slate-950 text-white rounded-xl px-2.5 py-1 shadow-md flex items-center gap-2 z-20 animate-fadeIn text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-slate-400 border-r border-slate-700 pr-2">{block.type}</span>
                                                <div className="flex items-center gap-1">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const nextAlign = block.align === 'left' ? 'center' : block.align === 'center' ? 'right' : 'left';
                                                      handleBlogBlockFieldChange(postIdx, blockIdx, 'align', nextAlign);
                                                    }}
                                                    className="hover:text-blue-400 px-1 py-0.5 rounded cursor-pointer transition-colors"
                                                    title="Toggle text alignment (Left / Center / Right)"
                                                  >
                                                    Align: {block.align || 'Left'}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const nextWeight = block.fontWeight === 'bold' ? 'normal' : 'bold';
                                                      handleBlogBlockFieldChange(postIdx, blockIdx, 'fontWeight', nextWeight);
                                                    }}
                                                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors font-bold ${
                                                      block.fontWeight === 'bold' ? 'text-blue-400 bg-slate-800' : 'hover:text-blue-400'
                                                    }`}
                                                    title="Bold text toggle"
                                                  >
                                                    B
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const nextStyle = block.fontStyle === 'italic' ? 'normal' : 'italic';
                                                      handleBlogBlockFieldChange(postIdx, blockIdx, 'fontStyle', nextStyle);
                                                    }}
                                                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors italic ${
                                                      block.fontStyle === 'italic' ? 'text-blue-400 bg-slate-800' : 'hover:text-blue-400'
                                                    }`}
                                                    title="Italic text toggle"
                                                  >
                                                    I
                                                  </button>
                                                </div>
                                              </div>
                                            )}

                                            {/* Gutenberg Left Gutter Hover Controls */}
                                            <div className="absolute -left-3 top-3.5 flex-col gap-1 items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs hidden group-hover:flex z-10 transition-all">
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleMoveBlogBlock(postIdx, blockIdx, 'up'); }}
                                                className="p-1 hover:text-blue-650 hover:bg-slate-50 text-[9px] rounded-md font-black cursor-pointer"
                                                title="Move Up"
                                              >
                                                ↑
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleMoveBlogBlock(postIdx, blockIdx, 'down'); }}
                                                className="p-1 hover:text-blue-650 hover:bg-slate-50 text-[9px] rounded-md font-black cursor-pointer"
                                                title="Move Down"
                                              >
                                                ↓
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteBlogBlock(postIdx, blockIdx); }}
                                                className="p-1 text-red-500 hover:text-red-750 hover:bg-red-50 text-[9px] rounded-md border-t border-slate-100 mt-0.5 font-black cursor-pointer"
                                                title="Delete block"
                                              >
                                                ✕
                                              </button>
                                            </div>

                                            {/* Render Block Content */}
                                            {['paragraph', 'h1', 'h2', 'h3', 'list', 'quote', 'code'].includes(block.type) ? (
                                              (() => {
                                                const customStyles: React.CSSProperties = {};
                                                if (block.textColor) customStyles.color = block.textColor;
                                                if (block.backgroundColor) customStyles.backgroundColor = block.backgroundColor;
                                                if (block.align) customStyles.textAlign = block.align;
                                                if (block.fontWeight) customStyles.fontWeight = block.fontWeight;
                                                if (block.fontStyle) customStyles.fontStyle = block.fontStyle;

                                                let sizeClass = '';
                                                if (block.fontSize) {
                                                  sizeClass = 
                                                    block.fontSize === 'sm' ? 'text-xs sm:text-sm' :
                                                    block.fontSize === 'base' ? 'text-sm sm:text-base font-medium' :
                                                    block.fontSize === 'lg' ? 'text-base sm:text-lg font-semibold' :
                                                    block.fontSize === 'xl' ? 'text-lg sm:text-xl font-bold' :
                                                    block.fontSize === '2xl' ? 'text-xl sm:text-2xl font-extrabold' :
                                                    block.fontSize === '3xl' ? 'text-2xl sm:text-3xl font-black' :
                                                    'text-3xl sm:text-4xl font-black';
                                                } else {
                                                  sizeClass = 
                                                    block.type === 'h1' ? 'text-3.5xl sm:text-4xl font-black text-slate-900' :
                                                    block.type === 'h2' ? 'text-2xl sm:text-3xl font-extrabold text-slate-900' :
                                                    block.type === 'h3' ? 'text-xl sm:text-2xl font-bold text-slate-900' :
                                                    block.type === 'quote' ? 'italic border-l-4 border-slate-350 pl-4 py-1.5' :
                                                    block.type === 'code' ? 'font-mono text-xs bg-slate-50 p-3 rounded-xl border border-slate-200' :
                                                    'text-xs sm:text-sm text-slate-700';
                                                }

                                                return (
                                                  <div className="space-y-1 text-left">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                      <span>{block.type} Block</span>
                                                    </div>
                                                    <textarea
                                                      rows={block.type === 'paragraph' ? 3 : block.type === 'code' ? 4 : 1}
                                                      value={block.content}
                                                      onFocus={() => setActiveBlockIdx(blockIdx)}
                                                      onChange={(e) => handleBlogBlockFieldChange(postIdx, blockIdx, 'content', e.target.value)}
                                                      style={customStyles}
                                                      className={`w-full bg-transparent border-0 border-b border-transparent focus:border-slate-100 p-1 placeholder-slate-350 focus:ring-0 focus:outline-none leading-relaxed transition-all ${sizeClass}`}
                                                      placeholder="Write block content..."
                                                    />
                                                  </div>
                                                );
                                              })()
                                            ) : block.type === 'image' || block.type === 'video' ? (
                                              <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{block.type} Block</span>
                                                </div>
                                                <div 
                                                  onDragOver={(e) => e.preventDefault()}
                                                  onDrop={(e) => {
                                                    e.preventDefault();
                                                    showToast('success', 'File dropped! Click SELECT FILE to upload.');
                                                  }}
                                                  className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors"
                                                >
                                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                                    <div className="sm:col-span-4">
                                                      <input
                                                        type="file"
                                                        accept={block.type === 'image' ? 'image/*' : 'video/*'}
                                                        id={`upload-gutenberg-${block.id}`}
                                                        className="hidden"
                                                        onChange={(e) => handleUploadBlogMedia(e, postIdx, blockIdx)}
                                                      />
                                                      <label
                                                        htmlFor={`upload-gutenberg-${block.id}`}
                                                        className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xxs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xxs"
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
                                                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-blue-500 py-1 px-0 text-xs placeholder-slate-400 focus:ring-0 focus:outline-none font-medium"
                                                        placeholder={block.type === 'image' ? "Enforce Alt Text details (for SEO) *" : "Write caption"}
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                                {block.mediaUrl && (
                                                  <div className="mt-2 max-w-[240px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                                    {block.type === 'image' ? (
                                                      <img src={block.mediaUrl} alt="" className="w-full h-auto object-cover max-h-[140px]" />
                                                    ) : (
                                                      <video src={block.mediaUrl} controls className="w-full max-h-[140px]" />
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            ) : ['youtube', 'instagram', 'newsletter'].includes(block.type) ? (
                                              <div className="space-y-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{block.type} block</span>
                                                <input
                                                  type="text"
                                                  value={block.content}
                                                  onChange={(e) => handleBlogBlockFieldChange(postIdx, blockIdx, 'content', e.target.value)}
                                                  placeholder={
                                                    block.type === 'youtube' ? 'YouTube watch URL...' :
                                                    block.type === 'instagram' ? 'Instagram post url link...' :
                                                    'Newsletter Signup CTA button label'
                                                  }
                                                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white"
                                                />
                                              </div>
                                            ) : block.type === 'separator' ? (
                                              <div className="py-2">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Separator Block</div>
                                                <hr className="border-t-2 border-slate-200 my-2" />
                                              </div>
                                            ) : block.type === 'spacer' ? (
                                              <div className="py-2 bg-slate-50/50 border border-slate-150 rounded-xl p-3 space-y-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Spacer Height: {block.content || '40'}px</span>
                                                <input
                                                  type="range"
                                                  min="10"
                                                  max="120"
                                                  value={block.content || '40'}
                                                  onChange={(e) => handleBlogBlockFieldChange(postIdx, blockIdx, 'content', e.target.value)}
                                                  className="w-full accent-blue-600"
                                                />
                                                <div className="bg-slate-100 rounded-lg transition-all border border-dashed border-slate-200" style={{ height: `${parseInt(block.content || '40')}px` }} />
                                              </div>
                                            ) : block.type === 'table' ? (
                                              <div className="space-y-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Table Block</span>
                                                <textarea
                                                  rows={3}
                                                  value={block.content}
                                                  onChange={(e) => handleBlogBlockFieldChange(postIdx, blockIdx, 'content', e.target.value)}
                                                  className="w-full font-mono text-[10px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 resize-none focus:outline-none focus:border-blue-500"
                                                  placeholder="Header 1 | Header 2&#10;Cell 1 | Cell 2"
                                                />
                                                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white mt-1.5 shadow-xxs">
                                                  <table className="w-full text-xs text-slate-700 text-left border-collapse">
                                                    <tbody>
                                                      {block.content.split('\n').map((rowText, rIdx) => (
                                                        <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                          {rowText.split('|').map((colText, cIdx) => (
                                                            <td key={cIdx} className="p-2.5 border-r border-slate-100 last:border-0 font-medium">
                                                              {colText.trim()}
                                                            </td>
                                                          ))}
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            ) : block.type === 'yoast-breadcrumbs' ? (
                                              <div className="border border-purple-200 bg-purple-50/20 rounded-xl p-3 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest">
                                                  <span className="bg-purple-600 text-white rounded px-1 text-[8px]">Y</span>
                                                  <span>Yoast Breadcrumbs</span>
                                                </div>
                                                <div className="text-xs text-slate-600 font-bold pt-1">
                                                  <span className="text-[#2271b1] hover:underline cursor-pointer">Home</span>
                                                  <span className="mx-1 text-slate-400">/</span>
                                                  <span className="text-[#2271b1] hover:underline cursor-pointer">Blog</span>
                                                  <span className="mx-1 text-slate-400">/</span>
                                                  <span className="font-bold text-slate-800">{post.title || 'New Article'}</span>
                                                </div>
                                              </div>
                                            ) : block.type === 'yoast-reading-time' ? (() => {
                                              const text = post.blocks.map(b => b.content).join(' ');
                                              const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                                              const readTime = Math.max(1, Math.round(words / 200));
                                              return (
                                                <div className="border border-purple-250 bg-purple-50/20 rounded-xl p-3 space-y-1">
                                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest">
                                                    <span className="bg-purple-600 text-white rounded px-1 text-[8px]">Y</span>
                                                    <span>Yoast Estimated Reading Time</span>
                                                  </div>
                                                  <div className="text-xs font-black text-slate-805 pt-1">
                                                    ⏱ {readTime} min read ({words} words total)
                                                  </div>
                                                </div>
                                              );
                                            })() : block.type === 'yoast-toc' ? (() => {
                                              const headings = post.blocks.filter(b => ['h1', 'h2', 'h3'].includes(b.type));
                                              return (
                                                <div className="border border-purple-255 bg-purple-50/20 rounded-xl p-4 space-y-2">
                                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest">
                                                    <span className="bg-purple-600 text-white rounded px-1 text-[8px]">Y</span>
                                                    <span>Yoast Table of Contents</span>
                                                  </div>
                                                  {headings.length > 0 ? (
                                                    <ul className="list-disc list-inside text-xs text-[#2271b1] font-bold space-y-1 pt-1">
                                                      {headings.map((h, hIdx) => (
                                                        <li key={hIdx} className="hover:underline cursor-pointer">
                                                          {h.content || 'Untitled Heading'}
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  ) : (
                                                    <p className="text-[10px] text-slate-400 italic">No headings found. Add H1/H2 blocks to see table links.</p>
                                                  )}
                                                </div>
                                              );
                                            })() : block.type === 'yoast-faq' ? (() => {
                                              let items = [];
                                              try {
                                                items = JSON.parse(block.content || '[]');
                                              } catch(e) {
                                                items = [{ q: 'Question 1', a: 'Answer 1' }];
                                              }
                                              const updateFaq = (idx: number, key: 'q' | 'a', val: string) => {
                                                const next = [...items];
                                                next[idx] = { ...next[idx], [key]: val };
                                                handleBlogBlockFieldChange(postIdx, blockIdx, 'content', JSON.stringify(next));
                                              };
                                              const addFaq = () => {
                                                const next = [...items, { q: 'New Question', a: 'New Answer' }];
                                                handleBlogBlockFieldChange(postIdx, blockIdx, 'content', JSON.stringify(next));
                                              };
                                              const deleteFaq = (idx: number) => {
                                                const next = items.filter((_, i) => i !== idx);
                                                handleBlogBlockFieldChange(postIdx, blockIdx, 'content', JSON.stringify(next));
                                              };
                                              return (
                                                <div className="border border-purple-200 bg-purple-50/10 rounded-2xl p-4 space-y-3">
                                                  <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest">
                                                      <span className="bg-purple-600 text-white rounded px-1 text-[8px]">Y</span>
                                                      <span>Yoast FAQ Block</span>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={addFaq}
                                                      className="text-[9px] font-black text-purple-700 hover:text-purple-900 uppercase cursor-pointer"
                                                    >
                                                      + Add Question
                                                    </button>
                                                  </div>
                                                  <div className="space-y-3">
                                                    {items.map((item, itemIdx) => (
                                                      <div key={itemIdx} className="bg-white border border-purple-100 rounded-xl p-3 relative space-y-2">
                                                        <button
                                                          type="button"
                                                          onClick={() => deleteFaq(itemIdx)}
                                                          className="absolute top-1.5 right-2 text-[10px] text-red-500 hover:text-red-750 font-bold cursor-pointer"
                                                        >
                                                          ✕ remove
                                                        </button>
                                                        <input
                                                          type="text"
                                                          value={item.q}
                                                          onChange={(e) => updateFaq(itemIdx, 'q', e.target.value)}
                                                          placeholder="Enter FAQ Question"
                                                          className="w-[90%] border-0 border-b border-transparent focus:border-purple-200 text-xs font-bold text-slate-800 focus:outline-none p-0.5 focus:ring-0"
                                                        />
                                                        <textarea
                                                          rows={2}
                                                          value={item.a}
                                                          onChange={(e) => updateFaq(itemIdx, 'a', e.target.value)}
                                                          placeholder="Enter FAQ Answer"
                                                          className="w-full border-0 border-b border-transparent focus:border-purple-200 text-xs text-slate-600 focus:outline-none p-0.5 resize-none leading-relaxed focus:ring-0"
                                                        />
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              );
                                            })() : block.type === 'yoast-howto' ? (() => {
                                              let data = { title: '', steps: [] };
                                              try {
                                                data = JSON.parse(block.content || '{"title":"","steps":[]}');
                                              } catch(e) {
                                                data = { title: 'How to...', steps: ['Step 1', 'Step 2'] };
                                              }
                                              const updateTitle = (val: string) => {
                                                const next = { ...data, title: val };
                                                handleBlogBlockFieldChange(postIdx, blockIdx, 'content', JSON.stringify(next));
                                              };
                                              const updateStep = (idx: number, val: string) => {
                                                const steps = [...data.steps];
                                                steps[idx] = val;
                                                const next = { ...data, steps };
                                                handleBlogBlockFieldChange(postIdx, blockIdx, 'content', JSON.stringify(next));
                                              };
                                              const addStep = () => {
                                                const next = { ...data, steps: [...data.steps, 'Next Step instruction...'] };
                                                handleBlogBlockFieldChange(postIdx, blockIdx, 'content', JSON.stringify(next));
                                              };
                                              const deleteStep = (idx: number) => {
                                                const next = { ...data, steps: data.steps.filter((_, i) => i !== idx) };
                                                handleBlogBlockFieldChange(postIdx, blockIdx, 'content', JSON.stringify(next));
                                              };
                                              return (
                                                <div className="border border-purple-200 bg-purple-50/10 rounded-2xl p-4 space-y-3">
                                                  <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest">
                                                      <span className="bg-purple-600 text-white rounded px-1 text-[8px]">Y</span>
                                                      <span>Yoast How-to Block</span>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={addStep}
                                                      className="text-[9px] font-black text-purple-700 hover:text-purple-900 uppercase cursor-pointer"
                                                    >
                                                      + Add Step
                                                    </button>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <input
                                                      type="text"
                                                      value={data.title}
                                                      onChange={(e) => updateTitle(e.target.value)}
                                                      placeholder="How-to Action Title"
                                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-0 focus:border-blue-500"
                                                    />
                                                    <div className="space-y-2">
                                                      {data.steps.map((step, sIdx) => (
                                                        <div key={sIdx} className="flex gap-2 items-center bg-white border border-purple-50 p-2 rounded-lg relative">
                                                          <span className="text-[10px] font-black text-purple-400 shrink-0 w-4">{sIdx + 1}.</span>
                                                          <input
                                                            type="text"
                                                            value={step}
                                                            onChange={(e) => updateStep(sIdx, e.target.value)}
                                                            className="flex-1 border-0 border-b border-transparent focus:border-purple-200 text-xs text-slate-700 focus:outline-none p-0.5 focus:ring-0"
                                                          />
                                                          <button
                                                            type="button"
                                                            onClick={() => deleteStep(sIdx)}
                                                            className="text-red-500 hover:text-red-750 text-[10px] font-bold px-1 cursor-pointer"
                                                          >
                                                            ✕
                                                          </button>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })() : block.type === 'yoast-ai-summarize' ? (
                                              <div className="border border-purple-200 bg-purple-50/10 rounded-2xl p-4 space-y-3">
                                                <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest">
                                                    <span className="bg-purple-600 text-white rounded px-1 text-[8px]">Y</span>
                                                    <span>Yoast AI Summarize</span>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const text = post.blocks.filter(b => b.type === 'paragraph').map(b => b.content).join(' ');
                                                      const summary = text.slice(0, 180) + (text.length > 180 ? '...' : '');
                                                      handleBlogBlockFieldChange(postIdx, blockIdx, 'content', summary || 'Write content first, then trigger AI Summary!');
                                                      showToast('success', 'AI Summary generated successfully from article content!');
                                                    }}
                                                    className="text-[9px] font-black text-purple-700 hover:text-purple-900 uppercase cursor-pointer"
                                                  >
                                                    ✨ Generate AI Summary
                                                  </button>
                                                </div>
                                                <div className="bg-white border border-purple-100 rounded-xl p-3 space-y-1">
                                                  <textarea
                                                    rows={3}
                                                    value={block.content}
                                                    onChange={(e) => handleBlogBlockFieldChange(postIdx, blockIdx, 'content', e.target.value)}
                                                    placeholder="Your AI summary preview will be generated here..."
                                                    className="w-full border-0 border-b border-transparent focus:border-purple-200 text-xs text-slate-700 focus:outline-none p-0.5 resize-none leading-relaxed focus:ring-0"
                                                  />
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>

                                          {/* Inline block hover inserter */}
                                          <div className="group/line relative py-1 flex items-center justify-center">
                                            <div className="absolute inset-x-0 h-px bg-slate-200/40 opacity-0 group-hover/line:opacity-100 transition-opacity" />
                                            <div className="opacity-0 group-hover/line:opacity-100 transition-opacity z-10 bg-white border border-slate-200 rounded-full p-1 shadow-sm flex items-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'paragraph')}
                                                className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-[#2271b1] rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 cursor-pointer"
                                                title="Add Paragraph"
                                              >
                                                ¶
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'h2')}
                                                className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-[#2271b1] rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 cursor-pointer"
                                                title="Add Heading H2"
                                              >
                                                H
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'list')}
                                                className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-[#2271b1] rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 cursor-pointer"
                                                title="Add List"
                                              >
                                                ≣
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleAddBlogBlockAtIndex(postIdx, blockIdx + 1, 'image')}
                                                className="w-5 h-5 bg-slate-50 hover:bg-blue-50 hover:text-[#2271b1] rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 cursor-pointer"
                                                title="Add Image"
                                              >
                                                🖼
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                
                                /* Classic Mode Editor Canvas */
                                <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xxs text-left font-sans">
                                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById(`upload-gutenberg-${post.blocks[0]?.id || 'classic'}`);
                                          if (input) input.click();
                                        }}
                                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-xxs flex items-center gap-1 cursor-pointer transition-colors shadow-xxs"
                                      >
                                        🖼 Add Media
                                      </button>
                                      <span className="text-[10px] text-slate-400 font-bold">Classic Editor WYSIWYG Mode</span>
                                    </div>
                                    <span className="text-[9px] bg-slate-200 text-slate-655 px-2 py-0.5 rounded font-black tracking-wide">TINY_MCE</span>
                                  </div>
                                  
                                  {/* Menu options */}
                                  <div className="bg-[#fafafa] border-b border-slate-200 px-4 py-1.5 flex flex-wrap gap-4 text-[11px] text-slate-500 font-semibold border-t border-slate-100">
                                    <span>File</span>
                                    <span>Edit</span>
                                    <span>View</span>
                                    <span>Insert</span>
                                    <span>Format</span>
                                    <span>Tools</span>
                                    <span>Table</span>
                                  </div>

                                  {/* Toolbar buttons */}
                                  <div className="bg-[#fafafa] border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center gap-1">
                                    <select 
                                      onChange={(e) => {
                                        applyClassicFormat(post.id, postIdx, e.target.value);
                                        e.target.value = 'paragraph';
                                      }}
                                      className="border border-slate-200 rounded px-1.5 py-0.5 text-xxs font-bold text-slate-655 focus:outline-none bg-white mr-1.5"
                                    >
                                      <option value="paragraph">Paragraph</option>
                                      <option value="h1">Heading 1</option>
                                      <option value="h2">Heading 2</option>
                                      <option value="h3">Heading 3</option>
                                      <option value="blockquote">Quote</option>
                                    </select>

                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'bold')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs font-black text-slate-700 cursor-pointer">B</button>
                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'italic')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs italic font-bold text-slate-700 cursor-pointer">I</button>
                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'quote')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">❝</button>
                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'bullet')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">≣</button>
                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'number')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">1.</button>
                                    
                                    <div className="h-4 w-px bg-slate-200 mx-1" />

                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'align-left')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">◧</button>
                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'align-center')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">◫</button>
                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'align-right')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">◨</button>
                                    
                                    <div className="h-4 w-px bg-slate-200 mx-1" />

                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const url = prompt('Enter link URL:', 'https://');
                                        if (url) applyClassicFormat(post.id, postIdx, 'link', url);
                                      }} 
                                      className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer"
                                    >
                                      🔗
                                    </button>
                                    <button type="button" onClick={() => applyClassicFormat(post.id, postIdx, 'unlink')} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">⛓️</button>
                                    
                                    <div className="h-4 w-px bg-slate-200 mx-1" />

                                    <button type="button" onClick={() => handleClassicUndo(postIdx)} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">↺</button>
                                    <button type="button" onClick={() => handleClassicRedo(postIdx)} className="w-6 h-6 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer">↻</button>
                                  </div>

                                  <div className="p-6 bg-white min-h-[380px]">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      id={`upload-gutenberg-${post.blocks[0]?.id || 'classic'}`}
                                      className="hidden"
                                      onChange={(e) => handleUploadBlogMedia(e, postIdx, 0)}
                                    />
                                    <textarea
                                      rows={15}
                                      id={`classic-textarea-${post.id}`}
                                      value={post.blocks[0]?.content || ''}
                                      onChange={(e) => handleClassicTextChange(post.id, postIdx, e.target.value)}
                                      className="w-full bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-sm font-medium leading-relaxed font-serif text-slate-800 placeholder-slate-400"
                                      placeholder="Start writing your page here in Classic Editor WYSIWYG mode..."
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Word Count Bar */}
                              {(() => {
                                const text = post.blocks.map(b => b.content).join(' ');
                                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                                const readTime = Math.max(1, Math.round(words / 200));
                                return (
                                  <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-405 flex items-center justify-between shadow-xxs font-sans">
                                    <div className="flex gap-4">
                                      <span>{words} word{words === 1 ? '' : 's'}</span>
                                      <span>{post.blocks.length} block{post.blocks.length === 1 ? '' : 's'}</span>
                                    </div>
                                    <span>⏱ {readTime} min read</span>
                                  </div>
                                );
                              })()}

                            </div>

                            {/* Sidebar Column (4 cols) */}
                            <div className="lg:col-span-4 space-y-4 w-full">
                              
                              {/* Sidebar Tabs */}
                              <div className="flex border border-slate-200 bg-white rounded-2xl p-1 shadow-xxs">
                                <button
                                  type="button"
                                  onClick={() => setActiveBlockIdx(null)}
                                  className={`flex-1 text-center py-2 font-black text-xxs tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
                                    activeBlockIdx === null
                                      ? 'bg-slate-900 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  Page
                                </button>
                                <button
                                  type="button"
                                  disabled={post.blocks.length === 0}
                                  onClick={() => {
                                    if (post.blocks.length > 0) {
                                      setActiveBlockIdx(0);
                                    }
                                  }}
                                  className={`flex-1 text-center py-2 font-black text-xxs tracking-wider uppercase rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                    activeBlockIdx !== null
                                      ? 'bg-slate-900 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  Block
                                </button>
                              </div>

                              {activeBlockIdx === null ? (
                                <div className="space-y-4">
                                  
                                  {/* Sidebar Panel 1: Document Status */}
                                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-4">
                                    <h4 
                                      onClick={() => setCollapsedPanels(prev => ({ ...prev, status: !prev.status }))}
                                      className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <span>Document Status</span>
                                      <span className="text-slate-400">{collapsedPanels.status ? '▸' : '▾'}</span>
                                    </h4>
                                    
                                    {!collapsedPanels.status && (
                                      <div className="space-y-3.5 animate-fadeIn">
                                        <div className="flex items-center justify-between">
                                          <button
                                            type="button"
                                            onClick={() => showToast('success', 'Draft saved successfully!')}
                                            className="text-xs font-bold text-[#2271b1] hover:underline cursor-pointer"
                                          >
                                            Save Draft
                                          </button>
                                          
                                          <button
                                            type="button"
                                            onClick={handleSaveBlogs}
                                            disabled={isSavingBlogs}
                                            className="bg-[#2271b1] hover:bg-[#135e96] disabled:bg-blue-300 text-white font-bold py-1.5 px-3.5 rounded text-xxs flex items-center gap-1 cursor-pointer"
                                          >
                                            {isSavingBlogs ? 'Saving...' : 'Update'}
                                          </button>
                                        </div>

                                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                                          <span className="text-slate-500 font-bold">Status:</span>
                                          <span className="font-extrabold capitalize text-slate-800">{post.status || 'draft'}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-slate-500 font-bold">Visibility:</span>
                                          <span className="font-extrabold text-slate-800">Public</span>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Publish Date</label>
                                          <input
                                            type="date"
                                            value={post.createdAt}
                                            onChange={(e) => handleBlogFieldChange(postIdx, 'createdAt', e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-slate-50/50"
                                          />
                                        </div>

                                        <div className="pt-2 border-t border-slate-150 text-center">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (confirm('Are you sure you want to move this page to trash?')) {
                                                handleBlogFieldChange(postIdx, 'status', 'archived');
                                                showToast('success', 'Page moved to Trash.');
                                              }
                                            }}
                                            className="text-red-500 hover:text-red-750 text-xs font-semibold cursor-pointer"
                                          >
                                            Move to Trash
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Sidebar Panel 2: Featured Image */}
                                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-4">
                                    <h4 
                                      onClick={() => setCollapsedPanels(prev => ({ ...prev, cover: !prev.cover }))}
                                      className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <span>Featured Image</span>
                                      <span className="text-slate-400">{collapsedPanels.cover ? '▸' : '▾'}</span>
                                    </h4>

                                    {!collapsedPanels.cover && (
                                      <div className="space-y-3.5 animate-fadeIn">
                                        <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50 relative">
                                          {post.coverImage ? (
                                            <div className="space-y-2">
                                              <img src={post.coverImage} alt="Cover Preview" className="w-full h-28 object-cover rounded-xl border border-slate-100" />
                                              <button
                                                type="button"
                                                onClick={() => handleBlogFieldChange(postIdx, 'coverImage', '')}
                                                className="text-xxs text-red-500 hover:underline font-bold cursor-pointer"
                                              >
                                                Remove featured image
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              <p className="text-[10px] text-slate-405 font-medium">Select a high-quality featured image</p>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                id={`wp-cover-file-${post.id}`}
                                                className="hidden"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  const reader = new FileReader();
                                                  reader.readAsDataURL(file);
                                                  reader.onload = async () => {
                                                    try {
                                                      const base64Data = reader.result as string;
                                                      const uploadRes = await dataService.uploadImage(file.name, base64Data);
                                                      if (uploadRes.success && uploadRes.url) {
                                                        handleBlogFieldChange(postIdx, 'coverImage', uploadRes.url);
                                                        showToast('success', 'Featured image uploaded successfully!');
                                                      } else {
                                                        showToast('error', 'Featured image upload failed.');
                                                      }
                                                    } catch (err) {
                                                      showToast('error', 'Error setting featured image.');
                                                    }
                                                  };
                                                }}
                                              />
                                              <label
                                                htmlFor={`wp-cover-file-${post.id}`}
                                                className="inline-block bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-xxs cursor-pointer transition-colors shadow-xxs"
                                              >
                                                Set Featured Image
                                              </label>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Sidebar Panel 3: Yoast / RankMath SEO Auditor */}
                                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-4">
                                    <h4 
                                      onClick={() => setCollapsedPanels(prev => ({ ...prev, seo: !prev.seo }))}
                                      className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <span>RankMath SEO</span>
                                      <span className="text-slate-400">{collapsedPanels.seo ? '▸' : '▾'}</span>
                                    </h4>

                                    {!collapsedPanels.seo && (
                                      <div className="space-y-3.5 animate-fadeIn">
                                        {(() => {
                                          const keyword = (post.focusKeyword || '').toLowerCase().trim();
                                          const isKeywordSet = keyword.length > 0;
                                          const keywordInTitle = isKeywordSet && post.title.toLowerCase().includes(keyword);
                                          const keywordInSlug = isKeywordSet && post.slug.toLowerCase().includes(keyword);
                                          const keywordInDesc = isKeywordSet && post.metaDescription.toLowerCase().includes(keyword);
                                          const titleLengthOk = post.metaTitle.length >= 45 && post.metaTitle.length <= 60;
                                          const descLengthOk = post.metaDescription.length >= 120 && post.metaDescription.length <= 160;
                                          const altTagsOk = post.blocks.some(b => b.type === 'image') && !post.blocks.some(b => b.type === 'image' && (!b.content || b.content.trim() === ''));

                                          let seoScore = 0;
                                          if (isKeywordSet) seoScore += 20;
                                          if (keywordInTitle) seoScore += 20;
                                          if (keywordInSlug) seoScore += 15;
                                          if (keywordInDesc) seoScore += 15;
                                          if (titleLengthOk) seoScore += 10;
                                          if (descLengthOk) seoScore += 10;
                                          if (altTagsOk) seoScore += 10;

                                          const progressBarColor = seoScore >= 80 ? 'bg-emerald-500' : seoScore >= 50 ? 'bg-amber-500' : 'bg-red-500';

                                          return (
                                            <div className="space-y-3">
                                              <div className="flex justify-between items-center">
                                                <span className="text-xxs font-black text-slate-500 uppercase tracking-wider">SEO Score</span>
                                                <span className="text-xxs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-150">{seoScore}/100</span>
                                              </div>
                                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-300 ${progressBarColor}`} style={{ width: `${seoScore}%` }} />
                                              </div>
                                              
                                              <div className="space-y-2 pt-1">
                                                <div className="space-y-1">
                                                  <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Focus Keyword</label>
                                                  <input
                                                    type="text"
                                                    value={post.focusKeyword || ''}
                                                    onChange={(e) => handleBlogFieldChange(postIdx, 'focusKeyword', e.target.value)}
                                                    placeholder="e.g. driving lessons"
                                                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none bg-slate-50 font-bold"
                                                  />
                                                </div>

                                                <div className="space-y-1">
                                                  <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">SEO Meta Title</label>
                                                  <input
                                                    type="text"
                                                    value={post.metaTitle}
                                                    onChange={(e) => handleBlogFieldChange(postIdx, 'metaTitle', e.target.value)}
                                                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none bg-white font-semibold"
                                                  />
                                                </div>

                                                <div className="space-y-1">
                                                  <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">SEO Meta Description</label>
                                                  <textarea
                                                    rows={2}
                                                    value={post.metaDescription}
                                                    onChange={(e) => handleBlogFieldChange(postIdx, 'metaDescription', e.target.value)}
                                                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none bg-white resize-none"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </div>

                                  {/* Sidebar Panel 4: Categories & Tags */}
                                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-4">
                                    <h4 
                                      onClick={() => setCollapsedPanels(prev => ({ ...prev, cats: !prev.cats }))}
                                      className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <span>Categories & Tags</span>
                                      <span className="text-slate-400">{collapsedPanels.cats ? '▸' : '▾'}</span>
                                    </h4>

                                    {!collapsedPanels.cats && (
                                      <div className="space-y-3.5 animate-fadeIn">
                                        <div className="space-y-1.5">
                                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Category</label>
                                          <select
                                            value={post.category || 'Driving Tips'}
                                            onChange={(e) => handleBlogFieldChange(postIdx, 'category', e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-705 focus:outline-none bg-white"
                                          >
                                            <option value="Driving Tips">Driving Tips</option>
                                            <option value="RTO Guides">RTO Guides</option>
                                            <option value="Road Safety">Road Safety</option>
                                            <option value="UpDrive News">UpDrive News</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Tags (comma separated)</label>
                                          <input
                                            type="text"
                                            value={post.tags || ''}
                                            onChange={(e) => handleBlogFieldChange(postIdx, 'tags', e.target.value)}
                                            placeholder="mumbai, license, etc"
                                            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none bg-white"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Sidebar Panel 5: Author Info */}
                                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-4">
                                    <h4 
                                      onClick={() => setCollapsedPanels(prev => ({ ...prev, author: !prev.author }))}
                                      className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <span>Author Settings</span>
                                      <span className="text-slate-400">{collapsedPanels.author ? '▸' : '▾'}</span>
                                    </h4>

                                    {!collapsedPanels.author && (
                                      <div className="space-y-3 animate-fadeIn">
                                        <div className="space-y-1.5">
                                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Author Name</label>
                                          <input
                                            type="text"
                                            value={post.authorName || ''}
                                            onChange={(e) => handleBlogFieldChange(postIdx, 'authorName', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none bg-white"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Author Short Bio</label>
                                          <input
                                            type="text"
                                            value={post.authorBio || ''}
                                            onChange={(e) => handleBlogFieldChange(postIdx, 'authorBio', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none bg-white"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Sidebar Panel 6: Discussion settings */}
                                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-4">
                                    <h4 
                                      onClick={() => setCollapsedPanels(prev => ({ ...prev, related: !prev.related }))}
                                      className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <span>Discussion Options</span>
                                      <span className="text-slate-400">{collapsedPanels.related ? '▸' : '▾'}</span>
                                    </h4>

                                    {!collapsedPanels.related && (
                                      <div className="space-y-2 animate-fadeIn text-xs text-slate-600 font-bold">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                          <span>Allow comments</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                          <span>Allow pingbacks & trackbacks</span>
                                        </label>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              ) : (
                                
                                /* Block Settings Tab */
                                (() => {
                                  const activeBlock = post.blocks[activeBlockIdx];
                                  if (!activeBlock) {
                                    return (
                                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs text-center text-slate-400 text-xs py-8">
                                        Select a block in the compose area to view block inspector options.
                                      </div>
                                    );
                                  }

                                  const updateActiveBlockProp = (prop: 'fontSize' | 'textColor' | 'backgroundColor', val: string) => {
                                    const next = [...post.blocks];
                                    next[activeBlockIdx] = { ...next[activeBlockIdx], [prop]: val };
                                    handleBlogFieldChange(postIdx, 'blocks', next);
                                  };

                                  return (
                                    <div className="space-y-4 animate-fadeIn">
                                      
                                      {/* Block Info Card */}
                                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs text-left space-y-2">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                          <span className="text-xs font-black text-slate-900 uppercase">Block Settings</span>
                                          <button
                                            type="button"
                                            onClick={() => setActiveBlockIdx(null)}
                                            className="text-[10px] text-[#2271b1] hover:underline cursor-pointer"
                                          >
                                            Close Block
                                          </button>
                                        </div>
                                        <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">
                                          Type: <span className="text-slate-800 font-extrabold">{activeBlock.type}</span>
                                        </div>
                                      </div>

                                      {/* Formatting Swatches Card */}
                                      {['paragraph', 'h1', 'h2', 'h3', 'list', 'quote', 'code'].includes(activeBlock.type) && (
                                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs space-y-4 text-left font-sans">
                                          <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Font Size Preset</span>
                                            <div className="grid grid-cols-4 gap-1">
                                              {([
                                                { label: 'Sm', val: 'sm' },
                                                { label: 'Reg', val: 'base' },
                                                { label: 'Lg', val: 'lg' },
                                                { label: 'XL', val: 'xl' },
                                                { label: 'H2', val: '2xl' },
                                                { label: 'H3', val: '3xl' }
                                              ]).map((preset) => (
                                                <button
                                                  key={preset.val}
                                                  type="button"
                                                  onClick={() => updateActiveBlockProp('fontSize', preset.val)}
                                                  className={`py-1 text-[9px] font-bold rounded border transition-colors cursor-pointer text-center uppercase ${
                                                    activeBlock.fontSize === preset.val
                                                      ? 'bg-blue-50 border-blue-500 text-blue-650 font-black'
                                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                  }`}
                                                >
                                                  {preset.label}
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          <div className="space-y-2 pt-2 border-t border-slate-100">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Text Color Swatch</span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {[
                                                { name: 'Dark Slate', hex: '#1e293b' },
                                                { name: 'Indigo Blue', hex: '#4338ca' },
                                                { name: 'Emerald Green', hex: '#047857' },
                                                { name: 'Orange Sunset', hex: '#ea580c' },
                                                { name: 'Crimson Red', hex: '#dc2626' }
                                              ].map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => updateActiveBlockProp('textColor', c.hex)}
                                                  style={{ backgroundColor: c.hex }}
                                                  className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                                    activeBlock.textColor === c.hex ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                                                  }`}
                                                  title={c.name}
                                                />
                                              ))}
                                              <button
                                                type="button"
                                                onClick={() => updateActiveBlockProp('textColor', '')}
                                                className="text-[9px] font-bold border border-slate-200 px-1.5 rounded hover:bg-slate-50 cursor-pointer"
                                              >
                                                Clear
                                              </button>
                                            </div>
                                          </div>

                                          <div className="space-y-2 pt-2 border-t border-slate-100">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Highlight Swatch</span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {[
                                                { name: 'None', hex: '' },
                                                { name: 'Indigo Light', hex: '#e0e7ff' },
                                                { name: 'Green Light', hex: '#d1fae5' },
                                                { name: 'Yellow Light', hex: '#fef3c7' },
                                                { name: 'Red Light', hex: '#fee2e2' }
                                              ].map((c) => (
                                                <button
                                                  key={c.hex}
                                                  type="button"
                                                  onClick={() => updateActiveBlockProp('backgroundColor', c.hex)}
                                                  style={{ backgroundColor: c.hex || '#ffffff' }}
                                                  className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                                    c.hex === '' ? 'border-dashed border-slate-300' :
                                                    activeBlock.backgroundColor === c.hex ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                                                  }`}
                                                  title={c.name}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    </div>
                                  );
                                })()
                              )}

                            </div>

                          </div>
                        </div>

                        {/* Inserter Overlay Panel Mock */}
                        {showInserter && (
                          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 z-50 animate-fadeIn">
                            <div className="bg-white border border-slate-200 w-[520px] max-w-[94vw] max-h-[80vh] rounded-3xl shadow-xl flex flex-col overflow-hidden">
                              
                              {/* Header search */}
                              <div className="p-4 border-b border-slate-150 flex items-center justify-between gap-3 shrink-0">
                                <input
                                  type="text"
                                  placeholder="Search for a block..."
                                  value={inserterSearch}
                                  onChange={(e) => setInserterSearch(e.target.value)}
                                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-0"
                                />
                                <button
                                  type="button"
                                  onClick={() => { setShowInserter(false); setInserterSearch(''); }}
                                  className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Category selector pills */}
                              {!inserterSearch && (
                                <div className="flex gap-1.5 px-4 py-2 border-b border-slate-100 overflow-x-auto shrink-0 scrollbar-none">
                                  {(['Text', 'Media', 'Design', 'Widgets', 'Yoast'] as const).map((cat) => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => setActiveInserterCat(cat)}
                                      className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-colors cursor-pointer ${
                                        activeInserterCat === cat
                                          ? 'bg-blue-50 text-blue-650'
                                          : 'bg-transparent text-slate-500 hover:bg-slate-50'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Grid of Blocks */}
                              <div className="p-4 overflow-y-auto max-h-[420px]">
                                {(() => {
                                  const library = {
                                    Text: [
                                      { name: 'Paragraph', icon: '¶', type: 'paragraph' },
                                      { name: 'Heading 1', icon: 'H1', type: 'h1' },
                                      { name: 'Heading 2', icon: 'H2', type: 'h2' },
                                      { name: 'Heading 3', icon: 'h3' },
                                      { name: 'List', icon: '≣', type: 'list' },
                                      { name: 'Blockquote', icon: '❝', type: 'quote' },
                                      { name: 'Code Block', icon: '<>', type: 'code' },
                                      { name: 'Table', icon: '⊞', type: 'table' }
                                    ],
                                    Media: [
                                      { name: 'Image', icon: '🖼', type: 'image' },
                                      { name: 'Video', icon: '▶', type: 'video' },
                                      { name: 'YouTube', icon: 'YT', type: 'youtube' },
                                      { name: 'Instagram', icon: 'IG', type: 'instagram' }
                                    ],
                                    Design: [
                                      { name: 'Separator', icon: '—', type: 'separator' },
                                      { name: 'Spacer', icon: 'Spacer', type: 'spacer' },
                                      { name: 'Button', icon: '▭', type: 'newsletter' }
                                    ],
                                    Widgets: [
                                      { name: 'Search Widget', icon: '🔍', type: 'paragraph' },
                                      { name: 'Categories List', icon: '📂', type: 'paragraph' }
                                    ],
                                    Yoast: [
                                      { name: 'Reading Time', icon: '⏱', type: 'yoast-reading-time' },
                                      { name: 'FAQ Block', icon: 'FAQ', type: 'yoast-faq' },
                                      { name: 'How-to Steps', icon: 'Step', type: 'yoast-howto' },
                                      { name: 'Table of Contents', icon: 'TOC', type: 'yoast-toc' },
                                      { name: 'Breadcrumbs', icon: 'Breadcrumb', type: 'yoast-breadcrumbs' },
                                      { name: 'AI Summarize', icon: 'AI ✨', type: 'yoast-ai-summarize' }
                                    ]
                                  };

                                  let blocksToRender = [];
                                  if (inserterSearch) {
                                    const q = inserterSearch.toLowerCase().trim();
                                    blocksToRender = Object.values(library)
                                      .flat()
                                      .filter(b => b.name.toLowerCase().includes(q));
                                  } else {
                                    blocksToRender = library[activeInserterCat] || [];
                                  }

                                  if (blocksToRender.length === 0) {
                                    return (
                                      <p className="text-center text-slate-400 text-xs py-8">No blocks found matching "{inserterSearch}"</p>
                                    );
                                  }

                                  return (
                                    <div className="grid grid-cols-3 gap-2.5">
                                      {blocksToRender.map((b, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => {
                                            handleAddBlogBlock(postIdx, b.type);
                                            setShowInserter(false);
                                            setInserterSearch('');
                                            showToast('success', `${b.name} block added.`);
                                          }}
                                          className="border border-slate-200 hover:border-[#2271b1] hover:bg-slate-50 rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all cursor-pointer shadow-xxs bg-[#fbfbfb]"
                                        >
                                          <span className="text-lg text-slate-800 font-extrabold">{b.icon}</span>
                                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{b.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

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
