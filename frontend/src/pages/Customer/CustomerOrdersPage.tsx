import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, CheckCircle2, Clock, XCircle, ArrowRight, Eye } from 'lucide-react';
import { orderApi, getMediaUrl } from '../../services/api';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';

export const CustomerOrdersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { t } = useTranslation();
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
    if (!window.confirm(t('orders.confirmCancelPrompt'))) {
      return;
    }

    try {
      const res = await orderApi.cancelOrder(orderId);
      if (res.data.success) {
        success(t('toasts.orderCancelled'));
        fetchOrders();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('orders.statusPending');
      case 'CONFIRMED':
        return t('orders.statusConfirmed');
      case 'PREPARING':
        return t('orders.statusPreparing');
      case 'SHIPPED':
        return t('orders.statusShipped');
      case 'DELIVERED':
        return t('orders.statusDelivered');
      case 'CANCELLED':
        return t('orders.statusCancelled');
      case 'REFUNDED':
        return t('orders.statusRefunded');
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t('orders.myOrdersTitle')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {t('orders.myOrdersSubtitle')}
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-gray-100 font-bold">
            {t('common.loading')}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">{t('orders.noOrdersTitle')}</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {t('orders.noOrdersSubtitle')}
            </p>
            <Link
              to="/marketplace"
              className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-8 py-3 rounded-full shadow-md transition"
            >
              {t('cart.browseMarketplace')} →
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
                      {t('orders.orderId')} #{order.orderNumber}
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
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    {t('orders.placedOn')} {new Date(order.createdAt).toLocaleDateString(undefined, {
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition"
                  >
                    <Truck className="w-3.5 h-3.5" /> {t('orders.trackDelivery')}
                  </Link>

                  {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition text-xs border border-rose-200"
                    >
                      {t('orders.cancelOrder')}
                    </button>
                  )}
                </div>
              </div>

              {/* Items in this Order */}
              <div className="divide-y divide-gray-50">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.product?.images && item.product.images.length > 0
                            ? item.product.images[0]
                            : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={item.product?.name || 'Produce'}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{item.product?.name || 'Farm Produce'}</p>
                        <p className="text-[11px] text-gray-500">
                          {item.quantity} {item.product?.unit || 'kg'} × ₹{item.unitPrice}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
