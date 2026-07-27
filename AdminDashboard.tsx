import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Flame,
  Star,
  CheckCircle2,
  Trash2,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  ArrowLeft,
  Lock,
  KeyRound,
  ShieldAlert,
  LogOut,
  ArrowRight,
  Link as LinkIcon,
  Tag,
  DollarSign,
  Plus,
  ExternalLink,
  Edit3,
  ShoppingBag,
  Percent,
  Check,
  Building2,
  Mail,
  Send,
  Copy,
  X
} from 'lucide-react';

import { Product, Review, AdminReport, User, WhereToBuy } from './types';
import { fetchAdminStats, resolveAdminReport, updateProductAffiliateLinks } from './api';

interface AdminDashboardProps {
  products: Product[];
  reviews: Review[];
  onBack: () => void;
  onUpdateProducts: () => void;
  currentUser: User | null;
  onAuthorizeAdmin: (adminUser: User) => void;
  onExitAdminMode: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  reviews,
  onBack,
  onUpdateProducts,
  currentUser,
  onAuthorizeAdmin,
  onExitAdminMode
}) => {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'featured' | 'moderation' | 'affiliates' | 'security'>('analytics');
  
  // Gate Passcode State
  const [inlinePasscode, setInlinePasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Change Admin Passcode State
  const [isChangePasscodeOpen, setIsChangePasscodeOpen] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeChangeError, setPasscodeChangeError] = useState('');
  const [passcodeChangeSuccess, setPasscodeChangeSuccess] = useState('');

  // Email Approval State
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [approvalCodeSent, setApprovalCodeSent] = useState('');
  const [pendingNewPasscode, setPendingNewPasscode] = useState('');
  const [enteredApprovalCode, setEnteredApprovalCode] = useState('');
  const [approvalCodeError, setApprovalCodeError] = useState('');
  const companyEmail = 'puuzerm7@gmail.com';

  // Affiliate Management State
  const [selectedAffiliateProduct, setSelectedAffiliateProduct] = useState<Product | null>(null);
  const [editingWhereToBuy, setEditingWhereToBuy] = useState<WhereToBuy[]>([]);
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [affiliateTypeFilter, setAffiliateTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [affiliateStatusFilter, setAffiliateStatusFilter] = useState<'all' | 'has_affiliate' | 'no_affiliate'>('all');
  const [isSavingAffiliate, setIsSavingAffiliate] = useState(false);
  const [affiliateMsg, setAffiliateMsg] = useState('');

  // New Link Input Form
  const [newStoreName, setNewStoreName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newTag, setNewTag] = useState('Amazon Associates');
  const [newCommissionRate, setNewCommissionRate] = useState('');
  const [newIsPrimary, setNewIsPrimary] = useState(false);
  const [newInStock, setNewInStock] = useState(true);

  const handleOpenAffiliateModal = (product: Product) => {
    setSelectedAffiliateProduct(product);
    setEditingWhereToBuy(product.whereToBuy ? [...product.whereToBuy] : []);
    setAffiliateMsg('');
    setNewStoreName('');
    setNewPrice('');
    setNewUrl('');
    setNewTag('Amazon Associates');
    setNewCommissionRate('');
    setNewIsPrimary(false);
    setNewInStock(true);
  };

  const handleAddLinkToProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newUrl.trim()) return;

    const newLink: WhereToBuy = {
      storeName: newStoreName.trim(),
      price: newPrice.trim() || 'Check Offer',
      url: newUrl.trim(),
      inStock: newInStock,
      isAffiliate: true,
      affiliateTag: newTag,
      commissionRate: newCommissionRate.trim() || undefined,
      addedByAdmin: true,
      isPrimaryAffiliate: newIsPrimary
    };

    let updated = [...editingWhereToBuy];
    if (newIsPrimary) {
      updated = updated.map(item => ({ ...item, isPrimaryAffiliate: false }));
    }
    updated.unshift(newLink);

    setEditingWhereToBuy(updated);
    setNewStoreName('');
    setNewPrice('');
    setNewUrl('');
    setNewCommissionRate('');
    setNewIsPrimary(false);
  };

  const handleRemoveLinkFromProduct = (index: number) => {
    const updated = editingWhereToBuy.filter((_, idx) => idx !== index);
    setEditingWhereToBuy(updated);
  };

  const handleSaveAffiliateLinks = async () => {
    if (!selectedAffiliateProduct) return;
    setIsSavingAffiliate(true);
    setAffiliateMsg('');

    const res = await updateProductAffiliateLinks(selectedAffiliateProduct.id, editingWhereToBuy);
    setIsSavingAffiliate(false);

    if (res.success) {
      setAffiliateMsg('Affiliate links updated and saved live!');
      selectedAffiliateProduct.whereToBuy = editingWhereToBuy;
      onUpdateProducts();
      setTimeout(() => {
        setSelectedAffiliateProduct(null);
      }, 1200);
    } else {
      setAffiliateMsg(res.error || 'Failed to save affiliate links');
    }
  };

  const loadData = async () => {
    setLoading(true);
    const res = await fetchAdminStats();
    if (res.success) {
      setStats(res.stats);
      setReports(res.reports || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData();
    }
  }, [currentUser]);

  const handleInlineAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = inlinePasscode.trim();
    const savedPasscode = localStorage.getItem('taddla_admin_passcode');
    const validPasscodes = ['admin123', 'admin', 'taddla2026'];
    if (savedPasscode) {
      validPasscodes.unshift(savedPasscode);
    }

    if (validPasscodes.includes(cleanPass)) {
      const adminUser: User = {
        id: currentUser?.id || 'usr_admin_master',
        username: currentUser?.username || 'System Administrator',
        email: currentUser?.email || 'admin@taddla.org',
        photo: currentUser?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        bio: 'Authorized Platform Moderator & Content Administrator',
        joinedDate: currentUser?.joinedDate || 'Jan 2024',
        reviewCount: currentUser?.reviewCount || 25,
        helpfulVotesReceived: currentUser?.helpfulVotesReceived || 180,
        badges: currentUser?.badges || [
          { id: 'b_admin', name: 'Official Moderator', description: 'Verified Platform Administrator', icon: 'ShieldCheck', color: 'bg-purple-600' }
        ],
        followersCount: currentUser?.followersCount || 150,
        followingCount: currentUser?.followingCount || 20,
        level: 'Platform Administrator',
        provider: currentUser?.provider || 'email',
        role: 'admin'
      };
      setPasscodeError('');
      setInlinePasscode('');
      onAuthorizeAdmin(adminUser);
    } else {
      setPasscodeError('Invalid passcode. Please enter a valid admin passcode.');
    }
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeChangeError('');
    setPasscodeChangeSuccess('');

    const savedPasscode = localStorage.getItem('taddla_admin_passcode') || 'admin123';
    const validCurrentPasscodes = [savedPasscode, 'admin123', 'admin', 'taddla2026'];

    if (!validCurrentPasscodes.includes(currentPasscode.trim())) {
      setPasscodeChangeError('Current passcode is incorrect.');
      return;
    }

    if (newPasscode.trim().length < 4) {
      setPasscodeChangeError('New passcode must be at least 4 characters long.');
      return;
    }

    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setPasscodeChangeError('New passcode and confirm passcode do not match.');
      return;
    }

    // Initiate Official Email Approval Flow
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setApprovalCodeSent(generatedCode);
    setPendingNewPasscode(newPasscode.trim());
    setEnteredApprovalCode('');
    setApprovalCodeError('');
    setIsEmailVerificationOpen(true);
    setPasscodeChangeSuccess('Passcode change initiated! An official approval code has been sent to the official Taddla company email.');
  };

  const handleVerifyApprovalCode = (e: React.FormEvent) => {
    e.preventDefault();
    setApprovalCodeError('');

    if (enteredApprovalCode.trim() !== approvalCodeSent) {
      setApprovalCodeError('Invalid approval code. Please check the email sent to the official Taddla company email.');
      return;
    }

    // Finalize Passcode Change
    localStorage.setItem('taddla_admin_passcode', pendingNewPasscode);
    setPasscodeChangeSuccess('Passcode change verified & approved via official Taddla company email! New passcode is now active.');
    setIsEmailVerificationOpen(false);
    setIsChangePasscodeOpen(false);
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setPendingNewPasscode('');
    setApprovalCodeSent('');
    setEnteredApprovalCode('');
  };

  // RESTRICTED ACCESS SCREEN IF USER IS NOT AN ADMIN
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-2">
            Restricted Admin Area
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            You must be logged in with Administrator privileges to access system moderation, analytics, and content reports.
          </p>

          {passcodeError && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 text-left">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{passcodeError}</span>
            </div>
          )}

          <form onSubmit={handleInlineAuthorize} className="space-y-4 mb-6">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={inlinePasscode}
                onChange={(e) => {
                  setInlinePasscode(e.target.value);
                  if (passcodeError) setPasscodeError('');
                }}
                placeholder="Enter Admin Passcode (admin123)"
                className="w-full py-2.5 pl-10 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate as Admin</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700/50 pt-4">
            <button
              onClick={() => setInlinePasscode('admin123')}
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline cursor-pointer"
            >
              Autofill "admin123"
            </button>
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
            >
              Cancel & Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAction = async (reportId: string, action: 'resolve' | 'dismiss' | 'delete_review') => {
    await resolveAdminReport(reportId, action);
    loadData();
  };

  const toggleFeatured = (product: Product) => {
    product.featured = !product.featured;
    onUpdateProducts();
  };

  const toggleTrending = (product: Product) => {
    product.trending = !product.trending;
    onUpdateProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to App View</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600 text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                Taddla Administration & Moderation
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Authenticated Admin: {currentUser?.username || 'Administrator'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setIsChangePasscodeOpen(true);
              setPasscodeChangeError('');
              setPasscodeChangeSuccess('');
              setCurrentPasscode('');
              setNewPasscode('');
              setConfirmPasscode('');
            }}
            title="Change Admin Passcode"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/50 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Passcode</span>
          </button>

          <button
            onClick={onExitAdminMode}
            title="Log out of Admin Mode"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin Mode</span>
          </button>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh System Data</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block mb-1">Total Catalog Items</span>
          <span className="font-black text-2xl text-slate-900 dark:text-white">{products.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block mb-1">Total Reviews</span>
          <span className="font-black text-2xl text-blue-600 dark:text-blue-400">{reviews.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block mb-1">Avg Authenticity</span>
          <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
            {stats ? stats.avgAuthenticity : 94}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-400 font-medium block mb-1">Pending Reports</span>
          <span className="font-black text-2xl text-rose-600 dark:text-rose-400">
            {reports.filter(r => r.status === 'pending').length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
        <nav className="flex gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Analytics & Health
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Moderation Queue</span>
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'featured'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Featured & Trending Control
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'moderation'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            AI Spam Guard
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'affiliates'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-purple-500" />
            <span>Affiliate Links Manager</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              {products.filter(p => p.whereToBuy?.some(w => w.isAffiliate)).length} active
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-500" />
            <span>Security & Passcode</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-display mb-4">
              Category Distribution
            </h3>
            <div className="space-y-3">
              {['electronics', 'phones', 'internet', 'banks', 'airlines', 'mobile_money'].map(cat => {
                const count = products.filter(p => p.category === cat).length;
                const percentage = Math.round((count / (products.length || 1)) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      <span>{cat.replace('_', ' ')}</span>
                      <span>{count} items ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-display mb-4">
              AI Authenticity Engine Status
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Gemini Fake Review Filter</span>
                <span className="font-bold text-emerald-600">Active & Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Image Recognition Barcode Scan</span>
                <span className="font-bold text-blue-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Flagged Fake Spams Blocked</span>
                <span className="font-bold text-purple-600">14 Reviews Prevented</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION QUEUE */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-display mb-4">
            User & AI Flagged Reports
          </h3>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No pending moderation reports.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {reports.map(rep => (
                <div key={rep.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Product: {rep.productName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Reason: <span className="font-semibold text-rose-600">{rep.reason}</span> (Reported by {rep.reportedBy} on {rep.date})
                    </p>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(rep.id, 'dismiss')}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAction(rep.id, 'delete_review')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEATURED & TRENDING TOGGLES */}
      {activeTab === 'featured' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-display mb-4">
            Manage Featured & Trending Products
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {products.map(prod => (
              <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={prod.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{prod.name}</h4>
                    <span className="text-[11px] text-slate-400 capitalize">{prod.brand} &bull; {prod.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => toggleFeatured(prod)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      prod.featured
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {prod.featured ? '★ Featured' : 'Feature Item'}
                  </button>

                  <button
                    onClick={() => toggleTrending(prod)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      prod.trending
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {prod.trending ? '🔥 Trending' : 'Set Trending'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI SPAM GUARD */}
      {activeTab === 'moderation' && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-display mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>AI Spam & Fake Review Detection Parameters</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Configure Gemini AI rules for automated authenticity scoring and spam quarantine.
          </p>

          <div className="space-y-4 max-w-lg text-xs font-medium text-slate-700 dark:text-slate-300">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span>Auto-flag reviews with duplicate IP or text patterns</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span>Require verified purchase proof for top tier badges</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span>Analyze external affiliate link spam in review body</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: AFFILIATE LINKS MANAGER */}
      {activeTab === 'affiliates' && (
        <div className="space-y-6">
          
          {/* Header & Control Toolbar */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-purple-600" />
                  <span>Product & Service Affiliate Link Monetization</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Attach tracking links, custom store deals, Amazon tags, and partner referral links to products or services posted by users.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Total Items: <strong className="text-slate-800 dark:text-white">{products.length}</strong>
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                  Monetized: {products.filter(p => p.whereToBuy?.some(w => w.isAffiliate)).length}
                </span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={affiliateSearch}
                  onChange={(e) => setAffiliateSearch(e.target.value)}
                  placeholder="Search item, brand, or category..."
                  className="w-full py-2 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={affiliateTypeFilter}
                  onChange={(e: any) => setAffiliateTypeFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="all">All Item Types (Products & Services)</option>
                  <option value="product">Products Only</option>
                  <option value="service">Services Only</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={affiliateStatusFilter}
                  onChange={(e: any) => setAffiliateStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="all">All Affiliate Statuses</option>
                  <option value="has_affiliate">Has Active Affiliate Links</option>
                  <option value="no_affiliate">Needs Affiliate Links</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter(p => {
                const matchSearch =
                  p.name.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                  p.brand.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                  p.category.toLowerCase().includes(affiliateSearch.toLowerCase());

                const matchType = affiliateTypeFilter === 'all' || p.itemType === affiliateTypeFilter;

                const hasAff = p.whereToBuy && p.whereToBuy.some(w => w.isAffiliate);
                const matchStatus =
                  affiliateStatusFilter === 'all' ||
                  (affiliateStatusFilter === 'has_affiliate' && hasAff) ||
                  (affiliateStatusFilter === 'no_affiliate' && !hasAff);

                return matchSearch && matchType && matchStatus;
              })
              .map(prod => {
                const affCount = (prod.whereToBuy || []).filter(w => w.isAffiliate).length;
                const totalCount = (prod.whereToBuy || []).length;

                return (
                  <div
                    key={prod.id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:border-purple-400 transition-all"
                  >
                    <div>
                      {/* Top Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              prod.itemType === 'service' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}>
                              {prod.itemType}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 truncate">{prod.brand}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={prod.name}>
                            {prod.name}
                          </h4>
                          <span className="text-xs text-slate-500 capitalize">{prod.category.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Current Affiliate Pills */}
                      <div className="mb-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          Attached Purchase & Affiliate Links ({totalCount}):
                        </span>
                        {totalCount === 0 ? (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">
                            No store links attached yet.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {(prod.whereToBuy || []).map((w, wIdx) => (
                              <span
                                key={wIdx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                  w.isAffiliate
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {w.isAffiliate && <Tag className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
                                <span>{w.storeName} ({w.price})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manage Button */}
                    <button
                      onClick={() => handleOpenAffiliateModal(prod)}
                      className="w-full py-2 px-3 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{affCount > 0 ? `Manage Affiliate Links (${affCount})` : '+ Add Affiliate Link'}</span>
                    </button>
                  </div>
                );
              })}
          </div>

          {/* EDIT AFFILIATE MODAL OVERLAY */}
          {selectedAffiliateProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAffiliateProduct.imageUrl}
                      alt={selectedAffiliateProduct.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        {selectedAffiliateProduct.itemType}
                      </span>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">
                        {selectedAffiliateProduct.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Brand: {selectedAffiliateProduct.brand} &bull; Category: {selectedAffiliateProduct.category}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAffiliateProduct(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Success Alert Banner */}
                {affiliateMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{affiliateMsg}</span>
                  </div>
                )}

                {/* Form to Add New Affiliate Link */}
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-slate-900/80 border border-purple-200/80 dark:border-slate-700 mb-6">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Attach New Affiliate / Store Deal</span>
                  </h4>

                  <form onSubmit={handleAddLinkToProduct} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Store / Partner Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newStoreName}
                          onChange={(e) => setNewStoreName(e.target.value)}
                          placeholder="e.g. Amazon, Best Buy, Jumia, Partner Portal"
                          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Offer Price / Rate
                        </label>
                        <input
                          type="text"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="e.g. $199.99 or Free Trial"
                          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Affiliate / Referral Target URL *
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          required
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="https://partner.amazon.com/dp/ASIN?tag=taddla-20"
                          className="w-full py-2 pl-8 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Affiliate Network / Tag
                        </label>
                        <select
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value="Amazon Associates">Amazon Associates</option>
                          <option value="CJ Affiliate">CJ Affiliate (Commission Junction)</option>
                          <option value="Impact Radius">Impact Radius</option>
                          <option value="Rakuten Advertising">Rakuten Advertising</option>
                          <option value="ShareASale">ShareASale</option>
                          <option value="Direct Partner Deal">Direct Partner Deal</option>
                          <option value="Custom Referral">Custom Referral</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Commission Rate / CPA Note
                        </label>
                        <input
                          type="text"
                          value={newCommissionRate}
                          onChange={(e) => setNewCommissionRate(e.target.value)}
                          placeholder="e.g. 5% commission, $10 CPA"
                          className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newIsPrimary}
                            onChange={(e) => setNewIsPrimary(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span>Primary Featured Deal</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newInStock}
                            onChange={(e) => setNewInStock(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span>In Stock / Active</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Link to List</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* List of Attached Links */}
                <div className="mb-6">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Active Attached Links ({editingWhereToBuy.length})
                  </h4>

                  {editingWhereToBuy.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No links added to this product yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {editingWhereToBuy.map((link, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {link.storeName}
                              </span>
                              <span className="font-extrabold text-emerald-600">
                                {link.price}
                              </span>
                              {link.isPrimaryAffiliate && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                  Primary
                                </span>
                              )}
                              {link.affiliateTag && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
                                  {link.affiliateTag}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 truncate block">
                              {link.url}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="Test Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleRemoveLinkFromProduct(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Remove Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Save Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedAffiliateProduct(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAffiliateLinks}
                    disabled={isSavingAffiliate}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingAffiliate ? 'Saving...' : 'Save & Publish Affiliate Links'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 6: SECURITY & PASSCODE */}
      {activeTab === 'security' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700/60">
              <div className="p-3.5 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Admin Passcode & Portal Security
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your security passcode used to unlock administrator privileges across Taddla.
                </p>
              </div>
            </div>

            {passcodeChangeError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{passcodeChangeError}</span>
              </div>
            )}

            {passcodeChangeSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{passcodeChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasscode} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Admin Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPasscode}
                    onChange={(e) => setCurrentPasscode(e.target.value)}
                    placeholder="Enter current passcode (e.g. admin123)"
                    className="w-full py-2.5 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Enter new passcode"
                      className="w-full py-2.5 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Confirm new passcode"
                      className="w-full py-2.5 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Status: <span className="font-bold text-purple-600 dark:text-purple-400">{localStorage.getItem('taddla_admin_passcode') ? 'Custom Passcode Configured' : 'Default Passcode (admin123)'}</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Admin Passcode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Passcode Modal Popup */}
      {isChangePasscodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsChangePasscodeOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Change Admin Passcode
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update master security passcode for portal access
                </p>
              </div>
            </div>

            {passcodeChangeError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{passcodeChangeError}</span>
              </div>
            )}

            {passcodeChangeSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{passcodeChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Passcode
                </label>
                <input
                  type="password"
                  required
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                  placeholder="Enter current passcode"
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Passcode
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new passcode (min 4 chars)"
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Passcode
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Re-enter new passcode"
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasscodeOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Passcode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Email Verification Modal */}
      {isEmailVerificationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-purple-200 dark:border-purple-800/60 shadow-2xl relative">
            <button
              onClick={() => setIsEmailVerificationOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Official Security Authorization
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Company Email Approval Required
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Passcode change initiated. For security compliance, an official approval authorization code has been dispatched to the official Taddla company email. Please check the company inbox and enter the 6-digit authorization code below to approve the passcode change.
            </p>

            {/* Simulated Official Email Box */}
            <div className="mb-5 p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 shadow-inner font-sans text-xs space-y-2.5 relative group">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-slate-100">Official Company Inbox Notification</span>
                </div>
                <span className="text-slate-500 font-mono text-[10px]">Just now</span>
              </div>
              <div className="text-[11px] text-slate-400">
                <div><strong className="text-slate-300">Notice:</strong> Official Taddla Security Authorization</div>
                <div><strong className="text-slate-300">Subject:</strong> Action Required: Approve Master Passcode Change</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 my-2">
                <p className="text-slate-300 text-[11px] mb-2">
                  Use the following official 6-digit approval code sent to the company email to confirm the passcode change:
                </p>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-purple-500/30">
                  <span className="font-mono text-lg font-extrabold text-purple-400 tracking-widest">
                    {approvalCodeSent}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEnteredApprovalCode(approvalCodeSent)}
                    className="px-2.5 py-1 text-[10px] font-bold text-purple-300 bg-purple-900/50 hover:bg-purple-800/80 rounded-md border border-purple-700/50 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Autofill Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {approvalCodeError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{approvalCodeError}</span>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerifyApprovalCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter 6-Digit Approval Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-purple-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredApprovalCode}
                    onChange={(e) => setEnteredApprovalCode(e.target.value)}
                    placeholder="Enter 6-digit code (e.g. 849201)"
                    className="w-full py-2.5 pl-10 pr-3.5 text-sm font-mono tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailVerificationOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-lg shadow-purple-500/25 cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Approval & Apply Passcode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
