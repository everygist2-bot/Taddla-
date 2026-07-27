import React, { useState } from 'react';
import { Flame, ArrowRight, Package, Server } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface TrendingProductsSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll: () => void;
}

export const TrendingProductsSection: React.FC<TrendingProductsSectionProps> = ({
  products,
  onSelectProduct,
  onViewAll
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'product' | 'service'>('all');

  const filteredProducts = products.filter(p => {
    if (activeTab === 'all') return true;
    return p.itemType === activeTab;
  }).slice(0, 8);

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Community Favorites</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
            Trending Products & Services
          </h2>
        </div>

        {/* Filter Tabs & View All */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('product')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'product'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'service'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Services</span>
            </button>
          </div>

          <button
            onClick={onViewAll}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-2"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onSelectProduct}
          />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-900/20"
        >
          <span>Explore All Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
