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

export const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productApi.getFeatured(),
          categoryApi.getAll(),
        ]);
        if (prodRes.data.success && prodRes.data.data) {
          setFeaturedProducts(prodRes.data.data);
        }
        if (catRes.data.success && catRes.data.data) {
          setCategories(catRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
                India's First Direct-From-Soil Agricultural Marketplace
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Buy Fresh Harvest <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-500">
                  Directly From Farmers.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Eliminate middlemen commissions. Get tree-ripened fruits, organic greens, A2 dairy,
                and heritage grains harvested after your order is confirmed.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-8 py-4 rounded-full shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 transition-all flex items-center justify-center gap-2 group"
                >
                  Browse Today's Harvest
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/register?role=FARMER"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 font-bold text-sm px-8 py-4 rounded-full border border-gray-200 shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Tractor className="w-4 h-4 text-brand-600" />
                  Become a Producer
                </Link>
              </div>

              {/* Trust Metric Counters */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl font-black text-brand-900">100%</span>
                  <span className="text-xs text-gray-500 font-medium">Direct Producer Pay</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-brand-900">0%</span>
                  <span className="text-xs text-gray-500 font-medium">Middlemen Cuts</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-brand-900">24 Hrs</span>
                  <span className="text-xs text-gray-500 font-medium">Farm-to-Door Dispatch</span>
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
                <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Verified Organic</p>
                    <p className="text-[11px] text-gray-500">Zero Synthetic Pesticides</p>
                  </div>
                </div>

                {/* Floating Farm Badge 2 */}
                <div className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">GI-Tagged Heritage</p>
                    <p className="text-[10px] text-gray-500">Authentic Origin</p>
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
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Farm Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Explore By Direct Agricultural Produce
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition group"
          >
            View All Categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/marketplace?category=${cat.slug}`}
              className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-brand-300 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-50 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <Sprout className="w-6 h-6 text-brand-600" />
                )}
              </div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-brand-700">
                {cat.name}
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">
                {cat.productCount !== undefined ? `${cat.productCount} Harvests` : 'Fresh'}
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
              <Sparkles className="w-3 h-3 text-amber-600" /> Handpicked This Week
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Fresh Direct From Verified Orchards & Farms
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition group"
          >
            Explore Marketplace
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW FARMSE WORKS (3 Steps) */}
      <section className="bg-brand-900 text-white py-16 sm:py-20 rounded-3xl mx-4 sm:mx-8 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
            Transparent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold">How FarmSe Delivers Pure Freshness</h2>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl mx-auto">
            From the moment seeds are sown to the harvest dispatched at dawn, experience complete
            food provenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-brand-800/80 backdrop-blur-md p-6 rounded-2xl border border-brand-700/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto text-lg font-black shadow-md">
              1
            </div>
            <h3 className="text-base font-bold text-white">Farmers List Produce</h3>
            <p className="text-xs text-brand-200 leading-relaxed">
              Farmers post upcoming harvest dates, crop variety, organic certifications, and fair
              self-determined prices.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-brand-800/80 backdrop-blur-md p-6 rounded-2xl border border-brand-700/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto text-lg font-black shadow-md">
              2
            </div>
            <h3 className="text-base font-bold text-white">You Order Direct</h3>
            <p className="text-xs text-brand-200 leading-relaxed">
              Choose directly from specific orchards and dairy farms. No warehouse storage lag or
              chemical preservation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-brand-800/80 backdrop-blur-md p-6 rounded-2xl border border-brand-700/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto text-lg font-black shadow-md">
              3
            </div>
            <h3 className="text-base font-bold text-white">Harvested & Delivered</h3>
            <p className="text-xs text-brand-200 leading-relaxed">
              Produce is plucked fresh upon order confirmation and dispatched via direct cold-chain
              to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS: FOR FARMERS VS FOR CONSUMERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
            A Win-Win Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            Built for Farmers. Cherished by Families.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Farmers */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-8 rounded-3xl border border-amber-200/80 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                <Tractor className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-amber-950">Benefits for Farmers</h3>
            </div>

            <ul className="space-y-3.5 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Fair Pricing Control:</strong> Set your own prices based on quality, not APMC cartel fluctuations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Direct Bank Payouts:</strong> Rapid settlement directly to farmer bank accounts upon fulfillment.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Eliminate Middlemen Cuts:</strong> Retain 100% of consumer value instead of losing 40-60% to brokers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Nationwide Market Reach:</strong> Connect directly with conscious urban families seeking authentic produce.</span>
              </li>
            </ul>

            <Link
              to="/register?role=FARMER"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-200/70 hover:bg-amber-200 px-5 py-2.5 rounded-full transition"
            >
              Join As a Producer Today →
            </Link>
          </div>

          {/* For Customers */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-8 rounded-3xl border border-emerald-200/80 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950">Benefits for Customers</h3>
            </div>

            <ul className="space-y-3.5 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Peak Nutritional Density:</strong> Consumed within 24-48 hours of harvest, retaining vitamins and live enzymes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>100% Provenance & Origin:</strong> Know exactly which farmer and soil nourished your food.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Zero Harmful Wax & Chemicals:</strong> Say goodbye to artificial carbide ripening and preservative sprays.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Fair Direct Prices:</strong> High-grade organic quality at prices comparable to standard supermarkets.</span>
              </li>
            </ul>

            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-900 hover:text-brand-700 bg-brand-200/70 hover:bg-brand-200 px-5 py-2.5 rounded-full transition"
            >
              Start Shopping Fresh →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-800 to-emerald-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              Ready to Experience Authentic Farm-Fresh Food?
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Join thousands of conscious consumers and forward-thinking farmers transforming
              India's agricultural landscape.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto bg-white hover:bg-brand-50 text-brand-900 font-extrabold text-xs px-8 py-3.5 rounded-full shadow-lg transition"
            >
              Shop Marketplace Now
            </Link>
            <Link
              to="/register?role=FARMER"
              className="w-full sm:w-auto bg-brand-700/80 hover:bg-brand-700 text-white font-bold text-xs px-8 py-3.5 rounded-full border border-brand-500 transition"
            >
              Register as Farmer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
