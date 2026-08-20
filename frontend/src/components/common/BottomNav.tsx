import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User, LayoutDashboard, ShieldCheck, Tractor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const BottomNav: React.FC = () => {
  const { user, isAuthenticated, isFarmer, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  // Determine user hub link based on role
  const profileLink = !isAuthenticated
    ? '/login'
    : isFarmer
    ? '/farmer/dashboard'
    : isAdmin
    ? '/admin/dashboard'
    : '/customer/dashboard';

  const profileLabel = !isAuthenticated
    ? 'Sign In'
    : isFarmer
    ? 'Farm Hub'
    : isAdmin
    ? 'Admin'
    : 'Account';

  const ProfileIcon = !isAuthenticated
    ? User
    : isFarmer
    ? Tractor
    : isAdmin
    ? ShieldCheck
    : User;

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] safe-area-pb">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl transition ${
              isActive && location.pathname === '/'
                ? 'text-brand-700 font-bold'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </NavLink>

        {/* 2. Marketplace */}
        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl transition ${
              isActive
                ? 'text-brand-700 font-bold'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Market</span>
        </NavLink>

        {/* 3. Cart with Badge */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl relative transition ${
              isActive
                ? 'text-brand-700 font-bold'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-sm">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Cart</span>
        </NavLink>

        {/* 4. Wishlist with Badge */}
        <NavLink
          to="/customer/wishlist"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl relative transition ${
              isActive
                ? 'text-rose-600 font-bold'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Saved</span>
        </NavLink>

        {/* 5. Profile / Role Dashboard */}
        <NavLink
          to={profileLink}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl transition ${
              isActive
                ? isFarmer
                  ? 'text-amber-700 font-bold'
                  : isAdmin
                  ? 'text-purple-700 font-bold'
                  : 'text-brand-700 font-bold'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <ProfileIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[55px]">
            {profileLabel}
          </span>
        </NavLink>
      </div>
    </nav>
  );
};
