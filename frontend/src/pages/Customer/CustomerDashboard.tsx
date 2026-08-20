import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Edit2,
} from 'lucide-react';
import { orderApi } from '../../services/api';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useTranslation } from '../../context/LanguageContext';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { itemCount } = useCart();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    orderApi
      .getMyOrders()
      .then((res) => {
        if (res.data.success && res.data.data) {
          setOrders(res.data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-white/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
            {t('nav.customerAccount')}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('auth.loginTitle')}, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg">
            {t('orders.myOrdersSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/marketplace"
            className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            {t('nav.marketplace')}
          </Link>
          <Link
            to="/customer/profile"
            className="bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl border border-emerald-500 transition flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            {t('nav.profile')}
          </Link>
        </div>
      </div>

      {/* Quick Status KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/customer/orders"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('orders.myOrdersTitle')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{orders.length}</span>
          <span className="text-[11px] text-emerald-800 font-semibold block">{t('common.viewAll')}</span>
        </Link>

        <Link
          to="/customer/orders"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('orders.trackDelivery')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{activeOrders.length}</span>
          <span className="text-[11px] text-amber-700 font-semibold block">{t('orders.statusPreparing')}</span>
        </Link>

        <Link
          to="/customer/wishlist"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('nav.wishlist')}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{wishlist.length}</span>
          <span className="text-[11px] text-rose-700 font-semibold block">{t('nav.wishlist')}</span>
        </Link>

        <Link
          to="/cart"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('nav.cart')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{itemCount}</span>
          <span className="text-[11px] text-emerald-800 font-semibold block">{t('cart.itemCount')}</span>
        </Link>
      </div>

      {/* Active Orders & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              {t('orders.myOrdersTitle')}
            </h2>
            <Link to="/customer/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              {t('common.viewAll')} →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">{t('common.loading')}</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-2">
              <p>{t('orders.noOrdersTitle')}</p>
              <Link to="/marketplace" className="inline-block font-bold text-emerald-700 underline">
                {t('cart.browseMarketplace')}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="py-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-gray-900">#{order.orderNumber}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {order.items?.length} items • ₹{order.totalAmount}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {order.orderStatus}
                    </span>
                    <Link
                      to={`/orders/track/${order.id}`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 font-bold rounded-lg text-[11px] transition"
                    >
                      {t('orders.trackDelivery')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-700" />
              {t('nav.profile')}
            </h3>
            <Link to="/customer/profile" className="text-xs font-bold text-emerald-700 hover:underline">
              {t('common.edit')}
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 font-medium block">{t('auth.nameLabel')}</span>
              <span className="font-bold text-gray-900 text-sm">{user?.name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">{t('auth.emailLabel')}</span>
              <span className="font-bold text-gray-900">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">{t('auth.phoneLabel')}</span>
              <span className="font-bold text-gray-900">{user?.phone || 'Not added'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">{t('auth.addressLabel')}</span>
              <span className="text-gray-700">
                {user?.address ? `${user.address}, ${user.city}, ${user.state}` : 'No address saved yet'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
