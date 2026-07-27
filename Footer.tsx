import React from 'react';
import { ShieldCheck, Twitter, Facebook, Linkedin, Instagram, Youtube, Globe } from 'lucide-react';

interface FooterProps {
  onOpenModal: (modalName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  const socialLinks = [
    { name: 'X / Twitter', icon: Twitter, href: 'https://twitter.com', color: 'hover:bg-sky-500 hover:text-white' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: 'hover:bg-blue-600 hover:text-white' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com', color: 'hover:bg-blue-700 hover:text-white' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:bg-pink-600 hover:text-white' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', color: 'hover:bg-red-600 hover:text-white' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-bold text-2xl text-white font-display">
                Taddla
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              The world's leading community platform focusing purely on individual products and services. Honesty, AI verification, and long-term user experiences.
            </p>

            {/* Social Media Links */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Follow & Connect With Us
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((social) => {
                  const IconComp = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Follow Taddla on ${social.name}`}
                      className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 ${social.color} transition-all transform hover:-translate-y-0.5 shadow-sm group relative`}
                    >
                      <IconComp className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-display">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button onClick={() => onOpenModal('about')} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('faq')} className="hover:text-white transition-colors">
                  FAQ & Help
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('blog')} className="hover:text-white transition-colors">
                  Trust Blog
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('contact')} className="hover:text-white transition-colors">
                  Contact Team
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-display">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li>Smartphones & Laptops</li>
              <li>Internet Providers</li>
              <li>Banks & Fintech</li>
              <li>Airlines & Hotels</li>
              <li>Streaming Services</li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider font-display">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button onClick={() => onOpenModal('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('authenticity')} className="hover:text-white transition-colors">
                  AI Review Shield
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Taddla Platform. Built for transparent global purchasing.</p>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Global Edition &bull; English (US)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
