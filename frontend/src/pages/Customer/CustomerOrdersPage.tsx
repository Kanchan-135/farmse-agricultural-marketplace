import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, CheckCircle2, Clock, XCircle, ArrowRight, Eye } from 'lucide-react';
import { orderApi, getMediaUrl } from '../../services/api';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';

export const CustomerOrdersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getMyOrders();
      if (res.data.success && res.data.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored to the farm.')) {
      return;
    }

    try {
      const res = await orderApi.cancelOrder(orderId);
      if (res.data.success) {
        success('Order cancelled successfully.');
        fetchOrders();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Your Farm-Fresh Order History
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review all your direct-from-soil purchases and track real-time delivery timelines.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-gray-100">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No orders placed yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our wide variety of organic fruits, vegetables, grains, and dairy from certified farmers.
            </p>
            <Link
              to="/marketplace"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-8 py-3 rounded-full shadow-md transition"
            >
              Explore Marketplace Now →
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6 hover:border-gray-200 transition"
            >
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      Order #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'PREPARING'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'SHIPPED'
                          ? 'bg-purple-100 text-purple-800'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-gray-900">
                    ₹{order.totalAmount}
                  </span>
                  <Link
                    to={`/orders/track/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition"
                  >
                    <Truck className="w-3.5 h-3.5" /> Track Harvest
                  </Link>

                  {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition text-xs border border-rose-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Items in this Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <img
                      src={
                        item.product?.images && item.product?.images.length > 0
                          ? getMediaUrl(item.product.images[0])
                          : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={item.product?.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-bold text-gray-900 hover:text-brand-700"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity} {item.product?.unit} • ₹{item.unitPrice}/{item.product?.unit}
                      </p>
                      <p className="text-[10px] text-brand-700 font-semibold">
                        Farm: {item.farmer?.farmerProfile?.farmName || item.farmer?.name || 'Local Farm'}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex flex-wrap justify-between gap-2">
                <span>Shipping: {order.shippingAddress} (Phone: {order.contactPhone})</span>
                <span>Payment: {order.paymentMethod} ({order.paymentStatus})</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
