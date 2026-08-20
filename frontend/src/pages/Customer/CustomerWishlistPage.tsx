import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/marketplace/ProductCard';

export const CustomerWishlistPage: React.FC = () => {
  const { wishlist, isLoading } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Saved Farm Produce ({wishlist.length})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Your favorite crops, seasonal fruits, and dairy products saved for quick ordering.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading saved harvests...</div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your wishlist is empty</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Click the heart icon on any product in the marketplace to save it for later.
          </p>
          <Link
            to="/marketplace"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-8 py-3 rounded-full shadow-md transition"
          >
            Explore Farm Marketplace →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
