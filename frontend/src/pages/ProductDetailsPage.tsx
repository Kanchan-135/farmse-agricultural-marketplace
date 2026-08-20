import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Calendar,
  Leaf,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Zap,
  Plus,
  Minus,
  ArrowLeft,
  Share2,
  Tractor,
} from 'lucide-react';
import { Product } from '../types';
import { productApi, getMediaUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ReviewSection } from '../components/reviews/ReviewSection';
import { ProductCard } from '../components/marketplace/ProductCard';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await productApi.getById(id);
      if (res.data.success && res.data.data) {
        setProduct(res.data.data);
        if (res.data.data.images && res.data.data.images.length > 0) {
          setSelectedImage(res.data.data.images[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-medium">Fetching harvest details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center border border-gray-100 shadow-sm space-y-4">
        <p className="text-sm font-bold text-gray-800">Product not found</p>
        <Link to="/marketplace" className="inline-block text-xs font-bold text-brand-600 underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    const ok = await addToCart(product.id, quantity);
    if (ok) {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Product link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Breadcrumb & Back button */}
      <div className="flex items-center justify-between text-xs">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-brand-700 font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
        <span className="text-gray-400">
          Home / {product.category?.name || 'Produce'} / <span className="text-gray-900 font-semibold">{product.name}</span>
        </span>
      </div>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-md">
            <img
              src={selectedImage ? getMediaUrl(selectedImage) : images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.isOrganic && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                <Leaf className="w-3.5 h-3.5" /> 100% Certified Organic
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition ${
                isFavorited
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 hover:bg-white text-gray-700 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition ${
                    (selectedImage || images[0]) === img
                      ? 'border-brand-600 ring-2 ring-brand-500/20'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center text-xs">
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <Truck className="w-4 h-4 text-brand-600 mx-auto mb-1" />
              <span className="font-bold text-gray-800 block">Direct Dispatch</span>
              <span className="text-[10px] text-gray-500">From farm gate</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-brand-600 mx-auto mb-1" />
              <span className="font-bold text-gray-800 block">Quality Assured</span>
              <span className="text-[10px] text-gray-500">100% replacement</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <RotateCcw className="w-4 h-4 text-brand-600 mx-auto mb-1" />
              <span className="font-bold text-gray-800 block">Freshness First</span>
              <span className="text-[10px] text-gray-500">No warehouse lag</span>
            </div>
          </div>
        </div>

        {/* Right: Product Buying Details (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                {product.category?.name || 'Produce'}
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-gray-500 hover:text-brand-700 flex items-center gap-1 font-medium"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Harvest Date Tag */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full text-amber-900 border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span className="font-bold">{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
                <span className="text-gray-500 font-medium">({product.reviewCount || 12} reviews)</span>
              </div>

              {product.harvestDate && (
                <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Harvested: {new Date(product.harvestDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
              <span className="text-sm font-semibold text-gray-500 ml-1">/{product.unit}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through ml-3 font-medium">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            <div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.isAvailable && product.quantity > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {product.isAvailable && product.quantity > 0
                  ? `In Stock (${product.quantity} ${product.unit})`
                  : 'Sold Out'}
              </span>
            </div>
          </div>

          {/* Quantity selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Quantity ({product.unit}):
              </span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-extrabold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(product.quantity, prev + 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.quantity <= 0}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border-2 border-brand-600 text-brand-700 hover:bg-brand-50 disabled:border-gray-200 disabled:text-gray-400 font-bold text-xs sm:text-sm transition active:scale-95 shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add To Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.isAvailable || product.quantity <= 0}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs sm:text-sm transition active:scale-95 shadow-md shadow-brand-600/30"
              >
                <Zap className="w-4 h-4 fill-current" />
                Direct Buy Now
              </button>
            </div>
          </div>

          {/* Farmer Spotlight Card */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    product.farmer?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={product.farmer?.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-gray-900">
                      {product.farmer?.farmerProfile?.farmName || product.farmer?.name}
                    </h4>
                    {product.farmer?.farmerProfile?.isVerified !== false && (
                      <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {product.location}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
                ⭐ {product.farmer?.farmerProfile?.rating || 4.9} Farm Score
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {product.farmer?.farmerProfile?.bio ||
                'Practicing sustainable zero-budget agriculture directly for conscious consumers.'}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Produce Description & Origin
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-12 border-t border-gray-100">
        <ReviewSection
          productId={product.id}
          reviews={product.reviews || []}
          rating={product.rating}
          reviewCount={product.reviewCount}
          onReviewAdded={fetchProduct}
        />
      </div>

      {/* Related Produce */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Related Harvests
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                More From Similar Farms & Categories
              </h3>
            </div>
            <Link to="/marketplace" className="text-xs font-bold text-brand-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar (Visible on mobile/Android devices above bottom nav) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 safe-area-pb">
        <div>
          <span className="text-xs text-gray-500 block">Total Price:</span>
          <span className="text-lg font-black text-gray-900">
            ₹{product.price * quantity}
          </span>
          <span className="text-[10px] text-gray-500 ml-1">({quantity} {product.unit})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.quantity <= 0}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-brand-600 text-brand-700 bg-brand-50/50 font-bold text-xs active:scale-95 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!product.isAvailable || product.quantity <= 0}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-brand-600 text-white font-bold text-xs active:scale-95 shadow-md transition"
          >
            <Zap className="w-4 h-4 fill-current" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
