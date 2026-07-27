import React, { useState } from 'react';
import { X, Sparkles, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { CATEGORIES } from './mockData';
import { aiSuggestProduct, createProduct } from './api';
import { Product } from './types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
  onRedirectToExisting: (product: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
  onRedirectToExisting
}) => {
  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('electronics');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysisDone, setAiAnalysisDone] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Recognition Trigger
  const handleAISuggest = async () => {
    if (!imageBase64 && !imageUrl && !name) {
      setErrorMsg('Please upload an image or type a name to trigger AI auto-detection.');
      return;
    }

    setErrorMsg('');
    setIsAnalyzingAI(true);

    const res = await aiSuggestProduct({
      imageBase64: imageBase64 || undefined,
      promptText: name || description || undefined
    });

    setIsAnalyzingAI(false);

    if (res.success && res.result) {
      setName(res.result.productName || name);
      setBrand(res.result.brand || brand);
      setCategory(res.result.category || category);
      if (res.result.description) setDescription(res.result.description);
      setAiAnalysisDone(true);

      if (res.existingMatch) {
        setDuplicateMatch(res.existingMatch);
      }
    }
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand) {
      setErrorMsg('Product Name and Brand are required.');
      return;
    }

    const res = await createProduct({
      name,
      itemType,
      brand,
      category,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'
    });

    if (res.success) {
      if (res.isDuplicate && res.product) {
        onRedirectToExisting(res.product);
      } else if (res.product) {
        onProductCreated(res.product);
      }
      onClose();
    } else {
      setErrorMsg(res.message || 'Failed to add product');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Community Catalog Entry
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Add New Product or Service
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Product Alert Banner */}
        {duplicateMatch && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                This item already exists in our database!
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                Found matching entry: <span className="font-bold">{duplicateMatch.name} ({duplicateMatch.brand})</span>.
              </p>
              <button
                onClick={() => {
                  onRedirectToExisting(duplicateMatch);
                  onClose();
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
              >
                <span>Go to Existing Product Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Type Switcher */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setItemType('product')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                itemType === 'product'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Physical Product
            </button>
            <button
              type="button"
              onClick={() => setItemType('service')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                itemType === 'service'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Service or Subscription
            </button>
          </div>

          {/* Photo Upload & AI Auto-fill Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/40 dark:from-slate-900/80 dark:to-slate-900 border border-blue-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Product Image & AI Recognition
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Box */}
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={handleAISuggest}
                    disabled={isAnalyzingAI}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzingAI ? 'Analyzing Image...' : 'AI Auto-Detect'}</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL (e.g., https://...)"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {aiAnalysisDone && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AI auto-suggested details based on visual image!</span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product / Service Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5"
                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Sony"
                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key features or service details..."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{errorMsg}</p>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
            >
              Add to Catalog
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
