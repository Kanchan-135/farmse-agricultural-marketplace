import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tractor,
  Star,
  MapPin,
} from 'lucide-react';
import { farmerApi } from '../../services/api';
import { FarmerDashboardData, OrderItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useTranslation();
  const [data, setData] = useState<FarmerDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await farmerApi.getDashboard();
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await farmerApi.updateOrderStatus(orderId, status);
      if (res.data.success) {
        success(t('toasts.statusUpdated'));
        fetchDashboard();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Farm Banner & Greeting */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30 flex items-center gap-1.5">
              <Tractor className="w-3.5 h-3.5" /> {t('nav.farmerHub')}
            </span>
            {stats?.isVerified && (
              <span className="bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('common.verified')}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('auth.loginTitle')}, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl">
            {user?.farmerProfile?.farmName || 'Your Farm'} • {user?.farmerProfile?.location || 'Direct Farm'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/farmer/products/new"
            className="bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            {t('farmer.addNewProduct')}
          </Link>
          <Link
            to="/farmer/orders"
            className="bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs px-5 py-3 rounded-2xl border border-amber-400/40 transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('farmer.incomingOrders')}
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('farmer.totalEarnings')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            ₹{stats?.totalRevenue.toLocaleString() || '0'}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block">{t('home.featFairPriceTitle')}</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('farmer.totalOrders')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.totalOrders || 0}
          </span>
          <span className="text-[11px] text-gray-500 font-medium block">
            {stats?.pendingOrders || 0} {t('farmer.pendingFulfillment')}
          </span>
        </div>

        {/* Active Produce */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('farmer.activeListings')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.activeProducts || 0}
          </span>
          <span className="text-[11px] text-gray-500 font-medium block">
            {stats?.totalProducts || 0} {t('farmer.totalProducts')}
          </span>
        </div>

        {/* Farm Rating */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('product.rating')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.rating ? stats.rating.toFixed(1) : '5.0'} ⭐
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold block">{t('home.customerSatisfaction')}</span>
        </div>
      </div>

      {/* Recent Orders Table & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Incoming Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">{t('farmer.incomingOrders')}</h2>
              <p className="text-xs text-gray-500">{t('farmer.dashboardSubtitle')}</p>
            </div>
            <Link to="/farmer/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              {t('common.viewAll')} →
            </Link>
          </div>

          {data?.recentOrders.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400">
              {t('farmer.noOrders')}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              {data?.recentOrders.map((item: any) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">
                        #{item.order?.orderNumber || item.orderId?.slice(0, 8)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.order?.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.order?.orderStatus === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : item.order?.orderStatus === 'SHIPPED'
                            ? 'bg-purple-100 text-purple-800'
                            : item.order?.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.order?.orderStatus || 'PENDING'}
                      </span>
                    </div>

                    <p className="font-semibold text-gray-800 mt-1">
                      {item.quantity} {item.product?.unit} × {item.product?.name} (₹{item.subtotal})
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Buyer: {item.order?.customer?.name || 'Customer'} ({item.order?.customer?.city || 'Local'})
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">{t('common.status')}:</span>
                    <select
                      value={item.order?.orderStatus || 'PENDING'}
                      onChange={(e) => handleUpdateStatus(item.orderId, e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Inventory List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">{t('farmer.myProductsTitle')}</h3>
            <Link to="/farmer/products" className="text-xs font-bold text-emerald-700 hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      p.images && p.images.length > 0
                        ? p.images[0]
                        : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900 truncate max-w-[130px]">{p.name}</p>
                    <p className="text-[11px] text-gray-500">
                      ₹{p.price}/{p.unit} • {p.quantity} left
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {p.isAvailable ? 'Active' : 'Paused'}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/farmer/products/new"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t('farmer.addNewProduct')}
          </Link>
        </div>
      </div>
    </div>
  );
};
