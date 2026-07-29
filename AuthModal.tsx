import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from './types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onOpenAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenAdmin
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setErrorMsg('');
    setInfoMsg('');
    setDebugInfo('');
    setShowDebug(false);
  };

  // Builds a fresh profile document for a brand-new user
  const buildNewUserProfile = (uid: string, emailAddr: string, displayName: string, photoUrl: string, provider: User['provider']): User => {
    const isAdminAccount = emailAddr.toLowerCase() === 'taddlaofficial@gmail.com';

    return {
      id: uid,
      username: displayName || (emailAddr.split('@')[0] || 'TaddlaUser'),
      email: emailAddr,
      photo: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      bio: isAdminAccount ? 'Authorized Platform Administrator & Moderator.' : 'New verified reviewer on Taddla.',
      joinedDate: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      reviewCount: 0,
      helpfulVotesReceived: 0,
      badges: isAdminAccount
        ? [{ id: 'b_admin', name: 'Official Moderator', description: 'Verified Platform Administrator', icon: 'ShieldCheck', color: 'bg-purple-600' }]
        : [{ id: 'b_new', name: 'New Member', description: 'Joined the Taddla community', icon: 'ShieldCheck', color: 'bg-blue-600' }],
      followersCount: isAdminAccount ? 150 : 0,
      followingCount: isAdminAccount ? 20 : 0,
      level: isAdminAccount ? 'Platform Administrator' : 'New Reviewer',
      provider,
      role: isAdminAccount ? 'admin' : 'user'
    };
  };

  // Fetches the user's profile doc from Firestore, creating it if it doesn't exist yet
  const syncUserProfile = async (credential: UserCredential, fallbackUsername: string, provider: User['provider']): Promise<User> => {
    const fbUser = credential.user;
    const userRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return { id: fbUser.uid, ...(snap.data() as Omit<User, 'id'>) };
    }

    const newProfile = buildNewUserProfile(
      fbUser.uid,
      fbUser.email || email,
      fbUser.displayName || fallbackUsername,
      fbUser.photoURL || '',
      provider
    );

    await setDoc(userRef, {
      ...newProfile,
      createdAt: serverTimestamp()
    });

    return newProfile;
  };

  // Formats the raw error into readable text for the on-screen debug panel.
  // Not shown by default — surfaced only via "Show technical details".
  const formatDebugInfo = (err: any): string => {
    const parts = [
      `code: ${err?.code || 'n/a'}`,
      `message: ${err?.message || 'n/a'}`
    ];
    if (err?.customData?.appName) parts.push(`app: ${err.customData.appName}`);
    if (err?.name) parts.push(`name: ${err.name}`);
    return parts.join('\n');
  };

  const friendlyAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Incorrect email or password.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'unavailable':
      case 'firestore/unavailable':
        return 'Could not reach the server. Check your connection and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setDebugInfo('');
    setShowDebug(false);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && !username.trim()) {
      setErrorMsg('Please enter a username for your account.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim();

      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        // Set the Firebase Auth display name too, so it's available on future logins
        await updateProfile(credential.user, { displayName: username.trim() });
        // Fire-and-forget: don't block account creation on the verification email
        sendEmailVerification(credential.user).catch((e) =>
          console.error('Verification email failed to send:', e)
        );
        const user = await syncUserProfile(credential, username.trim(), 'email');
        onLoginSuccess(user);
      } else {
        const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = await syncUserProfile(credential, cleanEmail.split('@')[0], 'email');
        onLoginSuccess(user);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Auth error (email):', err?.code, err?.message, err);
      setErrorMsg(friendlyAuthError(err));
      setDebugInfo(formatDebugInfo(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setDebugInfo('');
    setShowDebug(false);

    if (!email || !email.includes('@')) {
      setErrorMsg('Enter your email address above first, then tap "Forgot password?".');
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err?.code, err?.message, err);
      setErrorMsg(friendlyAuthError(err));
      setDebugInfo(formatDebugInfo(err));
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setDebugInfo('');
    setShowDebug(false);
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const user = await syncUserProfile(credential, credential.user.displayName || 'GoogleReviewer', 'google');
      onLoginSuccess(user);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Auth error (google):', err?.code, err?.message, err);
      setErrorMsg(friendlyAuthError(err));
      setDebugInfo(formatDebugInfo(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apple sign-in is temporarily disabled until Apple auth is configured in Firebase Console.
  // const handleAppleAuth = async () => { ... };

  const handleGuestAuth = () => {
    const user: User = {
      id: `usr_guest_${Date.now()}`,
      username: 'Guest Reviewer',
      email: 'guest@taddla.org',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      bio: 'Exploring products as a guest consumer.',
      joinedDate: 'Today',
      reviewCount: 0,
      helpfulVotesReceived: 0,
      badges: [],
      followersCount: 0,
      followingCount: 0,
      level: 'Guest Account',
      isGuest: true,
      provider: 'guest',
      role: 'user'
    };
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
        
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {mode === 'login' ? 'Welcome Back' : 'Join Taddla'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access authentic global reviews, upload products, and earn reviewer badges.
          </p>
        </div>

        {/* Social Auth Buttons — intentionally kept outside the <form> below so it can
            never be treated as that form's submit trigger. */}
        <div className="space-y-2.5 mb-6">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/*
            Apple sign-in temporarily disabled — Apple provider is not yet
            configured in Firebase Console. Re-enable once set up:

            <button
              type="button"
              onClick={handleAppleAuth}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-black border border-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.62-1.92-14.42-6.14-3.23-2.76-7.15-7.42-11.77-13.98-6.02-8.54-10.82-17.97-14.41-28.32-3.59-10.35-5.39-20.35-5.39-30 0-14.86 3.8-27.12 11.41-36.78 7.61-9.66 17.18-14.58 28.71-14.76 4.82 0 10.02 1.15 15.6 3.46 5.58 2.31 9.38 3.5 11.41 3.57 1.83 0 5.72-1.28 11.67-3.84 5.95-2.56 10.99-3.72 15.12-3.48 11.41.6 20.73 4.88 27.96 12.83-10.15 6.15-15.12 14.85-14.9 26.1.22 8.78 3.46 16.2 9.72 22.26 6.26 6.06 13.9 9.8 22.92 11.22-2.12 6.53-4.83 12.87-8.13 19.02zM119.22 31.02c0-7.25 2.62-14.28 7.86-21.09 5.24-6.81 12.01-10.87 20.31-12.18.23 1.05.35 2.03.35 2.94 0 7.25-2.67 14.32-8.01 21.2-5.34 6.88-12.09 10.9-20.25 12.07-.12-.87-.26-1.85-.26-2.94z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          */}
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <span className="relative bg-white dark:bg-slate-800 px-3 text-[11px] font-semibold text-slate-400 uppercase">
            or continue with email
          </span>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
            <p>{errorMsg}</p>
            {debugInfo && (
              <>
                <button
                  type="button"
                  onClick={() => setShowDebug(!showDebug)}
                  className="mt-2 text-[10px] font-bold underline underline-offset-2 opacity-80 hover:opacity-100 cursor-pointer"
                >
                  {showDebug ? 'Hide technical details' : 'Show technical details'}
                </button>
                {showDebug && (
                  <pre className="mt-2 p-2 rounded-lg bg-rose-100/70 dark:bg-black/30 text-[10px] font-mono whitespace-pre-wrap break-words text-rose-800 dark:text-rose-200">
                    {debugInfo}
                  </pre>
                )}
              </>
            )}
          </div>
        )}

        {/* Info Message (e.g. password reset confirmation) */}
        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            {infoMsg}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. AlexReviewer"
                  className="w-full py-2.5 pl-9 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full py-2.5 pl-9 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isResetting}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-60"
                >
                  {isResetting ? 'Sending...' : 'Forgot password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 pl-9 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2.5 pl-9 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Mode & Guest Button */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className="text-slate-500 hover:text-blue-600 font-semibold cursor-pointer"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
          </button>

          <button
            type="button"
            onClick={handleGuestAuth}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium underline mt-1 cursor-pointer"
          >
            Continue as Guest
          </button>

          {onOpenAdmin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In as Platform Administrator</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
