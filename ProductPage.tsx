import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Clock,
  ExternalLink,
  ThumbsUp,
  Flag,
  MessageSquare,
  Plus,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Bookmark,
  Building2,
  ShoppingBag,
  Tag,
  Send,
  Calendar
} from 'lucide-react';

import { Product, Review, ProductQA, TimelineEntry } from '../types';
import { voteHelpful, reportReview, askAIQuestion, getAISummary } from '../services/api';

interface ProductPageProps {
  product: Product;
  reviews: Review[];
  qas: ProductQA[];
  allProducts: Product[];
  onBack: () => void;
  onOpenWriteReview: () => void;
  onOpenTimelineUpdate: (review: Review) => void;
  onSelectProduct: (prod: Product) => void;
  onReportReviewSuccess: () => void;
  onUpdateProductData: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  reviews,
  qas,
  allProducts,
  onBack,
  onOpenWriteReview,
  onOpenTimelineUpdate,
  onSelectProduct,
  onReportReviewSuccess,
  onUpdateProductData
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'timeline' | 'qa' | 'where_to_buy'>('reviews');
  const [selectedImage, setSelectedImage] = useState(product.imageUrl);

  // Q&A State
  const [qaQuestion, setQaQuestion] = useState('');
  const [isAskingQA, setIsAskingQA] = useState(false);
  const [qaList, setQaList] = useState<ProductQA[]>(qas);

  // AI Summarize re-gen state
  const [isRegenSummary, setIsRegenSummary] = useState(false);
  const [currentAiSummary, setCurrentAiSummary] = useState(product.aiSummary);

  // Filters for reviews
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [reviewSort, setReviewSort] = useState<'helpful' | 'recent' | 'rating_desc'>('helpful');

  // Reported review modal state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Handle Q&A prompt submit
  const handleAskQuestion = async (customQuestion?: string) => {
    const qToAsk = customQuestion || qaQuestion;
    if (!qToAsk.trim()) return;

    setIsAskingQA(true);
    const res = await askAIQuestion(product.id, qToAsk);
    setIsAskingQA(false);

    if (res.success && res.qa) {
      setQaList([res.qa, ...qaList]);
      if (!customQuestion) setQaQuestion('');
    }
  };

  // Re-generate AI summary
  const handleRegenerateSummary = async () => {
    setIsRegenSummary(true);
    const res = await getAISummary(product.id);
    setIsRegenSummary(false);
    if (res.success && res.summary) {
      setCurrentAiSummary(res.summary.aiSummary);
      onUpdateProductData();
    }
  };

