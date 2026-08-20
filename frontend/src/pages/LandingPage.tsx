import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  Truck,
  Award,
  Users,
  TrendingUp,
  Heart,
  CheckCircle,
  Apple,
  Carrot,
  Wheat,
  Milk,
  Flame,
  Sparkles,
  Tractor,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { Product, Category } from '../types';
import { productApi, categoryApi } from '../services/api';
import { ProductCard } from '../components/marketplace/ProductCard';
import { useTranslation } from '../context/LanguageContext';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Fresh Fruits', slug: 'fruits', icon: 'Apple', description: 'Fresh seasonal fruits' },
  { id: '2', name: 'Organic Vegetables', slug: 'vegetables', icon: 'Carrot', description: 'Farm-fresh veggies' },
  { id: '3', name: 'Grains & Pulses', slug: 'grains', icon: 'Wheat', description: 'Organic staple grains' },
  { id: '4', name: 'Dairy & Eggs', slug: 'dairy', icon: 'Milk', description: 'Farm direct dairy' },
  { id: '5', name: 'Aromatic Spices', slug: 'spices', icon: 'Flame', description: 'Pure Indian spices' },
  { id: '6', name: 'Organic Herbs', slug: 'herbs', icon: 'Flower2', description: 'Herbs & medicinal plants' },
];

export const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          productApi.getFeatured(),
          categoryApi.getAll(),
        ]);
        if (isMounted) {
          if (prodRes.status === 'fulfilled' && prodRes.value.data.success && prodRes.value.data.data) {
            setFeaturedProducts(prodRes.value.data.data);
          }
          if (catRes.status === 'fulfilled' && catRes.value.data.success && catRes.value.data.data && catRes.value.data.data.length > 0) {
            setCategories(catRes.value.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryName = (slug: string, defaultName: string) => {
    const translationKey = `categories.${slug}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : defaultName;
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:py-20 lg:py-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-300/60 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Leaf className="w-4 h-4 text-emerald-600 animate-pulse" />
                {t('home.badge')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                {t('home.heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t('home.heroSubtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-8 py-4 rounded-full shadow-lg shadow-emerald-700/30 hover:shadow-emerald-700/50 transition-all flex items-center justify-center gap-2 group"
                >
                  {t('home.exploreMarketplace')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/register?role=FARMER"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 font-bold text-sm px-8 py-4 rounded-full border border-gray-200 shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Tractor className="w-4 h-4 text-emerald-700" />
                  {t('home.startSelling')}
                </Link>
              </div>

              {/* Trust Metric Counters */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl font-black text-emerald-900">100%</span>
                  <span className="text-xs text-gray-500 font-bold">{t('home.activeFarmers')}</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-emerald-900">0%</span>
                  <span className="text-xs text-gray-500 font-bold">{t('home.directSavings')}</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-emerald-900">24 Hrs</span>
                  <span className="text-xs text-gray-500 font-bold">{t('home.dailyHarvests')}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80"
                    alt="Farmer harvesting organic crops"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Farm Badge 1 */}
                <div className="absolute -bottom-3 left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5 sm:gap-3 animate-bounce-slow max-w-[85%] sm:max-w-none">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{t('common.organic')}</p>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">{t('home.featFreshDesc')}</p>
                  </div>
                </div>

                {/* Floating Farm Badge 2 */}
                <div className="absolute -top-3 right-2 sm:-right-4 bg-white/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2 sm:gap-2.5 max-w-[85%] sm:max-w-none">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{t('common.verified')}</p>
                    <p className="text-[10px] text-gray-500 truncate">{t('home.featTraceableTitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {t('nav.categories')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {t('home.categoriesTitle')}
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition group"
          >
            {t('common.viewAll')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/marketplace?categorySlug=${cat.slug}`}
              className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-50 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <Sprout className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700">
                {getCategoryName(cat.slug, cat.name)}
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">
                {cat.productCount !== undefined ? `${cat.productCount} ${t('common.all')}` : t('common.organic')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED HARVESTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" /> {t('common.verified')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {t('home.featuredTitle')}
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition group"
          >
            {t('home.exploreMarketplace')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-64 sm:h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW FARMSE WORKS (3 Steps) */}
      <section className="bg-emerald-950 text-white py-16 sm:py-20 rounded-3xl mx-4 sm:mx-8 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            {t('home.whyChooseTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t('home.whyChooseSubtitle')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-emerald-900/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg font-black shadow-md">
              1
            </div>
            <h3 className="text-base font-bold text-white">{t('home.featFairPriceTitle')}</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {t('home.featFairPriceDesc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-emerald-900/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg font-black shadow-md">
              2
            </div>
            <h3 className="text-base font-bold text-white">{t('home.featFreshTitle')}</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {t('home.featFreshDesc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-emerald-900/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg font-black shadow-md">
              3
            </div>
            <h3 className="text-base font-bold text-white">{t('home.featTraceableTitle')}</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {t('home.featTraceableDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS: FOR FARMERS VS FOR CONSUMERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {t('home.whyChooseTitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            {t('home.heroTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Farmers */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-8 rounded-3xl border border-amber-200/80 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                <Tractor className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-amber-950">{t('home.ctaTitle')}</h3>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {t('home.ctaSubtitle')}
            </p>

            <Link
              to="/register?role=FARMER"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-200/70 hover:bg-amber-200 px-5 py-2.5 rounded-full transition"
            >
              {t('home.joinAsFarmer')} →
            </Link>
          </div>

          {/* For Customers */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-8 rounded-3xl border border-emerald-200/80 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950">{t('home.featVerifiedTitle')}</h3>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {t('home.featVerifiedDesc')}
            </p>

            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 hover:text-emerald-700 bg-emerald-200/70 hover:bg-emerald-200 px-5 py-2.5 rounded-full transition"
            >
              {t('home.exploreMarketplace')} →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              {t('home.ctaSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs px-8 py-3.5 rounded-full shadow-lg transition"
            >
              {t('home.exploreMarketplace')}
            </Link>
            <Link
              to="/register?role=FARMER"
              className="w-full sm:w-auto bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-3.5 rounded-full border border-emerald-500 transition"
            >
              {t('home.startSelling')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
