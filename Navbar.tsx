import React, { useState } from 'react';
import { Search, PlusCircle, ShieldCheck, User as UserIcon, SlidersHorizontal, Sparkles, LayoutDashboard, X } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenAddProduct: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenFilter: () => void;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onGoHome: () => void;
  isAdminView: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenAddProduct,
  onOpenProfile,
  onOpenAdmin,
  onOpenFilter,
  searchQuery,
  setSearchQuery,
  onGoHome,
  isAdminView
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white font-display">
                Taddla
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Global
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Products & Services Reviews
            </p>
          </div>
        </button>

        {/* Search Bar - Quick Header */}
        <div className="flex-1 max-w-xl relative hidden sm:block">
          <div className={`relative flex items-center rounded-full border transition-all duration-200 ${
            isSearchFocused 
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-slate-800 shadow-sm' 
              : 'border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}>
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search products, services, brands, barcodes..."
              className="w-full py-2 pl-2 pr-8 text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenFilter}
              title="Advanced Filters"
              className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Add Product Button */}
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>

          {/* Admin Switcher - Only visible to user with email puuzerm7@gmail.com or when in admin view */}
          {(currentUser?.email?.toLowerCase() === 'puuzerm7@gmail.com' || isAdminView) && (
            <button
              onClick={onOpenAdmin}
              title="Admin Portal (Authorized Admin: puuzerm7@gmail.com)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-sm hover:bg-purple-200 dark:hover:bg-purple-900/60"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Admin Portal</span>
            </button>
          )}

          {/* Auth / Profile Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 pl-1.5 pr-3 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-full bg-slate-50 dark:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <img
                src={currentUser.photo}
                alt={currentUser.username}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/30"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
                {currentUser.username}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>Log In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
