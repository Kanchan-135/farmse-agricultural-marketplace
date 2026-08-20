import React from 'react';
import { Filter, RotateCcw, Check, Sparkles, MapPin, Tag } from 'lucide-react';
import { Category } from '../../types';

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
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          Filter Produce
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-gray-400 hover:text-brand-700 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Categories
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              selectedCategory === ''
                ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-brand-600" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                selectedCategory === cat.slug
                  ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-gray-400 font-normal">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
          <span>Max Price</span>
          <span className="text-brand-700 font-bold">₹{maxPrice}</span>
        </label>
        <input
          type="range"
          min="20"
          max="2000"
          step="10"
          value={maxPrice}
          onChange={(e) => onPriceChange(minPrice, parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <span>₹20</span>
          <span>₹1000</span>
          <span>₹2000+</span>
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          Farming Region
        </label>
        <input
          type="text"
          placeholder="e.g. Nashik, Shimla, Punjab..."
          value={locationFilter}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none"
        />
      </div>

      {/* Toggles: Organic & In Stock */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Preferences
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            🌱 Certified Organic Only
          </span>
          <input
            type="checkbox"
            checked={isOrganicOnly}
            onChange={onToggleOrganic}
            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300 accent-brand-600 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
          <span className="text-xs font-semibold text-gray-800">
            📦 In-Stock Available
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300 accent-brand-600 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
