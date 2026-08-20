import React from 'react';
import { Apple, Carrot, Wheat, Flame, Milk, Sparkles, Sprout } from 'lucide-react';
import { Category } from '../../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'fruits':
      return <Apple className="w-5 h-5" />;
    case 'vegetables':
      return <Carrot className="w-5 h-5" />;
    case 'grains':
      return <Wheat className="w-5 h-5" />;
    case 'pulses':
      return <Sprout className="w-5 h-5" />;
    case 'dairy':
      return <Milk className="w-5 h-5" />;
    case 'spices':
      return <Flame className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory('')}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shrink-0 transition-all font-semibold text-xs border ${
          selectedCategory === ''
            ? 'bg-brand-700 text-white border-brand-700 shadow-md shadow-brand-700/20'
            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        All Produce
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shrink-0 transition-all font-semibold text-xs border ${
              isSelected
                ? 'bg-brand-700 text-white border-brand-700 shadow-md shadow-brand-700/20'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            <span className={isSelected ? 'text-white' : 'text-brand-600'}>
              {getCategoryIcon(cat.slug)}
            </span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
