import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MapPin,
  Leaf,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const { items, itemCount, subtotal, deliveryFee, total, updateQuantity, removeFromCart, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center border border-gray-100 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Please Sign In to View Cart</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Log in to access your direct farm produce selections and checkout.
        </p>
        <Link
          to="/login"
          className="inline-block bg-brand-600 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-brand-700 transition"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-20 p-10 bg-white rounded-3xl text-center border border-gray-100 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Fresh Cart is Empty</h2>
        <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
          Discover seasonal fruits, organic vegetables, and heritage grains directly from farmers.
        </p>
        <Link
          to="/marketplace"
          className="inline-block bg-brand-600 text-white text-xs font-bold px-8 py-3.5 rounded-full shadow-md hover:bg-brand-700 transition"
        >
          Explore Marketplace →
        </Link>
      </div>
    );
  }

  const freeDeliveryRemaining = Math.max(0, 500 - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / 500) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Your Farm Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Items will be freshly harvested upon order confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Delivery Threshold Meter */}
          <div className="bg-brand-50/60 border border-brand-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-brand-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-600" />
                {freeDeliveryRemaining > 0
                  ? `Add ₹${freeDeliveryRemaining} more for FREE Direct Delivery!`
                  : '🎉 You have qualified for FREE Direct Farm Delivery!'}
              </span>
              <span className="text-brand-700 font-extrabold">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-brand-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items Cards */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item.product.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{item.product.name}</h3>
                      {item.product.isOrganic && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Organic
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <span className="text-brand-700 font-semibold">
                        {item.product.farmer?.farmerProfile?.farmName || item.product.farmer?.name}
                      </span>
                      <span>•</span>
                      <span>{item.product.location}</span>
                    </p>
                    <p className="text-xs font-bold text-gray-900 mt-1">
                      ₹{item.product.price} <span className="text-gray-500 font-normal">/{item.product.unit}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  {/* Quantity Increasers */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-lg hover:bg-white text-gray-600 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-extrabold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-lg hover:bg-white text-gray-600 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-bold text-gray-900">₹{item.subtotal}</span>
                  </div>

                  {/* Remove item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-bold text-gray-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Direct Farm Logistics</span>
              <span className="font-bold text-gray-900">
                {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Direct Farmer Fair Contribution</span>
              <span className="font-bold text-emerald-700">100% Included</span>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900">
              <span>Grand Total</span>
              <span className="text-lg text-brand-700 font-black">₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-4 rounded-full shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2 group"
          >
            Proceed to Secure Checkout
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Safe payment gateway abstraction & verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Direct payout to verified agricultural growers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
