import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Home,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { orderApi, getMediaUrl } from '../services/api';
import { Order, OrderStatus } from '../types';
import { useTranslation } from '../context/LanguageContext';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const steps: { key: OrderStatus; label: string; description: string; icon: any }[] = [
    {
      key: 'PENDING',
      label: t('orders.statusPending'),
      description: 'Order registered & sent to farm',
      icon: Clock,
    },
    {
      key: 'CONFIRMED',
      label: t('orders.statusConfirmed'),
      description: 'Farmer accepted & scheduled harvest',
      icon: CheckCircle2,
    },
    {
      key: 'PREPARING',
      label: t('orders.statusPreparing'),
      description: 'Fresh plucking & ozone cleaning',
      icon: Package,
    },
    {
      key: 'SHIPPED',
      label: t('orders.statusShipped'),
      description: 'Cold-chain delivery in progress',
      icon: Truck,
    },
    {
      key: 'DELIVERED',
      label: t('orders.statusDelivered'),
      description: 'Received at customer table',
      icon: Home,
    },
  ];

  const statusOrder: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
  };

  useEffect(() => {
    if (id) {
      orderApi
        .getOrderById(id)
        .then((res) => {
          if (res.data.success && res.data.data) {
            setOrder(res.data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center border border-gray-100 shadow-sm space-y-4">
        <p className="text-sm font-bold text-gray-800">{t('orders.noOrdersTitle')}</p>
        <Link to="/customer/orders" className="text-xs font-bold text-emerald-700 underline">
          {t('orders.myOrdersTitle')}
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusOrder[order.orderStatus];
  const isCancelled = order.orderStatus === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/orders"
          className="text-xs font-bold text-gray-500 hover:text-emerald-700 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back')} {t('orders.myOrdersTitle')}
        </Link>
        <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
          #{order.orderNumber}
        </span>
      </div>

      {/* Main Status Tracker Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {t('orders.trackDelivery')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            {t('orders.orderStatus')}: {order.orderStatus}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('orders.placedOn')} {new Date(order.createdAt).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Stepper Timeline */}
        {isCancelled ? (
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-4 text-rose-900">
            <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">{t('orders.statusCancelled')}</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                This order was cancelled. Reserved inventory was restored to the farm.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step.key}
                    className={`p-4 rounded-2xl border transition text-center space-y-2 ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : isPassed
                        ? 'bg-gray-50 border-gray-200 text-gray-800'
                        : 'bg-white border-gray-100 opacity-40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${
                        isCurrent
                          ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs text-gray-900">{step.label}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Breakdown */}
        <div className="pt-6 border-t border-gray-100 space-y-4 text-xs">
          <h3 className="font-bold text-gray-900 text-sm">{t('cart.orderSummary')}</h3>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">{item.product?.name}</span>
                  <span className="text-gray-400 ml-2">
                    ({item.quantity} {item.product?.unit} × ₹{item.unitPrice})
                  </span>
                </div>
                <span className="font-bold text-gray-900">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between font-extrabold text-sm text-gray-900">
            <span>{t('cart.grandTotal')}</span>
            <span className="text-emerald-800">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
