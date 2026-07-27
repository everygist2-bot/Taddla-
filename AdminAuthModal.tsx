import React, { useState } from 'react';
import { X, Lock, ShieldAlert, KeyRound, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthSuccess: (adminUser: User) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthSuccess
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  if (!isOpen) return null;

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    const customPass = localStorage.getItem('taddla_admin_passcode');
    const validPasscodes = ['admin123', 'admin', 'taddla2026'];
    if (customPass) {
      validPasscodes.unshift(customPass);
    }
    if (validPasscodes.includes(cleanPass)) {
      const adminUser: User = {
        id: 'usr_admin_master',
        username: 'System Administrator',
        email: 'admin@taddla.org',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        bio: 'Authorized Platform Moderator & Content Administrator',
        joinedDate: 'Jan 2024',
        reviewCount: 25,
        helpfulVotesReceived: 180,
        badges: [
          { id: 'b_admin', name: 'Official Moderator', description: 'Verified Platform Administrator', icon: 'ShieldCheck', color: 'bg-purple-600' }
        ],
        followersCount: 150,
        followingCount: 20,
        level: 'Platform Administrator',
        provider: 'email',
        role: 'admin'
      };
      
      setError('');
      setPasscode('');
      onAdminAuthSuccess(adminUser);
      onClose();
    } else {
      setError('Invalid admin passcode. Hint: Use "admin123" for demo access.');
    }
  };

  const handleQuickDemoAccess = () => {
    setPasscode('admin123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-purple-500/20 ring-4 ring-purple-100 dark:ring-purple-900/30">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Administrator Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Restricted access. Please enter your administrator passcode or security credentials to proceed.
          </p>
        </div>

        {/* Security Alert Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Passcode Form */}
        <form onSubmit={handleVerifyPasscode} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Security Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter passcode (e.g. admin123)"
                className="w-full py-2.5 pl-10 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Admin Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>
        </form>

        {/* Demo Hint & Quick Fill */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full text-xs text-slate-500">
            <span>Demo Passcode: <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-purple-600 dark:text-purple-400">admin123</code></span>
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
            >
              Autofill Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
