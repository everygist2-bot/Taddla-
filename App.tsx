import React, { useState, useEffect } from 'react';
import { Product, Review, User, ProductQA } from './types';
import {
  fetchProducts,
  fetchReviews,
  fetchQAs,
  getAISummary
} from './api';

import Navbar from './Navbar';
import HeroSection from './HeroSection';
import TrendingProductsSection from './TrendingProductsSection';
import LatestReviewsSection from './LatestReviewsSection';
import ProductCard from './ProductCard';
import ProductPage from './ProductPage';
import AddProductModal from './AddProductModal';
import ReviewModal from './ReviewModal';
import TimelineUpdateModal from './TimelineUpdateModal';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import AdminDashboard from './AdminDashboard';
import AdminAuthModal from './AdminAuthModal';
import Footer from './Footer';
import FooterModals from './FooterModals';
import SEOHead  from './SEOHead';

import { CATEGORIES } from './mockData';

import { Search, Filter, SlidersHorizontal, ArrowUpDown, Sparkles, Plus, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // System theme state - automatically adapts to user's device theme settings
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    // Set initial match
    setDarkMode(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleChange);
      return () => (mediaQuery as any).removeListener(handleChange);
    }
  }, []);

  // Sync document root dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // App Navigation View: 'home' | 'product_details' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'product_details' | 'admin'>('home');

  // Active selected product (if in product_details view)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Global Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qas, setQAs] = useState<ProductQA[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'product' | 'service'>('all');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'reviews_desc' | 'authenticity'>('authenticity');

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('taddla_current_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error parsing saved user from localStorage:', e);
    }
    return {
      id: 'usr_demouser',
      username: 'DavidMiller',
      email: 'david@taddla.org',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      bio: 'Tech enthusiast & verified consumer since 2024.',
      joinedDate: 'Jan 2024',
      reviewCount: 8,
      helpfulVotesReceived: 42,
      badges: [
        { id: 'b1', name: 'Verified Purchaser', description: 'Submitted 5+ receipt-verified reviews', icon: 'ShieldCheck', color: 'bg-emerald-600' },
        { id: 'b2', name: 'Top Reviewer', description: 'Earned 20+ helpful votes from community', icon: 'Award', color: 'bg-amber-500' }
      ],
      followersCount: 34,
      followingCount: 12,
      level: 'Top Reviewer (Level 3)',
      provider: 'google',
      role: 'user'
    };
  });

  // Persist currentUser in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('taddla_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('taddla_current_user');
    }
  }, [currentUser]);

  // Modal Visibility States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [timelineTargetReview, setTimelineTargetReview] = useState<Review | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeFooterModal, setActiveFooterModal] = useState<string | null>(null);

  // Initial Data Fetching from API
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pData, rData, qData] = await Promise.all([
        fetchProducts(),
        fetchReviews(),
        fetchQAs()
      ]);
      setProducts(pData);
      setReviews(rData);
      setQAs(qData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = products
    .filter(p => {
      // Category Filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Type Filter
      if (selectedType !== 'all' && p.itemType !== selectedType) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesBarcode = p.barcode ? p.barcode.includes(q) : false;
        return matchesName || matchesBrand || matchesCat || matchesBarcode;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating_desc') return b.avgRating - a.avgRating;
      if (sortBy === 'reviews_desc') return b.totalReviews - a.totalReviews;
      return b.reviewAuthenticityScore - a.reviewAuthenticityScore;
    });

  // Handler when selecting a product to open its detail page
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setCurrentView('product_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler when voting helpful
  const handleVoteHelpful = async (reviewId: string) => {
    const updatedReviews = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    });
    setReviews(updatedReviews);
  };

  // Handler when a review is submitted
  const handleReviewSubmitted = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
    if (selectedProduct) {
      // Refresh selected product total reviews count
      setSelectedProduct({
        ...selectedProduct,
        totalReviews: selectedProduct.totalReviews + 1
      });
    }
    loadAllData();
  };

  // Handler to toggle/request Admin access
  const handleOpenAdmin = () => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSuccess = (adminUser: User) => {
    setCurrentUser(adminUser);
    setCurrentView('admin');
  };

  const handleExitAdminMode = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: 'user' });
    }
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <SEOHead
        currentView={currentView}
        selectedProduct={selectedProduct}
        selectedCategory={selectedCategory}
        reviews={reviews}
      />

      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenFilter={() => {
          setCurrentView('home');
          setTimeout(() => {
            const el = document.getElementById('catalog_section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setCurrentView('home');
          setTimeout(() => {
            const el = document.getElementById('catalog_section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') {
            setCurrentView('home');
          }
        }}
        onGoHome={() => {
          setCurrentView('home');
          setSelectedProduct(null);
          setSearchQuery('');
          setSelectedCategory('all');
        }}
        isAdminView={currentView === 'admin'}
      />

      {/* Main Body Content Router */}
      <main className="flex-grow">
        
        {/* VIEW 1: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            reviews={reviews}
            currentUser={currentUser}
            onAuthorizeAdmin={(adminUser) => setCurrentUser(adminUser)}
            onExitAdminMode={handleExitAdminMode}
            onBack={() => setCurrentView('home')}
            onUpdateProducts={loadAllData}
          />
        )}

        {/* VIEW 2: PRODUCT DETAILS PAGE */}
        {currentView === 'product_details' && selectedProduct && (
          <ProductPage
            product={selectedProduct}
            reviews={reviews.filter(r => r.productId === selectedProduct.id)}
            qas={qas.filter(q => q.productId === selectedProduct.id)}
            allProducts={products}
            onBack={() => {
              setCurrentView('home');
              setSelectedProduct(null);
            }}
            onOpenWriteReview={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setIsReviewModalOpen(true);
              }
            }}
            onOpenTimelineUpdate={(rev) => {
              setTimelineTargetReview(rev);
              setIsTimelineModalOpen(true);
            }}
            onSelectProduct={handleSelectProduct}
            onReportReviewSuccess={loadAllData}
            onUpdateProductData={loadAllData}
          />
        )}

        {/* VIEW 3: HOMEPAGE / DISCOVERY & SEARCH */}
        {currentView === 'home' && (
          <>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={(q) => setSearchQuery(q)}
              onSearchSubmit={() => {
                const el = document.getElementById('catalog_section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              totalProductsCount={products.length}
            />

            {/* Trending Products Carousel Section */}
            <TrendingProductsSection
              products={products}
              onSelectProduct={handleSelectProduct}
              onViewAll={() => {
                const el = document.getElementById('catalog_section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* MAIN DISCOVERY CATALOG & SEARCH RESULTS SECTION */}
            <section id="catalog_section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Header & Filter Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">
                    Global Community Database
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Verified Products & Services'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Showing {filteredProducts.length} items with AI authenticity scoring
                  </p>
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Inline Catalog Search Bar */}
                  <div className="relative flex items-center min-w-[220px] max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter catalog..."
                      className="w-full py-1.5 pl-8 pr-7 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {/* Type Filter */}
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                    <button
                      onClick={() => setSelectedType('all')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedType === 'all'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedType('product')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedType === 'product'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Products
                    </button>
                    <button
                      onClick={() => setSelectedType('service')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedType === 'service'
                          ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Services
                    </button>
                  </div>

                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="authenticity">Highest Authenticity</option>
                      <option value="rating_desc">Highest Rated</option>
                      <option value="reviews_desc">Most Reviewed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products Cards Grid */}
              {loading ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading catalog items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">No products or services found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search query or category filter, or upload a new item to the catalog.
                  </p>
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Product / Service</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              )}

            </section>

            {/* Latest Community Reviews Stream */}
            <LatestReviewsSection
              reviews={reviews}
              products={products}
              onSelectProduct={handleSelectProduct}
              onVoteHelpful={handleVoteHelpful}
            />
          </>
        )}

      </main>

      {/* Footer */}
      <Footer onOpenModal={(mName) => setActiveFooterModal(mName)} />

      {/* MODALS OVERLAYS */}
      
      {/* 1. Add Product / Service Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductCreated={(newProd) => {
          setProducts([newProd, ...products]);
          handleSelectProduct(newProd);
        }}
        onRedirectToExisting={(existingProd) => {
          handleSelectProduct(existingProd);
        }}
      />

      {/* 2. Review Modal */}
      {selectedProduct && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          product={selectedProduct}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* 3. Timeline Update Milestone Modal */}
      {timelineTargetReview && (
        <TimelineUpdateModal
          isOpen={isTimelineModalOpen}
          review={timelineTargetReview}
          onClose={() => {
            setIsTimelineModalOpen(false);
            setTimelineTargetReview(null);
          }}
          onTimelineUpdated={loadAllData}
        />
      )}

      {/* 4. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(usr) => setCurrentUser(usr)}
        onOpenAdmin={() => {
          setIsAuthModalOpen(false);
          setIsAdminAuthModalOpen(true);
        }}
      />

      {/* 4b. Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAdminAuthSuccess={handleAdminAuthSuccess}
      />

      {/* 5. User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          user={currentUser}
          userReviews={reviews.filter(r => r.userName === currentUser.username || r.userId === currentUser.id)}
          allProducts={products}
          onClose={() => setIsProfileModalOpen(false)}
          onSelectProduct={handleSelectProduct}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {/* 6. Footer Modals (About, Contact, Privacy, Terms, FAQ, Blog) */}
      <FooterModals
        modalName={activeFooterModal}
        onClose={() => setActiveFooterModal(null)}
      />

    </div>
  );
}
