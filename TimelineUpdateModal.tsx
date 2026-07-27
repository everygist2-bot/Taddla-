import React, { useState } from 'react';
import { X, Clock, Star } from 'lucide-react';
import { Review } from './types';
import { addTimelineMilestone } from './api';

interface TimelineUpdateModalProps {
  isOpen: boolean;
  review: Review;
  onClose: () => void;
  onTimelineUpdated: () => void;
}

export const TimelineUpdateModal: React.FC<TimelineUpdateModalProps> = ({
  isOpen,
  review,
  onClose,
  onTimelineUpdated
}) => {
  const [periodLabel, setPeriodLabel] = useState('Month 6');
  const [rating, setRating] = useState(review.rating);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);
    const res = await addTimelineMilestone(review.id, {
      periodLabel,
      rating,
      note
    });
    setIsSubmitting(false);

    if (res.success) {
      onTimelineUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">
              Add Timeline Milestone
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Milestone Period
            </label>
            <select
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Month 1">Month 1 Update</option>
              <option value="Month 3">Month 3 Update</option>
              <option value="Month 6">Month 6 Update</option>
              <option value="Year 1">Year 1 Update</option>
              <option value="Year 2">Year 2 Update</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Updated Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-sm text-amber-600">{rating}★</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Long-term Experience Update *
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Month 6 check: Battery capacity still holds up well, but hinge mechanism feels a little squeaky..."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Milestone'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
