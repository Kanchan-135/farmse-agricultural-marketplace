import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Sprout } from 'lucide-react';
import { Product, Category } from '../types';
import { productApi, categoryApi } from '../services/api';
import { ProductCard } from '../components/marketplace/ProductCard';
import { FilterSidebar } from '../components/marketplace/FilterSidebar';
import { CategoryBar } from '../components/marketplace/CategoryBar';
import { useTranslation } from '../context/LanguageContext';

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  // Filter States
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [isOrganicOnly, setIsOrganicOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Load Categories on mount
  useEffect(() => {
    categoryApi.getAll().then((res) => {
      if (res.data.success && res.data.data) {
        setCategories(res.data.data);
      }
    });
  }, []);

  // Sync URL search params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const catFromUrl = searchParams.get('category');
    if (searchFromUrl !== null) setSearch(searchFromUrl);
    if (catFromUrl !== null) setSelectedCategory(catFromUrl);
  }, [searchParams]);

  // Fetch Products with filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        limit: 36,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.categorySlug = selectedCategory;
      if (maxPrice < 2000) params.maxPrice = maxPrice;
      if (locationFilter.trim()) params.location = locationFilter.trim();
      if (isOrganicOnly) params.isOrganic = true;
      if (inStockOnly) params.isAvailable = true;

      const res = await productApi.getAll(params);
      if (res.data.success && res.data.data) {
        setProducts(res.data.data);
        setTotalCount(res.data.meta?.total || res.data.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, maxPrice, locationFilter, isOrganicOnly, inStockOnly, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMaxPrice(2000);
    setLocationFilter('');
    setIsOrganicOnly(false);
    setInStockOnly(true);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Quick Category Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('marketplace.title')}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('marketplace.subtitle')}
            </p>
          </div>

          {/* Search bar inside header */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder={t('marketplace.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-gray-200 text-xs focus:border-emerald-500 outline-none shadow-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Horizontal Bar */}
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* 2. Main Content Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar - Desktop */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            minPrice={0}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => setMaxPrice(max)}
            locationFilter={locationFilter}
            onLocationChange={setLocationFilter}
            isOrganicOnly={isOrganicOnly}
            onToggleOrganic={() => setIsOrganicOnly(!isOrganicOnly)}
            inStockOnly={inStockOnly}
            onToggleInStock={() => setInStockOnly(!inStockOnly)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Filter Drawer - Mobile */}
        {mobileFilterOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in"
            onClick={() => setMobileFilterOpen(false)}
          >
            <div
              className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto shadow-2xl flex flex-col space-y-4 animate-slide-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">{t('marketplace.filters')}</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
                >
                  {t('common.close')} ✕
                </button>
              </div>
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => {
                  handleCategorySelect(slug);
                  setMobileFilterOpen(false);
                }}
                minPrice={0}
                maxPrice={maxPrice}
                onPriceChange={(min, max) => setMaxPrice(max)}
                locationFilter={locationFilter}
                onLocationChange={setLocationFilter}
                isOrganicOnly={isOrganicOnly}
                onToggleOrganic={() => setIsOrganicOnly(!isOrganicOnly)}
                inStockOnly={inStockOnly}
                onToggleInStock={() => setInStockOnly(!inStockOnly)}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Results Bar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-gray-700">
              {t('marketplace.showingResults')}: <span className="text-emerald-700 font-bold">{products.length}</span> / {totalCount}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">{t('marketplace.sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-bold text-gray-800 outline-none cursor-pointer focus:border-emerald-500 text-xs"
              >
                <option value="newest">{t('marketplace.sortNewest')}</option>
                <option value="harvest_recent">{t('marketplace.sortHarvestRecent')}</option>
                <option value="price_asc">{t('marketplace.sortPriceAsc')}</option>
                <option value="price_desc">{t('marketplace.sortPriceDesc')}</option>
                <option value="rating_desc">{t('marketplace.sortRatingDesc')} ⭐</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-64 sm:h-80 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t('marketplace.noProductsFound')}</h3>
              <button
                onClick={handleResetFilters}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-full transition shadow-md"
              >
                {t('marketplace.clearFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
