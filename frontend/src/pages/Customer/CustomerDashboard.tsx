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

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { itemCount } = useCart();
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
      <div className="bg-gradient-to-r from-brand-800 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-white/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
            Customer Hub
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg">
            Track your farm-fresh deliveries, view order receipts, and discover seasonal organic harvests.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/marketplace"
            className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-brand-600" />
            Browse Farm Market
          </Link>
          <Link
            to="/customer/profile"
            className="bg-brand-700/80 hover:bg-brand-700 text-white font-bold text-xs px-5 py-3 rounded-2xl border border-brand-500 transition flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Quick Status KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/customer/orders"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-brand-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{orders.length}</span>
          <span className="text-[11px] text-brand-700 font-semibold block">Harvest History</span>
        </Link>

        <Link
          to="/customer/orders"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-brand-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active In-Transit</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{activeOrders.length}</span>
          <span className="text-[11px] text-amber-700 font-semibold block">Being Plucked/Shipped</span>
        </Link>

        <Link
          to="/customer/wishlist"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-brand-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved Produce</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{wishlist.length}</span>
          <span className="text-[11px] text-rose-700 font-semibold block">Favorites</span>
        </Link>

        <Link
          to="/cart"
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1 hover:border-brand-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cart Items</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gray-900">{itemCount}</span>
          <span className="text-[11px] text-emerald-700 font-semibold block">Ready For Harvest</span>
        </Link>
      </div>

      {/* Active Orders & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Direct Orders</h2>
              <p className="text-xs text-gray-500">Track shipments directly from individual farmers</p>
            </div>
            <Link to="/customer/orders" className="text-xs font-bold text-brand-700 hover:underline">
              View All Orders →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading order status...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">You haven't placed any farm orders yet.</p>
              <Link
                to="/marketplace"
                className="inline-block bg-brand-600 text-white text-xs font-bold px-6 py-2.5 rounded-full"
              >
                Start Shopping Fresh
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">#{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {order.items?.length || 1} harvest items • Total: <strong>₹{order.totalAmount}</strong>
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/orders/track/${order.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-brand-50 border border-gray-200 hover:border-brand-300 text-brand-700 font-bold rounded-xl shadow-sm transition"
                  >
                    <Truck className="w-3.5 h-3.5" /> Track Harvest
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Card & Delivery Address (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Customer Profile</h3>
            <Link to="/customer/profile" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
              <Edit2 className="w-3 h-3" /> Edit
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'Customer'
                )}&background=15803d&color=fff`
              }
              alt={user?.name}
              className="w-12 h-12 rounded-2xl object-cover border border-gray-200"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-2 border-t border-gray-100">
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">
                Default Shipping Destination
              </span>
              <p className="text-gray-800 font-medium">
                {user?.address || user?.customerProfile?.defaultAddress || 'No default address configured.'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">
                Phone Number
              </span>
              <p className="text-gray-800 font-medium">{user?.phone || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
