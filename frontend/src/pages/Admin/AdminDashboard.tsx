import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Tractor,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { AdminStats, Order, User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { t } = useTranslation();
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleFarmerApproval = async (farmerId: string) => {
    try {
      const res = await adminApi.toggleFarmerApproval(farmerId);
      if (res.data.success) {
        success(t('toasts.statusUpdated'));
        fetchStats();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update farmer');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-xs font-bold border border-purple-400/30 flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> {t('admin.title')}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            FarmSe Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl">
            {t('admin.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/farmers"
            className="bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
          >
            <Tractor className="w-4 h-4 text-purple-700" />
            {t('admin.farmerVerificationTitle')} ({stats?.pendingFarmersCount || 0})
          </Link>
          <Link
            to="/admin/orders"
            className="bg-purple-700/80 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 rounded-2xl border border-purple-500/40 transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('admin.ordersTitle')}
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total GMV Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('admin.totalRevenue')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            ₹{stats?.totalRevenue.toLocaleString() || '0'}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block">{t('admin.statsTitle')}</span>
        </div>

        {/* Total Registered Producers */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('admin.totalFarmers')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tractor className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.totalFarmers || 0}
          </span>
          <span className="text-[11px] text-amber-700 font-semibold block">
            {stats?.pendingFarmersCount || 0} {t('admin.pendingApprovals')}
          </span>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('admin.totalCustomers')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.totalCustomers || 0}
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold block">{t('admin.totalUsers')}</span>
        </div>

        {/* Total Products Listed */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('farmer.totalProducts')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats?.totalProducts || 0}
          </span>
          <span className="text-[11px] text-purple-700 font-semibold block">{t('marketplace.showingResults')}</span>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
        <Link
          to="/admin/farmers"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Tractor className="w-4 h-4 text-amber-600" /> {t('admin.farmerVerificationTitle')}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link
          to="/admin/products"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" /> {t('farmer.myProductsTitle')}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link
          to="/admin/orders"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-600" /> {t('admin.ordersTitle')}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link
          to="/admin/users"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> {t('admin.userManagementTitle')}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Recent Platform Orders */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">{t('admin.ordersTitle')}</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-purple-700 hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">#{ord.orderNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-0.5">
                    Customer: {ord.customer?.name} • Method: {ord.paymentMethod}
                  </p>
                </div>
                <span className="font-extrabold text-gray-900">₹{ord.totalAmount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recently Registered Users */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">{t('admin.userManagementTitle')}</h3>
            <Link to="/admin/users" className="text-xs font-bold text-purple-700 hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{u.name}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'FARMER'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5">{u.email}</p>
                </div>

                {u.role === 'FARMER' && (
                  <button
                    onClick={() => handleToggleFarmerApproval(u.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                      u.isApproved
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {u.isApproved ? 'Verified ✓' : t('admin.verifyFarmer')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
