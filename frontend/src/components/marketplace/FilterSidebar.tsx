import React from 'react';
import { Filter, RotateCcw, Check, Sparkles, MapPin, Tag } from 'lucide-react';
import { Category } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  locationFilter: string;
  onLocationChange: (loc: string) => void;
  isOrganicOnly: boolean;
  onToggleOrganic: () => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  locationFilter,
  onLocationChange,
  isOrganicOnly,
  onToggleOrganic,
  inStockOnly,
  onToggleInStock,
  onReset,
}) => {
  const { t } = useTranslation();

  const getCategoryName = (slug: string, defaultName: string) => {
    const translationKey = `categories.${slug}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : defaultName;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          {t('marketplace.filters')}
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-bold text-gray-400 hover:text-emerald-700 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> {t('common.reset')}
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {t('nav.categories')}
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              selectedCategory === ''
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{t('marketplace.allCategories')}</span>
            {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                selectedCategory === cat.slug
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{getCategoryName(cat.slug, cat.name)}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-gray-400 font-normal">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
          <span>{t('marketplace.priceRange')}</span>
          <span className="text-emerald-700 font-bold">₹{maxPrice}</span>
        </label>
        <input
          type="range"
          min="20"
          max="2000"
          step="10"
          value={maxPrice}
          onChange={(e) => onPriceChange(minPrice, parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
          <span>₹20</span>
          <span>₹1000</span>
          <span>₹2000+</span>
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          {t('common.location')}
        </label>
        <input
          type="text"
          placeholder="e.g. Nashik, Shimla, Punjab..."
          value={locationFilter}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
        />
      </div>

      {/* Toggles: Organic & In Stock */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {t('marketplace.filters')}
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            🌱 {t('marketplace.organicOnly')}
          </span>
          <input
            type="checkbox"
            checked={isOrganicOnly}
            onChange={onToggleOrganic}
            className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500 border-gray-300 accent-emerald-600 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            📦 {t('marketplace.inStockOnly')}
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500 border-gray-300 accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
