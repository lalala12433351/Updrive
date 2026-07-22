import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, PlayCircle, Clock, ChevronRight } from 'lucide-react';
import { BlogPost } from '../types';
import { dataService } from '../services/dataService';
import Footer from './Footer';
import TermsModal from './TermsModal';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await dataService.getBlogs();
        // Load all published blogs sorted by date
        const published = data.filter(b => b.isPublished);
        setBlogs(published);

        // Detect if specific post slug is requested via URL path or search query
        // e.g. /blog/5-tips-overcome-driving-anxiety or /blog?slug=5-tips-overcome-driving-anxiety
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
          const match = published.find(b => b.slug === slug);
          if (match) {
            setSelectedPost(match);
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
    } else {
      document.title = "Driving Tips & News Blog | UpDrive";
    }
  }, [selectedPost]);

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    // Update window path for clean navigation history (pushState)
    const newPath = `/blog/${post.slug}`;
    window.history.pushState({ slug: post.slug }, '', newPath);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    window.history.pushState({}, '', '/blog');
  };

  return (
    <div className="min-h-screen bg-slate-55 flex flex-col text-slate-900 font-sans antialiased text-left">
      
      {/* Blog Portal Header */}
      <header className="bg-white border-b border-slate-200 py-6 sticky top-0 z-40">
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
      <main className="flex-grow py-12 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {isLoading ? (
          <div className="py-24 text-center text-slate-500 font-semibold animate-pulse">
            Loading articles...
          </div>
        ) : selectedPost ? (
          
          /* Blog Detail View */
          <article className="space-y-8 animate-fadeIn">
            {/* Header Area */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-650 bg-blue-50/70 px-2.5 py-1 rounded-md uppercase tracking-wider">
                <Calendar className="h-3 w-3 text-blue-500" />
                {selectedPost.createdAt}
              </span>
              <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {selectedPost.title}
              </h1>
            </div>

            {/* Cover Photo */}
            {selectedPost.coverImage && (
              <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                <img
                  src={selectedPost.coverImage}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Custom Content Blocks (H1, H2, H3, Paragraphs, Lists, Media) */}
            <div className="prose prose-blue max-w-none space-y-6">
              {selectedPost.blocks && selectedPost.blocks.map((block) => {
                switch (block.type) {
                  case 'h1':
                    return (
                      <h1 key={block.id} className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight pt-4">
                        {block.content}
                      </h1>
                    );
                  case 'h2':
                    return (
                      <h2 key={block.id} className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-3">
                        {block.content}
                      </h2>
                    );
                  case 'h3':
                    return (
                      <h3 key={block.id} className="text-lg font-bold text-slate-900 tracking-tight pt-2">
                        {block.content}
                      </h3>
                    );
                  case 'paragraph':
                    return (
                      <p key={block.id} className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">
                        {block.content}
                      </p>
                    );
                  case 'list':
                    return (
                      <ul key={block.id} className="list-disc pl-5 space-y-2 text-xs font-semibold text-slate-700">
                        {block.content.split('\n').map((item, i) => (
                          <li key={i}>{item.replace(/^-\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                  case 'image':
                    return block.mediaUrl ? (
                      <div key={block.id} className="my-6 space-y-2">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[400px]">
                          <img
                            src={block.mediaUrl}
                            alt=""
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
                  default:
                    return null;
                }
              })}
            </div>
            
            {/* CTA box at the end of post */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Ready to start driving confidently?</h4>
                <p className="text-slate-500 text-xs font-semibold">Join professional, calm and supportive sessions with UpDrive.</p>
              </div>
              <a
                href="/#booking"
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
              >
                Book Your Trial Session
              </a>
            </div>
          </article>
        ) : (
          
          /* Blog Listings View */
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

            {blogs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
                <p className="text-slate-500 font-semibold text-sm">No blog posts published yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {blogs.map((post) => {
                  // Get the first paragraph block content for a short preview description
                  const firstParagraph = post.blocks.find(b => b.type === 'paragraph')?.content || '';
                  const previewText = firstParagraph.length > 130 ? firstParagraph.slice(0, 130) + '...' : firstParagraph;

                  return (
                    <div
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
                      className="bg-white border border-slate-200 hover:border-slate-350 rounded-3xl overflow-hidden transition-all shadow-xs cursor-pointer flex flex-col group"
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
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <FileText className="h-12 w-12" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[9px] font-black text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                          {post.createdAt}
                        </span>
                      </div>

                      {/* Summary Content */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-base font-black text-slate-900 leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          {previewText && (
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
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
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onShowTerms={() => setShowTermsModal(true)} />
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}
