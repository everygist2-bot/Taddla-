import React, { useState } from 'react';
import { X, Award, ThumbsUp, Users, Calendar, ShieldCheck, CheckCircle2, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { User, Review, Product } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  user: User;
  userReviews: Review[];
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  userReviews,
  allProducts,
  onClose,
  onSelectProduct,
  onLogout
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followersCount);

  if (!isOpen) return null;

  const handleToggleFollow = () => {
    if (isFollowing) {
      setFollowersCount(followersCount - 1);
      setIsFollowing(false);
    } else {
      setFollowersCount(followersCount + 1);
      setIsFollowing(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Banner Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 text-center sm:text-left">
          <img
            src={user.photo}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-600/30 shadow-md shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                  {user.username}
                </h2>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {user.level}
                </span>
              </div>

              {!user.isGuest && (
                <button
                  onClick={handleToggleFollow}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isFollowing ? 'Following' : 'Follow Reviewer'}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {user.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {user.joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 mb-6 text-center">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Reviews</span>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">{userReviews.length}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Helpful Votes</span>
            <span className="font-extrabold text-lg text-blue-600 dark:text-blue-400">{user.helpfulVotesReceived}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Followers</span>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">{followersCount}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Following</span>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">{user.followingCount}</span>
          </div>
        </div>

        {/* Badges Section */}
        {user.badges && user.badges.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Earned Achievements & Badges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.badges.map(badge => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80"
                >
                  <div className={`p-2 rounded-lg ${badge.color} text-white shrink-0`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{badge.name}</h4>
                    <p className="text-[11px] text-slate-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Reviews List */}
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Recent Contributions ({userReviews.length})</span>
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {userReviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No public reviews written yet.</p>
            ) : (
              userReviews.map(rev => {
                const prod = allProducts.find(p => p.id === rev.productId);

                return (
                  <div
                    key={rev.id}
                    onClick={() => {
                      if (prod) {
                        onSelectProduct(prod);
                        onClose();
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {prod ? prod.name : 'Reviewed Item'}
                      </span>
                      <span className="text-xs font-bold text-amber-500">★ {rev.rating}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                      "{rev.title}"
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Logout Footer */}
        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-400">Taddla Authenticated ID</span>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};
