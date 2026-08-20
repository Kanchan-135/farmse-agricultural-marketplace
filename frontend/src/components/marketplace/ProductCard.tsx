import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  Leaf,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTranslation } from '../../context/LanguageContext';
import { getMediaUrl } from '../../services/api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isFavorited = isInWishlist(product.id);
  const rawImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
  const primaryImage = getMediaUrl(rawImage);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1).then((success) => {
      if (success) {
        navigate('/checkout');
      }
    });
  };

  const translatedUnit = t(`common.${product.unit}`) !== `common.${product.unit}` ? t(`common.${product.unit}`) : product.unit;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100/90 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container & Floating Tags */}
      <Link to={`/products/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-gray-100 block">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Save to wishlist"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-md ${
            isFavorited
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Badges: Organic & Discount */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.isOrganic && (
            <span className="inline-flex items-center gap-1 bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              <Leaf className="w-3 h-3" /> {t('common.organic')}
            </span>
          )}
          {discountPercent && (
            <span className="bg-amber-500/95 backdrop-blur-md text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock / Fresh Harvest Indicator */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {product.harvestDate ? (
            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {t('marketplace.harvestDate')} {new Date(product.harvestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          ) : (
            <span />
          )}

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${
              product.isAvailable && product.quantity > 0
                ? 'bg-emerald-950/80 text-emerald-300'
                : 'bg-rose-950/80 text-rose-300'
            }`}
          >
            {product.isAvailable && product.quantity > 0 ? `${product.quantity} ${translatedUnit}` : t('product.outOfStock')}
          </span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Farmer & Location Metadata */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-gray-500 mb-1">
            <span className="flex items-center gap-1 font-medium text-emerald-800 truncate">
              {product.farmer?.farmerProfile?.farmName || product.farmer?.name || t('common.verified')}
              {product.farmer?.farmerProfile?.isVerified !== false && (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 inline" />
              )}
            </span>
            <span className="flex items-center gap-0.5 text-gray-400 shrink-0">
              <MapPin className="w-3 h-3" />
              {product.location?.split(',')[0]}
            </span>
          </div>

          {/* Title */}
          <Link to={`/products/${product.id}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-800">
              {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-400">
              ({product.reviewCount || 12})
            </span>
          </div>
        </div>

        {/* Pricing & CTA Controls */}
        <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
            <div>
              <span className="text-base sm:text-lg font-bold text-gray-900">₹{product.price}</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium ml-0.5">/{translatedUnit}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through ml-1.5">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || product.quantity <= 0}
              className="w-full flex items-center justify-center gap-1 py-2 px-1 sm:px-2.5 rounded-xl border border-emerald-700 text-emerald-800 hover:bg-emerald-50 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent text-[11px] sm:text-xs font-bold transition active:scale-95 tap-active"
            >
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{t('marketplace.addToCart')}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.isAvailable || product.quantity <= 0}
              className="w-full flex items-center justify-center gap-1 py-2 px-1 sm:px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[11px] sm:text-xs font-bold shadow-sm shadow-emerald-700/20 transition active:scale-95 tap-active"
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
              <span className="truncate">{t('product.buyNow')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
