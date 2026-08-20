import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Truck, RefreshCw, Award, Heart, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Farm Fresh</h4>
              <p className="text-xs text-gray-400">Harvested directly upon your order</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Fair Price to Farmers</h4>
              <p className="text-xs text-gray-400">Zero commission middlemen cuts</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Direct Farm Logistics</h4>
              <p className="text-xs text-gray-400">Express farm-gate cold chain</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Quality Guarantee</h4>
              <p className="text-xs text-gray-400">100% replacement or refund</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Farm<span className="text-brand-500">se</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              FarmSe is India's smart agricultural marketplace connecting forward-thinking
              farmers directly with conscious consumers. Empowering rural producers with fair
              earnings while bringing authentic, pesticide-conscious nutrition to family tables.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-brand-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> ISO Certified Agri-Tech
              </span>
              <span>•</span>
              <span>100% Traceable</span>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Direct Produce
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace?category=fruits" className="hover:text-brand-400 transition">
                  Orchard Fresh Fruits
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=vegetables" className="hover:text-brand-400 transition">
                  Organic Vegetables
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=grains" className="hover:text-brand-400 transition">
                  Heirloom Grains & Rice
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=dairy" className="hover:text-brand-400 transition">
                  A2 Desi Cow Dairy
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=spices" className="hover:text-brand-400 transition">
                  Rainforest Spices
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Farmers */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Farmers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register?role=FARMER" className="hover:text-brand-400 transition font-medium text-amber-400">
                  Register as Producer
                </Link>
              </li>
              <li>
                <Link to="/farmer/dashboard" className="hover:text-brand-400 transition">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-brand-400 transition">
                  Market Mandi Prices
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Direct Bank Payouts</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Help & Contact
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Agri-Tech Park, Sector 62, Noida, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <span>support@farmse.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <span>+91 (800) 456-7890</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} FarmSe Agriculture Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Farmer Agreement</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