  // Filtered Reviews
  const filteredReviews = reviews
    .filter(r => (ratingFilter === 'all' ? true : Math.round(r.rating) === ratingFilter))
    .sort((a, b) => {
      if (reviewSort === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (reviewSort === 'rating_desc') {
        return b.rating - a.rating;
      }
      return b.helpfulCount - a.helpfulCount;
    });

  // Collect all timeline milestones from all reviews for this product
  const allTimelineMilestones = reviews.flatMap(r =>
    (r.timeline || []).map(tm => ({
      ...tm,
      userName: r.userName,
      userAvatar: r.userAvatar,
      reviewTitle: r.title
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Similar products in same category
  const similarProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                product.itemType === 'service' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {product.itemType}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === imgUrl ? 'border-blue-600 scale-95' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Details & Rating Summary */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Category & Brand */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              <Building2 className="w-4 h-4" />
              <span>{product.brand}</span>
              <span>&bull;</span>
              <span className="capitalize">{product.category.replace('_', ' ')}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mb-3">
              {product.name}
            </h1>

            {/* Ratings Header Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 px-3.5 py-1.5 rounded-full">
                <div className="flex items-center text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <span className="font-extrabold text-lg text-amber-700 dark:text-amber-300">
                  {product.avgRating}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  out of 5
                </span>
              </div>

              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Based on {product.totalReviews} authentic user reviews
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* AI Review Score Dashboard (4 Metrics) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                    AI Review Authenticity Matrix
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  Shield Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">Review Quality</span>
                  <span className="font-black text-lg text-blue-600 dark:text-blue-400">{product.reviewQualityScore}%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">Verified Buyer</span>
                  <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">{product.verifiedPurchaseScore}%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">Community Trust</span>
                  <span className="font-black text-lg text-indigo-600 dark:text-indigo-400">{product.communityTrustScore}%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">Authenticity</span>
                  <span className="font-black text-lg text-purple-600 dark:text-purple-400">{product.reviewAuthenticityScore}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onOpenWriteReview}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>

            {product.whereToBuy && product.whereToBuy.length > 0 && (() => {
              const topStore = product.whereToBuy.find(w => w.isPrimaryAffiliate || w.isAffiliate) || product.whereToBuy[0];
              return (
                <a
                  href={topStore.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all shadow-sm ${
                    topStore.isAffiliate
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {topStore.isAffiliate ? 'Get Offer on ' : 'Buy from '}
                    {topStore.storeName} ({topStore.price})
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              );
            })()}
          </div>

        </div>

      </div>

      {/* AI Summary Section with Pros & Cons */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/40 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-900 border border-blue-200/80 dark:border-slate-700/80 mb-12 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">
                AI Synthesis & Consensus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synthesized by Gemini from all verified user reviews
              </p>
            </div>
          </div>

          <button
            onClick={handleRegenerateSummary}
            disabled={isRegenSummary}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{isRegenSummary ? 'Analyzing...' : 'Refresh AI Summary'}</span>
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-6">
          "{currentAiSummary}"
        </p>

        {/* Pros & Cons Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-900/50">
            <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Key Pros Identified</span>
            </h4>
            <ul className="space-y-2">
              {product.pros.map((pro, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50">
            <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Key Cons Reported</span>
            </h4>
            <ul className="space-y-2">
              {product.cons.map((con, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs Row: Reviews | Product Timeline | AI Q&A | Where to Buy */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
        <nav className="flex gap-6 overflow-x-auto pb-1 text-sm font-bold">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reviews ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Long-Term Product Timeline ({allTimelineMilestones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'qa'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>AI Q&A & Advice ({qaList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('where_to_buy')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'where_to_buy'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Where to Buy ({product.whereToBuy.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: REVIEWS LIST */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          
          {/* Reviews Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Filter by Rating:</span>
              <button
                onClick={() => setRatingFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  ratingFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map(stars => (
                <button
                  key={stars}
                  onClick={() => setRatingFilter(stars)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    ratingFilter === stars
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{stars}★</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold">Sort:</span>
              <select
                value={reviewSort}
                onChange={(e: any) => setReviewSort(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium focus:outline-none"
              >
                <option value="helpful">Most Helpful</option>
                <option value="recent">Most Recent</option>
                <option value="rating_desc">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Review List items */}
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No reviews found matching this filter.</p>
              <button
                onClick={onOpenWriteReview}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
              >
                Be the first to write a review
              </button>
            </div>
          ) : (
            filteredReviews.map(review => (
              <div
                key={review.id}
                className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm transition-shadow"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {review.userName}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block font-medium">
                        {review.userLevel} &bull; Used for {review.usageDuration}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{review.rating}.0</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {review.createdAt}
                    </span>
                  </div>
                </div>

                {/* Review Title & Content */}
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-display mb-2">
                  {review.title}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {review.content}
                </p>

                {/* Pros / Cons Pill Lists */}
                {(review.pros.length > 0 || review.cons.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    {review.pros.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                          Pros:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {review.pros.join(' • ')}
                        </p>
                      </div>
                    )}
                    {review.cons.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                          Cons:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {review.cons.join(' • ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto mb-4">
                    {review.photos.map((pUrl, pIdx) => (
                      <img
                        key={pIdx}
                        src={pUrl}
                        alt="User review attachment"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                )}

                {/* Review Timeline Milestone Updates */}
                {review.timeline && review.timeline.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                          Experience Timeline Updates
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenTimelineUpdate(review)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        + Add Milestone Update
                      </button>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                      {review.timeline.map(tm => (
                        <div key={tm.id} className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-50 dark:ring-slate-900" />
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              {tm.periodLabel} Milestone
                            </span>
                            <span className="text-slate-400">{tm.date} &bull; Rating: {tm.rating}★</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                            "{tm.note}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Row Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={async () => {
                        await voteHelpful(review.id);
                        onUpdateProductData();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                      <span>Helpful ({review.helpfulCount})</span>
                    </button>

                    <button
                      onClick={() => onOpenTimelineUpdate(review)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Update Experience</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setReportingReviewId(review.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>

              </div>
            ))
          )}

        </div>
      )}

      {/* TAB 2: LONG-TERM PRODUCT TIMELINE VISUALIZER */}
      {activeTab === 'timeline' && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Product Longevity & Reliability Timeline</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              See how {product.name} holds up over months and years of ownership.
            </p>
          </div>

          {allTimelineMilestones.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p className="text-sm text-slate-500">No milestone updates submitted yet.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900">
              {allTimelineMilestones.map((tm, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-800 flex items-center justify-center text-[8px] text-white font-bold">
                    ✓
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img src={tm.userAvatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{tm.userName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                          {tm.periodLabel}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-500">{tm.rating}★ &bull; {tm.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      "{tm.note}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI Q&A ASSISTANT */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Ask Gemini AI Product Assistant</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Get immediate objective answers synthesized from consumer reviews and tech specifications.
            </p>

            {/* Suggested One-click Questions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleAskQuestion('Is this product worth buying?')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                "Is this product worth buying?"
              </button>
              <button
                onClick={() => handleAskQuestion('What problems do users report most?')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                "What problems do users report most?"
              </button>
              <button
                onClick={() => handleAskQuestion('Who is this product best for?')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                "Who is this product best for?"
              </button>
            </div>

            {/* Custom Question Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                placeholder="Ask any question about this product..."
                className="flex-1 py-2.5 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isAskingQA}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{isAskingQA ? 'Asking AI...' : 'Ask'}</span>
              </button>
            </form>
          </div>

          {/* Q&A Stream */}
          <div className="space-y-4">
            {qaList.map(qa => (
              <div key={qa.id} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Q: {qa.question}
                  </span>
                  <span className="text-[11px] text-slate-400">{qa.date}</span>
                </div>
                {qa.answer && (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-slate-900 border border-blue-100 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Taddla AI Answer:
                    </span>
                    {qa.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 4: WHERE TO BUY & PARTNER OFFERS */}
      {activeTab === 'where_to_buy' && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">
                Where to Buy & Verified Partner Deals
              </h3>
              <p className="text-xs text-slate-500">
                Compare verified pricing, direct store links, and special partner deals.
              </p>
            </div>
            {product.whereToBuy.some(w => w.isAffiliate) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Verified Partner Offers
              </span>
            )}
          </div>

          {product.whereToBuy.length === 0 ? (
            <p className="text-sm text-slate-500">No store pricing available at this time.</p>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {product.whereToBuy.map((store, sIdx) => (
                  <div key={sIdx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        store.isAffiliate
                          ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 dark:bg-blue-950 text-blue-600'
                      }`}>
                        {store.storeName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{store.storeName}</h4>
                          {store.isPrimaryAffiliate && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                              Featured Deal
                            </span>
                          )}
                          {store.isAffiliate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                              <Tag className="w-2.5 h-2.5" />
                              Partner Offer
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            {store.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {store.affiliateTag && (
                            <span className="text-[11px] text-slate-400">
                              &bull; via {store.affiliateTag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="font-black text-lg text-slate-900 dark:text-white">{store.price}</span>
                      <a
                        href={store.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-5 py-2.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
                          store.isAffiliate
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <span>{store.isAffiliate ? 'View Deal / Buy' : 'Visit Store'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commission Transparency Disclosure */}
              {product.whereToBuy.some(w => w.isAffiliate) && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-700 dark:text-slate-300">Affiliate & Referral Disclosure: </strong>
                  Taddla may receive a small referral commission at no additional cost to you when you make a purchase or sign up via partner offer links on this page. All product authenticity scores and consumer reviews remain 100% independent and unbiased.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SIMILAR PRODUCTS SECTION */}
      {similarProducts.length > 0 && (
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white font-display mb-6">
            Similar Products & Services
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map(sim => (
              <div
                key={sim.id}
                onClick={() => onSelectProduct(sim)}
                className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all cursor-pointer group"
              >
                <img
                  src={sim.imageUrl}
                  alt={sim.name}
                  className="w-full h-32 object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">{sim.brand}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mb-2">{sim.name}</h4>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-amber-500">★ {sim.avgRating}</span>
                  <span>{sim.totalReviews} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      {reportingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display mb-2">
              Report Review
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Help us maintain authentic reviews by reporting fake, offensive, or affiliate spam content.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportingReviewId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await reportReview(reportingReviewId, reportReason);
                  setReportingReviewId(null);
                  setReportReason('');
                  onReportReviewSuccess();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
