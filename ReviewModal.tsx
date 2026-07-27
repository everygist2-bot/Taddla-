import React, { useState } from 'react';
import { X, Star, Upload, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Review } from './types';
import { submitReview } from './api';

interface ReviewModalProps {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
  onReviewSubmitted: (review: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  product,
  onClose,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [proInput, setProInput] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  
  const [conInput, setConInput] = useState('');
  const [cons, setCons] = useState<string[]>([]);

  const [recommend, setRecommend] = useState(true);
  const [datePurchased, setDatePurchased] = useState(new Date().toISOString().split('T')[0]);
  const [usageDuration, setUsageDuration] = useState('3 months');
  const [videoUrl, setVideoUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddPro = () => {
    if (proInput.trim()) {
      setPros([...pros, proInput.trim()]);
      setProInput('');
    }
  };

  const handleAddCon = () => {
    if (conInput.trim()) {
      setCons([...cons, conInput.trim()]);
      setConInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setErrorMsg('Title and review content are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await submitReview({
      productId: product.id,
      rating,
      title,
      content,
      pros,
      cons,
      recommend,
      photos: [],
      videoUrl: videoUrl || undefined,
      datePurchased,
      usageDuration
    });

    setIsSubmitting(false);

    if (res.success && res.review) {
      onReviewSubmitted(res.review);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Verified Feedback
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Review {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Star Rating Bar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                {rating}.0 out of 5
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Headline / Summary Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Excellent battery life, but camera software needs update"
              className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Detailed Review */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Experience *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your day-to-day experience, build quality, performance, and value for money..."
              className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Pros & Cons Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                Add Pros
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={proInput}
                  onChange={(e) => setProInput(e.target.value)}
                  placeholder="e.g. Battery lasts 2 days"
                  className="flex-1 py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddPro}
                  className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-1">
                {pros.map((p, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                    <span>• {p}</span>
                    <button type="button" onClick={() => setPros(pros.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                Add Cons
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={conInput}
                  onChange={(e) => setConInput(e.target.value)}
                  placeholder="e.g. Takes 2 hours to charge"
                  className="flex-1 py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCon}
                  className="px-3 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-1">
                {cons.map((c, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg">
                    <span>• {c}</span>
                    <button type="button" onClick={() => setCons(cons.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Metadata Row: Date & Usage Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Purchased / Subscribed
              </label>
              <input
                type="date"
                value={datePurchased}
                onChange={(e) => setDatePurchased(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                How long have you used it?
              </label>
              <select
                value={usageDuration}
                onChange={(e) => setUsageDuration(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="1 week">1 week</option>
                <option value="1 month">1 month</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="2+ years">2+ years</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={recommend}
              onChange={(e) => setRecommend(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Yes, I would recommend this product / service to others.
            </span>
          </label>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
          )}

          {/* Submit Row */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Publishing Review...' : 'Publish Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
