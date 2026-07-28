import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { voteHelpful } from '../api'; // adjust path to match where api.ts lives relative to this component

interface HelpfulButtonProps {
  reviewId: string;
  initialHelpfulCount: number;
}

export default function HelpfulButton({ reviewId, initialHelpfulCount }: HelpfulButtonProps) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHelpfulClick = async () => {
    if (voted || loading) return;

    // Optimistic update + immediate lock so the user can't spam the button
    setVoted(true);
    setLoading(true);
    setHelpfulCount(prev => prev + 1);

    const data = await voteHelpful(reviewId);

    if (data.success) {
      // Sync with the authoritative server count (in case of concurrent votes)
      setHelpfulCount(data.helpfulCount);
    } else {
      console.error('Helpful vote failed:', data.error);
      // Roll back on failure so the count/button stay honest
      setHelpfulCount(prev => prev - 1);
      setVoted(false);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleHelpfulClick}
      disabled={voted || loading}
      aria-pressed={voted}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        voted
          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 cursor-default'
          : 'border-stone-300 text-stone-600 hover:border-indigo-400 hover:text-indigo-600'
      }`}
    >
      <ThumbsUp size={14} className={voted ? 'fill-indigo-600' : ''} />
      Helpful ({helpfulCount})
    </button>
  );
}
