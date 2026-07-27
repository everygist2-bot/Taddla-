import React from 'react';
import { Star, ShieldCheck, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Top Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Item Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm backdrop-blur-md ${
            product.itemType === 'service'
              ? 'bg-purple-600/90 text-white'
              : 'bg-blue-600/90 text-white'
          }`}>
            {product.itemType}
          </span>
          {product.featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/90 text-white shadow-sm backdrop-blur-md">
              Featured
            </span>
          )}
        </div>

        {/* AI Authenticity Score Pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{product.reviewAuthenticityScore}% Trust</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="truncate">{product.brand}</span>
            <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">{product.category.replace('_', ' ')}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 font-display">
            {product.name}
          </h3>
        </div>

        {/* Rating and Reviews Count */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {product.avgRating}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({product.totalReviews} reviews)
            </span>
          </div>

          <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-xs group-hover:translate-x-0.5 transition-transform">
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

      </div>
    </div>
  );
};
