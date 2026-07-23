import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  PlayCircle, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter, 
  Heart, 
  Share2, 
  MessageSquare, 
  Send, 
  Award, 
  BookOpen, 
  AlertCircle, 
  User, 
  Hash, 
  CheckCircle2, 
  CornerDownRight 
} from 'lucide-react';
import { BlogPost, BlogComment } from '../types';
import { dataService } from '../services/dataService';
import Footer from './Footer';
import TermsModal from './TermsModal';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 4; // Clean pagination demo

  // Detail Interactive States
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  
  // Comments input states
  const [commentName, setCommentName] = useState<string>('');
  const [commentEmail, setCommentEmail] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [commentStatusMsg, setCommentStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Newsletter CTA states
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await dataService.getBlogs();
        // Load published blogs or future scheduled posts once they pass active date check
        const nowStr = new Date().toISOString().split('T')[0];
        
        const visible = data.filter(b => {
          if (b.status === 'published') return true;
          if (b.status === 'scheduled') {
            // If scheduled date is today or in the past, render it
            return b.scheduledPublishDate ? b.scheduledPublishDate <= nowStr : true;
          }
          return false;
        });

        // Sort: Pinned posts first, then newest date first
        const sorted = [...visible].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setBlogs(sorted);

        // Load liked posts tracking
        try {
          const savedLikes = localStorage.getItem('updrive_liked_blogs');
          if (savedLikes) setLikedPosts(JSON.parse(savedLikes));
        } catch (e) {}

        // URL Slug router
        const urlParams = new URLSearchParams(window.location.search);
        let slug = urlParams.get('slug');

        if (!slug) {
          const pathParts = window.location.pathname.split('/');
          const blogIdx = pathParts.indexOf('blog');
          if (blogIdx !== -1 && pathParts[blogIdx + 1]) {
            slug = pathParts[blogIdx + 1];
          }
        }

        if (slug) {
          const match = sorted.find(b => b.slug === slug);
          if (match) {
            setSelectedPost(match);
            // Record a mock view count
            match.views = (match.views || 0) + 1;
            await dataService.saveBlogs(data);
          }
        }
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Update SEO Document Meta tags dynamically on post load
  useEffect(() => {
    if (selectedPost) {
      document.title = selectedPost.metaTitle || `${selectedPost.title} | UpDrive`;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', selectedPost.metaDescription || selectedPost.title);

      // Inject JSON-LD Schema markup
      const existingScript = document.getElementById('blog-jsonld-schema');
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.id = 'blog-jsonld-schema';
      script.type = 'application/ld+json';
      
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": selectedPost.title,
        "description": selectedPost.metaDescription,
        "image": selectedPost.coverImage || "",
        "datePublished": selectedPost.createdAt,
        "author": {
          "@type": "Person",
          "name": selectedPost.authorName || "UpDrive Instructor"
        },
        "publisher": {
          "@type": "Organization",
          "name": "UpDrive",
          "logo": {
            "@type": "ImageObject",
            "url": window.location.origin + "/assets/logo_full.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": window.location.href
        }
      };
      
      script.innerHTML = JSON.stringify(schemaData);
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('blog-jsonld-schema');
        if (scriptToRemove) scriptToRemove.remove();
      };
    } else {
      document.title = "Driving Tips & News Blog | UpDrive";
    }
  }, [selectedPost]);

  const handleSelectPost = async (post: BlogPost) => {
    setSelectedPost(post);
    // Update window path for clean navigation history (pushState)
    const newPath = `/blog/${post.slug}`;
    window.history.pushState({ slug: post.slug }, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track view asynchronously
    try {
      const allPosts = await dataService.getBlogs();
      const updated = allPosts.map(p => {
        if (p.id === post.id) {
          return { ...p, views: (p.views || 0) + 1 };
        }
        return p;
      });
      await dataService.saveBlogs(updated);
    } catch (e) {}
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    window.history.pushState({}, '', '/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper: Calculate Reading Time
  const calculateReadingTime = (post: BlogPost) => {
    let text = '';
    post.blocks.forEach(b => {
      if (['paragraph', 'h1', 'h2', 'h3', 'quote', 'list'].includes(b.type)) {
        text += ' ' + b.content;
      }
    });
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const time = Math.max(1, Math.ceil(words / 220));
    return `${time} min read`;
  };

  // Helper: Like Post Interaction
  const handleLikePost = async () => {
    if (!selectedPost) return;
    const isLiked = likedPosts.includes(selectedPost.id);
    let updatedLikes = [...likedPosts];
    
    if (isLiked) {
      updatedLikes = updatedLikes.filter(id => id !== selectedPost.id);
      selectedPost.likes = Math.max(0, (selectedPost.likes || 0) - 1);
    } else {
      updatedLikes.push(selectedPost.id);
      selectedPost.likes = (selectedPost.likes || 0) + 1;
    }
    
    setLikedPosts(updatedLikes);
    localStorage.setItem('updrive_liked_blogs', JSON.stringify(updatedLikes));

    // Save back to db
    try {
      const allPosts = await dataService.getBlogs();
      const updated = allPosts.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, likes: selectedPost.likes };
        }
        return p;
      });
      await dataService.saveBlogs(updated);
    } catch (e) {}
  };

  // Helper: Copy/Share URL Link
  const handleSharePost = async () => {
    if (!selectedPost) return;
    const shareUrl = `${window.location.origin}/blog/${selectedPost.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedSlug(selectedPost.id);
      setTimeout(() => setCopiedSlug(null), 2000);
      
      // Update share counter
      selectedPost.shares = (selectedPost.shares || 0) + 1;
      const allPosts = await dataService.getBlogs();
      const updated = allPosts.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, shares: selectedPost.shares };
        }
        return p;
      });
      await dataService.saveBlogs(updated);
    } catch (e) {}
  };

  // Helper: Comment Form Submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentName.trim() || !commentText.trim()) return;

    const newComment = {
      id: 'comment-' + Date.now(),
      authorName: commentName,
      authorEmail: commentEmail,
      content: commentText,
      createdAt: new Date().toISOString().split('T')[0],
      isApproved: false, // Moderated by default
      adminReplies: []
    };

    const updatedComments = [...(selectedPost.comments || []), newComment];
    selectedPost.comments = updatedComments;

    try {
      const allPosts = await dataService.getBlogs();
      const updated = allPosts.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, comments: updatedComments };
        }
        return p;
      });
      await dataService.saveBlogs(updated);
      setCommentName('');
      setCommentEmail('');
      setCommentText('');
      setCommentStatusMsg({ type: 'success', text: 'Thank you! Your comment has been submitted and is awaiting moderation.' });
      setTimeout(() => setCommentStatusMsg(null), 6000);
    } catch (err) {
      setCommentStatusMsg({ type: 'error', text: 'Failed to submit comment. Please try again.' });
    }
  };

  // Helper: Newsletter Sign-up Block CTA
  const handleNewsletterCTA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      // Simulate newsletter service endpoint & increment CTA booking conversions count
      if (selectedPost) {
        selectedPost.bookingConversions = (selectedPost.bookingConversions || 0) + 1;
        const allPosts = await dataService.getBlogs();
        const updated = allPosts.map(p => {
          if (p.id === selectedPost.id) {
            return { ...p, bookingConversions: selectedPost.bookingConversions };
          }
          return p;
        });
        await dataService.saveBlogs(updated);
      }
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    } catch (e) {}
  };

  // Extract Categories & Tags uniquely for filters
  const allCategories = ['All', ...new Set(blogs.flatMap(b => b.categories || []).filter(Boolean))];
  const allTags = ['All', ...new Set(blogs.flatMap(b => b.tags || []).filter(Boolean))];

  // Filtering Logic
  const filteredBlogs = blogs.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (post.categories && post.categories.includes(selectedCategory));
    const matchesTag = selectedTag === 'All' || (post.tags && post.tags.includes(selectedTag));
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Pinned/Featured Post (take first pinned post, if any, when no filters are set)
  const isFilterActive = searchQuery !== '' || selectedCategory !== 'All' || selectedTag !== 'All';
  const featuredPost = !isFilterActive ? blogs.find(b => b.isPinned) : null;
  const listPosts = featuredPost ? filteredBlogs.filter(b => b.id !== featuredPost.id) : filteredBlogs;

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = listPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(listPosts.length / postsPerPage);

  // Popular posts sidebar list (highest viewed)
  const popularPosts = [...blogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-55 flex flex-col text-slate-900 font-sans antialiased text-left">
      
      {/* Blog Portal Header */}
      <header className="bg-white border-b border-slate-200 py-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {selectedPost ? (
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </a>
          )}
          <div>
            <span className="text-xxs font-black text-blue-650 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Driving Insights</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-12 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {isLoading ? (
          <div className="py-24 text-center text-slate-500 font-semibold animate-pulse">
            Loading articles...
          </div>
        ) : selectedPost ? (
          
          /* ========================================================================= */
          /* BLOG ARTICLE DETAIL VIEW */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <article className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-fadeIn">
              
              {/* Meta information row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-650 bg-blue-50/70 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  {selectedPost.createdAt}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {calculateReadingTime(selectedPost)}
                </span>
                {selectedPost.categories && selectedPost.categories.map((cat, idx) => (
                  <span key={idx} className="text-[10px] font-black text-emerald-650 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {cat}
                  </span>
                ))}
              </div>

              {/* Title & Author Info */}
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  {selectedPost.title}
                </h1>
                
                {selectedPost.authorName && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">By {selectedPost.authorName}</p>
                      {selectedPost.authorBio && <p className="text-[10px] text-slate-400 font-semibold">{selectedPost.authorBio}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Photo */}
              {selectedPost.coverImage && (
                <div className="space-y-2">
                  <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                    <img
                      src={selectedPost.coverImage}
                      alt={selectedPost.featuredImageAlt || selectedPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedPost.featuredImageCaption && (
                    <span className="block text-xxs text-center text-slate-400 font-medium">{selectedPost.featuredImageCaption}</span>
                  )}
                </div>
              )}

              {/* Interactive like/share tool bar */}
              <div className="flex items-center justify-between border-y border-slate-100 py-3 text-slate-500 text-xs">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLikePost}
                    className={`flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                      likedPosts.includes(selectedPost.id) ? 'text-red-550' : 'hover:text-red-550'
                    }`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${likedPosts.includes(selectedPost.id) ? 'fill-current' : ''}`} />
                    <span>{selectedPost.likes || 0} Likes</span>
                  </button>
                  
                  <div className="flex items-center gap-1 font-semibold text-slate-400">
                    <Clock className="h-4.5 w-4.5" />
                    <span>{selectedPost.views || 0} Views</span>
                  </div>
                </div>

                <button 
                  onClick={handleSharePost}
                  className="flex items-center gap-1 font-bold hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Share2 className="h-4.5 w-4.5" />
                  <span>{copiedSlug === selectedPost.id ? 'Link Copied!' : 'Share Article'}</span>
                </button>
              </div>

              {/* Custom Content Blocks (H1, H2, H3, Paragraphs, Lists, Media, Embeds, Quotes, CTAs) */}
              <div className="prose prose-blue max-w-none space-y-6">
                 {selectedPost.blocks && selectedPost.blocks.map((block) => {
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
                       block.fontSize === 'base' ? 'text-sm sm:text-base' :
                       block.fontSize === 'lg' ? 'text-base sm:text-lg' :
                       block.fontSize === 'xl' ? 'text-lg sm:text-xl font-bold' :
                       block.fontSize === '2xl' ? 'text-xl sm:text-2xl font-extrabold' :
                       block.fontSize === '3xl' ? 'text-2xl sm:text-3xl font-black' :
                       'text-3xl sm:text-4xl font-black';
                   }

                   switch (block.type) {
                     case 'h1':
                       return (
                         <h1 
                           key={block.id} 
                           style={customStyles}
                           className={`font-black text-slate-955 tracking-tight pt-4 border-b border-slate-100 pb-2 ${sizeClass || 'text-3.5xl sm:text-4xl'}`}
                         >
                           {block.content}
                         </h1>
                       );
                     case 'h2':
                       return (
                         <h2 
                           key={block.id} 
                           style={customStyles}
                           className={`font-extrabold text-slate-900 tracking-tight pt-3 ${sizeClass || 'text-2xl sm:text-3xl'}`}
                         >
                           {block.content}
                         </h2>
                       );
                     case 'h3':
                       return (
                         <h3 
                           key={block.id} 
                           style={customStyles}
                           className={`font-bold text-slate-900 tracking-tight pt-2 ${sizeClass || 'text-xl sm:text-2xl'}`}
                         >
                           {block.content}
                         </h3>
                       );
                     case 'paragraph':
                       return (
                         <p 
                           key={block.id} 
                           style={customStyles}
                           className={`leading-relaxed whitespace-pre-line ${sizeClass || 'text-slate-650 text-sm'}`}
                         >
                           {block.content}
                         </p>
                       );
                     case 'list':
                       return (
                         <ul 
                           key={block.id} 
                           style={customStyles}
                           className={`list-disc pl-5 space-y-2 font-semibold text-slate-700 ${sizeClass || 'text-xs'}`}
                         >
                           {block.content.split('\n').map((item, i) => (
                             <li key={i}>{item.replace(/^-\s*/, '')}</li>
                           ))}
                         </ul>
                       );
                     case 'quote':
                       return (
                         <blockquote 
                           key={block.id} 
                           style={customStyles}
                           className={`border-l-4 border-blue-500 pl-4 py-1.5 my-4 italic text-slate-700 bg-slate-50/50 rounded-r-xl pr-3 font-medium ${sizeClass || 'text-xs sm:text-sm'}`}
                         >
                           "{block.content}"
                         </blockquote>
                       );
                     case 'code':
                       return (
                         <pre 
                           key={block.id} 
                           style={customStyles}
                           className={`p-4 rounded-2xl overflow-x-auto font-mono leading-relaxed max-w-full ${sizeClass || 'bg-slate-900 text-slate-200 text-xs'}`}
                         >
                           <code>{block.content}</code>
                         </pre>
                       );
                    case 'image':
                      return block.mediaUrl ? (
                        <div key={block.id} className="my-6 space-y-2">
                          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[400px]">
                            <img
                              src={block.mediaUrl}
                              alt={block.content || 'Article Image'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {block.content && (
                            <span className="block text-[10px] text-center text-slate-455 font-bold uppercase tracking-wider">{block.content}</span>
                          )}
                        </div>
                      ) : null;
                    case 'video':
                      return block.mediaUrl ? (
                        <div key={block.id} className="my-6 space-y-2">
                          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 relative aspect-[16/9]">
                            <video
                              src={block.mediaUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {block.content && (
                            <span className="block text-[10px] text-center text-slate-455 font-bold uppercase tracking-wider">{block.content}</span>
                          )}
                        </div>
                      ) : null;
                    case 'youtube':
                      if (!block.content) return null;
                      // Parse youtube URL to get video ID
                      let videoId = '';
                      try {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        const match = block.content.match(regExp);
                        videoId = (match && match[2].length === 11) ? match[2] : '';
                      } catch (e) {}
                      
                      return videoId ? (
                        <div key={block.id} className="my-6 rounded-2xl overflow-hidden shadow-sm aspect-video border border-slate-200 bg-slate-900">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <p key={block.id} className="text-xxs text-red-500 font-semibold">Invalid YouTube embed link</p>
                      );
                    case 'instagram':
                      return (
                        <div key={block.id} className="my-6 p-5 border border-slate-200 rounded-3xl bg-slate-50 flex items-center justify-between gap-4 max-w-sm mx-auto shadow-xxs">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-pink-650 bg-pink-50 px-2 py-0.5 rounded uppercase tracking-wider">Instagram Feed</span>
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{block.content || 'View our latest updates'}</p>
                          </div>
                          <a 
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-gradient-to-tr from-yellow-500 to-pink-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] tracking-wide uppercase shrink-0"
                          >
                            View Post
                          </a>
                        </div>
                      );
                    case 'newsletter':
                      return (
                        <div key={block.id} className="my-8 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xxs text-center">
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 text-[9px] font-black text-indigo-650 bg-indigo-50 rounded-lg uppercase tracking-wider">Newsletter subscription</span>
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{block.content || 'Join Our Exclusive Newsletter'}</h4>
                            <p className="text-slate-500 text-xxs font-semibold">Get premium road safety insights and local driving rules updates once a week.</p>
                          </div>

                          {newsletterSubscribed ? (
                            <div className="bg-emerald-50 border border-emerald-150 rounded-2xl py-3 px-4 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold max-w-sm mx-auto animate-fadeIn">
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                              Thank you for subscribing!
                            </div>
                          ) : (
                            <form onSubmit={handleNewsletterCTA} className="flex gap-2 max-w-sm mx-auto">
                              <input
                                type="email"
                                required
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                className="flex-grow border border-slate-250 bg-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                                placeholder="Enter your email"
                              />
                              <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4.5 py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                              >
                                Join
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    case 'separator':
                      return <hr key={block.id} className="my-6 border-t-2 border-slate-200" />;
                    case 'spacer':
                      return <div key={block.id} style={{ height: `${parseInt(block.content || '40')}px` }} />;
                    case 'table':
                      return (
                        <div key={block.id} className="overflow-x-auto border border-slate-200 rounded-2xl bg-white my-4 shadow-xxs">
                          <table className="w-full text-xs text-slate-700 text-left border-collapse">
                            <tbody>
                              {block.content.split('\n').map((rowText, rIdx) => (
                                <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                  {rowText.split('|').map((colText, cIdx) => (
                                    <td key={cIdx} className="p-3 border-r border-slate-100 last:border-0 font-medium">
                                      {colText.trim()}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    case 'yoast-breadcrumbs':
                      return (
                        <div key={block.id} className="text-xs text-slate-500 font-semibold my-3">
                          <span className="text-[#2271b1] hover:underline cursor-pointer">Home</span>
                          <span className="mx-1.5 text-slate-400">/</span>
                          <span className="text-[#2271b1] hover:underline cursor-pointer">Blog</span>
                          <span className="mx-1.5 text-slate-400">/</span>
                          <span className="font-bold text-slate-800">{selectedPost.title}</span>
                        </div>
                      );
                    case 'yoast-reading-time': {
                      const text = selectedPost.blocks.map(b => b.content).join(' ');
                      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                      const readTime = Math.max(1, Math.round(words / 200));
                      return (
                        <div key={block.id} className="text-xs font-bold text-slate-500 flex items-center gap-1.5 my-3 bg-slate-50 p-3 rounded-xl border border-slate-200 max-w-xs">
                          <span>⏱</span>
                          <span>{readTime} min read ({words} words total)</span>
                        </div>
                      );
                    }
                    case 'yoast-toc': {
                      const headings = selectedPost.blocks.filter(b => ['h1', 'h2', 'h3'].includes(b.type));
                      return (
                        <div key={block.id} className="border border-slate-200 bg-slate-50/50 p-5 rounded-2xl my-6">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Table of Contents</h4>
                          {headings.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-[#2271b1] font-semibold space-y-1">
                              {headings.map((h, idx) => (
                                <li key={idx} className="hover:underline cursor-pointer">
                                  {h.content}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[10px] text-slate-405 italic">No headings found.</p>
                          )}
                        </div>
                      );
                    }
                    case 'yoast-faq': {
                      let items = [];
                      try {
                        items = JSON.parse(block.content || '[]');
                      } catch(e) {}
                      return (
                        <div key={block.id} className="space-y-4 my-6">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl space-y-1.5 text-left">
                              <h4 className="text-xs font-black text-slate-900">Q: {item.q}</h4>
                              <p className="text-xs text-slate-600 leading-relaxed">A: {item.a}</p>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    case 'yoast-howto': {
                      let data = { title: '', steps: [] };
                      try {
                        data = JSON.parse(block.content || '{"title":"","steps":[]}');
                      } catch(e) {}
                      return (
                        <div key={block.id} className="border border-slate-200 p-5 rounded-2xl bg-white space-y-4 my-6 shadow-xxs">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{data.title || 'How-to Steps'}</h4>
                          <div className="space-y-3">
                            {data.steps.map((step: string, idx: number) => (
                              <div key={idx} className="flex gap-2">
                                <span className="text-[11px] font-black text-[#2271b1] shrink-0 bg-blue-50 w-5 h-5 rounded-full flex items-center justify-center">{idx + 1}</span>
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    case 'yoast-ai-summarize':
                      return (
                        <div key={block.id} className="border border-purple-200 bg-purple-50/10 p-4.5 rounded-2xl my-4 italic text-slate-705">
                          <span className="text-[9px] font-black text-purple-700 uppercase tracking-widest block mb-1">AI Summary Overview</span>
                          "{block.content}"
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>

              {/* Tags block */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center mr-1">Tags:</span>
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t border-slate-100 pt-8 space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-slate-500" />
                  Comments ({(selectedPost.comments || []).filter(c => c.isApproved).length})
                </h3>

                {/* Status indicator msg */}
                {commentStatusMsg && (
                  <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                    commentStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-750 border border-red-155'
                  }`}>
                    <AlertCircle className="h-4.5 w-4.5" />
                    {commentStatusMsg.text}
                  </div>
                )}

                {/* Form comment */}
                <form onSubmit={handleCommentSubmit} className="bg-slate-50/50 border border-slate-200 rounded-3xl p-5 space-y-4">
                  <p className="text-xxs font-bold text-slate-500 uppercase tracking-wide">Leave a Reply</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Name *"
                      className="border border-slate-250 bg-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="email"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="border border-slate-250 bg-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <textarea
                    rows={3}
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type your comment here *"
                    className="w-full border border-slate-250 bg-white rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  />

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="h-4 w-4" />
                    Post Comment
                  </button>
                </form>

                {/* Comments Listing */}
                <div className="space-y-4">
                  {(selectedPost.comments || [])
                    .filter(c => c.isApproved)
                    .map((comm) => (
                      <div key={comm.id} className="border-b border-slate-50 pb-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-black uppercase">
                              {comm.authorName.charAt(0)}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{comm.authorName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{comm.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 pl-8 leading-relaxed font-medium">{comm.content}</p>

                        {/* Admin replies listing nested */}
                        {comm.adminReplies && comm.adminReplies.map((rep) => (
                          <div key={rep.id} className="pl-8 pt-2 space-y-2">
                            <div className="bg-blue-50/50 border-l-2 border-blue-400 p-3 rounded-r-xl space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-blue-650 uppercase tracking-wider flex items-center gap-1">
                                  <Award className="h-3.5 w-3.5 text-blue-500" />
                                  {rep.adminName} (Admin Reply)
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold">{rep.createdAt}</span>
                              </div>
                              <p className="text-xs text-slate-650 leading-relaxed font-medium">{rep.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                  {(selectedPost.comments || []).filter(c => c.isApproved).length === 0 && (
                    <p className="text-xxs text-slate-400 font-bold uppercase tracking-widest text-center py-2">No comments published yet.</p>
                  )}
                </div>
              </div>

            </article>

            {/* Sidebar widgets panel (4 cols) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Widget 1: Author bio card */}
              {selectedPost.authorName && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">About the Author</h4>
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-slate-800">{selectedPost.authorName}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{selectedPost.authorBio || 'Certified Senior Instructor at UpDrive Driving School.'}</p>
                  </div>
                </div>
              )}

              {/* Widget 2: Related articles */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">Related Articles</h4>
                
                <div className="space-y-3">
                  {(() => {
                    let related: BlogPost[] = [];
                    // 1. Try manual picks
                    if (selectedPost.relatedPostIds && selectedPost.relatedPostIds.length > 0) {
                      selectedPost.relatedPostIds.forEach(id => {
                        const match = blogs.find(b => b.id === id);
                        if (match && match.id !== selectedPost.id) related.push(match);
                      });
                    }
                    // 2. Try auto picks from same category
                    if (related.length < 2) {
                      const sameCat = blogs.filter(b => 
                        b.id !== selectedPost.id && 
                        !related.some(r => r.id === b.id) &&
                        (b.category === selectedPost.category || (b.categories && selectedPost.categories && b.categories.some(c => selectedPost.categories.includes(c))))
                      );
                      related = [...related, ...sameCat];
                    }
                    // 3. Global fallback
                    if (related.length < 2) {
                      const remaining = blogs.filter(b => 
                        b.id !== selectedPost.id && 
                        !related.some(r => r.id === b.id)
                      );
                      related = [...related, ...remaining];
                    }

                    const finalRelated = related.slice(0, 2);

                    if (finalRelated.length === 0) {
                      return <p className="text-xxs text-slate-400 font-bold uppercase tracking-widest text-center py-2">No other posts yet.</p>;
                    }

                    return finalRelated.map((rel) => (
                      <div 
                        key={rel.id} 
                        onClick={() => handleSelectPost(rel)}
                        className="group flex gap-3 cursor-pointer items-center border-b border-slate-50 pb-2.5 last:border-0 last:pb-0"
                      >
                        {rel.coverImage && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-150">
                            <img src={rel.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{rel.title}</p>
                          <span className="text-[9px] text-slate-400 font-bold">{rel.createdAt}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Widget 3: Popular Articles widget */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">Popular Articles</h4>
                
                <div className="space-y-3">
                  {popularPosts.map((pop, idx) => (
                    <div 
                      key={pop.id} 
                      onClick={() => handleSelectPost(pop)}
                      className="group flex gap-3 cursor-pointer items-center border-b border-slate-50 pb-2.5 last:border-0 last:pb-0"
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 border border-slate-150 flex items-center justify-center text-[10px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{pop.title}</p>
                        <span className="text-[9px] text-slate-400 font-bold">{pop.views || 0} Views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        ) : (
          
          /* ========================================================================= */
          /* BLOG LISTINGS VIEW */
          /* ========================================================================= */
          <div className="space-y-10">
            
            {/* Header Intro */}
            <div className="text-center space-y-4 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
                UpDrive Blog
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Insights for Confident Driving
              </h1>
              <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
                Expert tips, driving guidance, and industry news directly from our certified instructors to help you master steering, parking, and traffic.
              </p>
            </div>

            {/* Filter Tool bar (Search + Categories & Tags filters) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Search */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search driving tips, parking techniques..."
                  className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category selector */}
              <div className="md:col-span-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-455 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">Category: All</option>
                  {allCategories.filter(c => c !== 'All').map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tag selector */}
              <div className="md:col-span-3 flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-455 shrink-0" />
                <select
                  value={selectedTag}
                  onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">Tag: All</option>
                  {allTags.filter(t => t !== 'All').map((tag, i) => (
                    <option key={i} value={tag}>#{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Layout container grid (Main posts + Sidebar popular) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Main List column (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Featured Post Hero Card (Only if no search filter is active and page is 1) */}
                {featuredPost && currentPage === 1 && (
                  <div 
                    onClick={() => handleSelectPost(featuredPost)}
                    className="bg-white border border-slate-250 hover:border-blue-300 rounded-3xl overflow-hidden transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col group animate-fadeIn"
                  >
                    {/* Large Featured Image */}
                    {featuredPost.coverImage && (
                      <div className="aspect-[21/9] w-full bg-slate-100 border-b border-slate-100 overflow-hidden relative">
                        <img 
                          src={featuredPost.coverImage} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                        />
                        <span className="absolute top-4 left-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg">
                          ★ Featured Post
                        </span>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6 sm:p-8 space-y-3">
                      <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 uppercase">
                        <span>{featuredPost.createdAt}</span>
                        <span>•</span>
                        <span>{calculateReadingTime(featuredPost)}</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt ? (
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold line-clamp-2">
                          {featuredPost.excerpt}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold line-clamp-2">
                          {featuredPost.blocks.find(b => b.type === 'paragraph')?.content || ''}
                        </p>
                      )}
                      
                      <div className="pt-2 flex items-center gap-1 text-[11px] font-black text-blue-650 group-hover:translate-x-1 transition-transform self-start">
                        Read Featured Article
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Standard Posts Grid list */}
                {currentPosts.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
                    <p className="text-slate-500 font-semibold text-sm">No blog posts match your filters. Try clearing filters!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {currentPosts.map((post) => {
                      const firstParagraph = post.blocks.find(b => b.type === 'paragraph')?.content || '';
                      const previewText = post.excerpt || (firstParagraph.length > 130 ? firstParagraph.slice(0, 130) + '...' : firstParagraph);

                      return (
                        <div
                          key={post.id}
                          onClick={() => handleSelectPost(post)}
                          className="bg-white border border-slate-200 hover:border-slate-350 rounded-3xl overflow-hidden transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col group animate-fadeIn"
                        >
                          {/* Image Thumbnail */}
                          <div className="aspect-[16/10] w-full bg-slate-100 border-b border-slate-100 overflow-hidden relative">
                            {post.coverImage ? (
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-50">
                                <FileText className="h-10 w-10" />
                              </div>
                            )}
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[9px] font-black text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                              {post.createdAt}
                            </span>
                            {post.isPinned && (
                              <span className="absolute top-3 right-3 bg-blue-50 text-blue-650 text-[9px] font-black px-2 py-0.5 rounded border border-blue-150">
                                ★ Pinned
                              </span>
                            )}
                          </div>

                          {/* Summary Content */}
                          <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                <Clock className="h-3 w-3" />
                                {calculateReadingTime(post)}
                              </div>
                              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
                                {post.title}
                              </h3>
                              {previewText && (
                                <p className="text-xxs sm:text-xs text-slate-500 leading-relaxed font-semibold line-clamp-3">
                                  {previewText}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 group-hover:translate-x-1 transition-transform self-start">
                              Read Article
                              <ChevronRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xxs transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-xl text-xxs font-black transition-all cursor-pointer ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xxs transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}

              </div>

              {/* Sidebar column (4 cols) */}
              <aside className="lg:col-span-4 space-y-6">
                
                {/* Widget 1: Categories filter list widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">Filter by Category</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allCategories.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-xl text-xxs font-bold transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 font-black'
                            : 'bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Widget 2: Tags cloud widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">Popular Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedTag(tag); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-xl text-xxs font-bold transition-all cursor-pointer ${
                          selectedTag === tag
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-250 font-black'
                            : 'bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tag === 'All' ? 'All Tags' : `#${tag}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Widget 3: Popular/Most Read articles widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">Most Read Articles</h4>
                  
                  <div className="space-y-3">
                    {popularPosts.map((pop, idx) => (
                      <div 
                        key={pop.id} 
                        onClick={() => handleSelectPost(pop)}
                        className="group flex gap-3 cursor-pointer items-center border-b border-slate-50 pb-2.5 last:border-0 last:pb-0"
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 border border-slate-150 flex items-center justify-center text-[10px] font-black shrink-0">
                          {idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{pop.title}</p>
                          <span className="text-[9px] text-slate-400 font-bold">{pop.views || 0} Views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </aside>

            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onShowTerms={() => setShowTermsModal(true)} />
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}
