import React, { useState } from 'react';
import { X, ShieldCheck, Mail, HelpCircle, FileText, BookOpen, Send, CheckCircle2 } from 'lucide-react';

interface FooterModalsProps {
  modalName: string | null;
  onClose: () => void;
}

export const FooterModals: React.FC<FooterModalsProps> = ({ modalName, onClose }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  if (!modalName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content Router */}
        {modalName === 'about' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">About Taddla</h2>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Taddla</strong> is a global, open product & service review platform. Unlike company review sites that rate general brand reputations, Taddla focuses specifically on individual products and services — from mobile phones and laptops to ISPs, airlines, and banking apps.
              </p>
              <p>
                Our mission is to empower real consumers worldwide with objective, AI-shielded review scores, long-term experience timelines, and instant consensus summaries powered by Google Gemini AI.
              </p>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-700">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Our Core Pillars:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Individual product focus, not generic corporate fluff</li>
                  <li>Multi-point AI authenticity scoring to eliminate fake affiliate reviews</li>
                  <li>Long-term product longevity timeline updates</li>
                  <li>Free and open community access for buyers worldwide</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {modalName === 'contact' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Contact Us</h2>
            </div>
            {contactSubmitted ? (
              <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-200">Message Sent!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  Thank you for reaching out. Our support team will respond to {contactEmail} within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">How can we help?</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Inquire about partnership, report a bug, or request a category..."
                    className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        )}

        {modalName === 'faq' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">How does AI Authenticity Shield work?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We run automated Gemini AI models that analyze syntax, verified purchase badges, duplicate text patterns across the web, and community helpfulness votes to filter out fake affiliate spam.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">What are Product Timelines?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Instead of single static reviews, users update their review after 1 month, 6 months, or 2 years. This shows how products actually hold up over time.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">How do I earn Reviewer Badges?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  By submitting detailed reviews, uploading verified purchase receipts, receiving helpful votes from fellow users, and updating long-term timelines.
                </p>
              </div>
            </div>
          </div>
        )}

        {modalName === 'privacy' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Privacy Policy</h2>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-80 overflow-y-auto pr-2">
              <p>At Taddla, accessible from taddla.org, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Taddla and how we use it.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-2">1. Information We Collect</h4>
              <p>We collect account details (email, username) and review metadata (ratings, text, photos) voluntarily submitted by users. AI recognition tools process photos locally or server-side strictly for product identification.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-2">2. How We Use Information</h4>
              <p>We use review data to calculate authentic consumer scores, compile AI consensus summaries, and present transparent product comparisons.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-2">3. Third-Party Services</h4>
              <p>We do not sell personal user data to marketers. Gemini AI API endpoints process anonymous review text to generate summaries.</p>
            </div>
          </div>
        )}

        {modalName === 'terms' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Terms of Service</h2>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-80 overflow-y-auto pr-2">
              <p>By accessing or using Taddla, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-2">1. Authentic Feedback Mandate</h4>
              <p>Users must submit honest, personal consumer experiences. Commercial affiliate manipulation, fake positive reviews for compensation, or malicious competitor spam is strictly prohibited and subject to account suspension.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-2">2. User Content License</h4>
              <p>By posting reviews or photos, you grant Taddla a global license to display, summarize, and index your content on our platform.</p>
            </div>
          </div>
        )}

        {modalName === 'blog' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Taddla Official Blog</h2>
            </div>
            <div className="space-y-4">
              <article className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">July 2026 Release</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Introducing Long-Term Product Timelines</h4>
                <p className="text-xs text-slate-500">Why reviewing a product on Day 1 isn't enough: how 1-year and 2-year updates reveal true build quality.</p>
              </article>

              <article className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">AI Safety Insights</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">How Gemini AI Detects Affiliate Review Manipulation</h4>
                <p className="text-xs text-slate-500">A look behind our multi-layer authenticity matrix that scores review trustworthiness.</p>
              </article>
            </div>
          </div>
        )}

        {/* Modal Close Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-xs rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
