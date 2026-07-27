import React from 'react';
import { Star, ThumbsUp, ShieldCheck, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { Review, Product } from '../types';

interface LatestReviewsSectionProps {
  reviews: Review[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onVoteHelpful: (reviewId: string) => void;
}

export const LatestReviewsSection: React.FC<LatestReviewsSectionProps> = ({
  reviews,
  products,
  onSelectProduct,
  onVoteHelpful
}) => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 block">
          Community Stream
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
          Latest Verified Reviews
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Real consumer feedback updated live from around the globe.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.slice(0, 6).map(review => {
          const product = products.find(p => p.id === review.productId);

          return (
            <div
              key={review.id}
              className="flex flex-col justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* User Info Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {review.userName}
                        </span>
                        {review.userVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {review.userLevel}
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{review.rating}.0</span>
                  </div>
                </div>

                {/* Product Thumbnail Banner */}
                {product && (
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="flex items-center gap-3 p-2.5 mb-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer group"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        {product.brand}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {product.name}
                      </h4>
                    </div>
                  </div>
                )}

                {/* Review Title & Content */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 font-display line-clamp-1">
                  {review.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  "{review.content}"
                </p>

                {/* Timeline Milestone Indicator */}
                {review.timeline && review.timeline.length > 1 && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium mb-3">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <span>Includes {review.timeline.length} Long-term Milestones</span>
                  </div>
                )}
              </div>

              {/* Bottom Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span>Used for {review.usageDuration}</span>

                <button
                  onClick={() => onVoteHelpful(review.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
