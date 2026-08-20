import { Link, useLocation } from 'react-router-dom';
import { Sprout, ShieldCheck, Truck, RefreshCw, Award, Heart, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('home.featFreshTitle')}</h4>
              <p className="text-[11px] text-gray-400">{t('home.featFreshDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('home.featFairPriceTitle')}</h4>
              <p className="text-[11px] text-gray-400">{t('home.featFairPriceDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('home.featVerifiedTitle')}</h4>
              <p className="text-[11px] text-gray-400">{t('home.featVerifiedDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-800/40 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('home.featTraceableTitle')}</h4>
              <p className="text-[11px] text-gray-400">{t('home.featTraceableDesc')}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Farm<span className="text-emerald-500">se</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              {t('home.whyChooseSubtitle')}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 100% {t('common.verified')}
              </span>
              <span>•</span>
              <span>{t('common.organic')}</span>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('nav.categories')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace?categorySlug=fruits" className="hover:text-emerald-400 transition">
                  {t('categories.fruits')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace?categorySlug=vegetables" className="hover:text-emerald-400 transition">
                  {t('categories.vegetables')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace?categorySlug=grains" className="hover:text-emerald-400 transition">
                  {t('categories.grains')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace?categorySlug=dairy" className="hover:text-emerald-400 transition">
                  {t('categories.dairy')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace?categorySlug=spices" className="hover:text-emerald-400 transition">
                  {t('categories.spices')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Farmers */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('nav.farmerHub')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register?role=FARMER" className="hover:text-emerald-400 transition font-bold text-amber-400">
                  {t('home.startSelling')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/dashboard" className="hover:text-emerald-400 transition">
                  {t('farmer.dashboardTitle')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition">
                  {t('nav.marketplace')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('common.appName')}
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Maharashtra, Punjab, Kerala, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@farmse.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+91 9800000001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} FarmSe. {t('common.appTagline')}.</p>
        </div>
      </div>
    </footer>
  );
};
