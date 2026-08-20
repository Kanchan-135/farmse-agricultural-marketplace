import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Tractor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { notificationApi } from '../../services/api';
import { Notification } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isFarmer, isAdmin, isCustomer, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getMyNotifications();
      if (res.data.success && res.data.data) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAsRead('all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      {/* Top Banner for Farmer Direct Proposition */}
      <div className="bg-brand-900 text-brand-100 text-xs py-1.5 px-4 hidden sm:flex justify-between items-center font-medium">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="inline-flex items-center gap-1 bg-brand-800 text-brand-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            🌱 100% Direct
          </span>
          <span>Fresh harvest straight from verified farmers to your doorstep with zero middlemen.</span>
          <Link to="/marketplace" className="underline hover:text-white ml-auto text-brand-300">
            Browse Today's Harvest →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
                Farm<span className="text-brand-600">se</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-gray-700 -mt-1">
                Direct Soil to Table
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search organic mangoes, A2 ghee, wheat, fresh veggies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-24 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-sm rounded-full border border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition"
            >
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link
              to="/marketplace"
              className="hover:text-brand-600 transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              Marketplace
            </Link>
            {!isFarmer && (
              <Link
                to="/register?role=FARMER"
                className="hover:text-amber-600 transition flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60"
              >
                <Tractor className="w-4 h-4 text-amber-600" />
                Become a Farmer
              </Link>
            )}
            {isFarmer && (
              <Link
                to="/farmer/dashboard"
                className="hover:text-brand-700 transition flex items-center gap-1.5 text-brand-700 font-semibold bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                Farmer Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hover:text-purple-700 transition flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User Controls / Icons */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Wishlist */}
            <Link
              to="/customer/wishlist"
              className="relative p-2 text-gray-600 hover:text-rose-600 hover:bg-gray-50 rounded-full transition"
              title="Saved Produce"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition flex items-center gap-2"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Notifications Popover */}
            {isAuthenticated && (
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-full transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-slide-down">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-brand-600" /> Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-gray-50 transition text-xs ${
                              !n.isRead ? 'bg-brand-50/40 font-medium' : ''
                            }`}
                          >
                            <p className="font-semibold text-gray-800">{n.title}</p>
                            <p className="text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition border border-gray-200"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || 'User'
                      )}&background=15803d&color=fff`
                    }
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline-block text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          isFarmer
                            ? 'bg-amber-100 text-amber-800'
                            : isAdmin
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {user?.role} ACCOUNT
                      </span>
                    </div>

                    <div className="py-1">
                      {isFarmer && (
                        <>
                          <Link
                            to="/farmer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-600" />
                            Farmer Dashboard
                          </Link>
                          <Link
                            to="/farmer/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition"
                          >
                            <Package className="w-4 h-4 text-brand-600" />
                            My Produce Listings
                          </Link>
                          <Link
                            to="/farmer/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition"
                          >
                            <ShoppingBag className="w-4 h-4 text-brand-600" />
                            Incoming Orders
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Platform Governance
                        </Link>
                      )}

                      <Link
                        to="/customer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        My Profile & Orders
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-700 hover:text-brand-600 px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-brand-600/20 transition hover:shadow-lg"
                >
                  Join FarmSe
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-3 animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search farm produce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 text-gray-800"
              >
                <ShoppingBag className="w-4 h-4 text-brand-600" /> Marketplace
              </Link>
              {!isFarmer && (
                <Link
                  to="/register?role=FARMER"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900"
                >
                  <Tractor className="w-4 h-4 text-amber-600" /> Become Farmer
                </Link>
              )}
              {isFarmer && (
                <Link
                  to="/farmer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-50 text-brand-900"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600" /> Farmer Hub
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 text-purple-900"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
