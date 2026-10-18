import React from 'react';
import { Heart, Mail, ShieldCheck } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './BrandIcons';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0B1120] py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">
              Spam Email <span className="text-[#7C3AED]">Classifier</span>
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            
            
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p>© {new Date().getFullYear()} Spam Email Classifier.</p>
          
        </div>
      </div>
    </footer>
  );
}
