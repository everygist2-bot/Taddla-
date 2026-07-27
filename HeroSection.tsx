import React from 'react';
import { Search, PlusCircle, Sparkles, ShieldCheck, CheckCircle2, Camera, X } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenAddProduct: () => void;
  totalProductsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onOpenAddProduct,
  totalProductsCount
}) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-20 bg-gradient-to-b from-blue-50/50 via-indigo-50/30 to-transparent dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800">
      
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-400/20 via-indigo-500/20 to-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 shadow-sm text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Global Honest Reviews Engine &bull; AI Authenticity Verified</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.15] mb-4">
          Discover what real people think <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">before you buy.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Read honest reviews, upload products, and help others make smarter buying decisions.
        </p>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
            className="relative flex items-center p-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-500/30 dark:border-slate-700 shadow-xl shadow-indigo-500/5 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search millions of products and services..."
              className="w-full py-2.5 px-3 text-base text-slate-900 dark:text-white placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 mr-2 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors cursor-pointer shrink-0 shadow-md shadow-blue-500/20"
            >
              Search Reviews
            </button>
          </form>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Trending:</span>
            <button
              onClick={() => {
                setSearchQuery('iPhone 16');
                onSearchSubmit();
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
            >
              iPhone 16
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setSearchQuery('Starlink');
                onSearchSubmit();
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
            >
              Starlink Internet
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setSearchQuery('Revolut');
                onSearchSubmit();
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
            >
              Revolut Bank
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setSearchQuery('Emirates');
                onSearchSubmit();
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
            >
              Emirates Airlines
            </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onSearchSubmit}
            className="w-full sm:w-auto px-6 py-3 font-semibold text-sm text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            Search Reviews
          </button>
          <button
            onClick={onOpenAddProduct}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product or Service</span>
          </button>
        </div>

        {/* Platform Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto mt-10 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-xs font-medium">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Product Focused</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>AI Review Summarizer</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
            <Camera className="w-4 h-4 text-blue-500 shrink-0" />
            <span>AI Photo Recognition</span>
          </div>
        </div>

      </div>
    </section>
  );
};
