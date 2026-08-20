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

const steps: { key: OrderStatus; label: string; description: string; icon: any }[] = [
  {
    key: 'PENDING',
    label: 'Order Placed',
    description: 'Order registered & sent to farm',
    icon: Clock,
  },
  {
    key: 'CONFIRMED',
    label: 'Farmer Confirmed',
    description: 'Farmer accepted & scheduled harvest',
    icon: CheckCircle2,
  },
  {
    key: 'PREPARING',
    label: 'Harvesting & Packing',
    description: 'Fresh plucking & ozone cleaning',
    icon: Package,
  },
  {
    key: 'SHIPPED',
    label: 'Direct Transit',
    description: 'Cold-chain delivery in progress',
    icon: Truck,
  },
  {
    key: 'DELIVERED',
    label: 'Delivered Fresh',
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

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500">Tracking farm shipment...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center border border-gray-100 shadow-sm space-y-4">
        <p className="text-sm font-bold text-gray-800">Order not found</p>
        <Link to="/customer/orders" className="text-xs font-bold text-brand-600 underline">
          View My Orders
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
          className="text-xs font-bold text-gray-500 hover:text-brand-700 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
          #{order.orderNumber}
        </span>
      </div>

      {/* Main Status Tracker Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
            Real-Time Farm-Gate Tracker
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            Order Status: {order.orderStatus}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
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
              <h3 className="text-sm font-bold">This Order Has Been Cancelled</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Inventory was returned to the farm and any payment is being refunded.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Progress Bar Background (Desktop) */}
            <div className="hidden sm:block absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -translate-y-1/2 z-0" />
            {/* Progress Bar Active (Desktop) */}
            <div
              className="hidden sm:block absolute top-1/2 left-8 h-1 bg-brand-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100))}%`,
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:text-center">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 scale-110'
                          : isCompleted
                          ? 'bg-emerald-700 text-white'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-gray-500 hidden sm:block mt-0.5 leading-tight">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Harvest Items In This Delivery */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Harvest Items In This Order</h3>
          <div className="divide-y divide-gray-100 bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item.product?.images && item.product?.images.length > 0
                        ? getMediaUrl(item.product.images[0])
                        : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.product?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{item.product?.name}</p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {item.quantity} {item.product?.unit || 'kg'} • ₹{item.unitPrice}/{item.product?.unit || 'kg'}
                    </p>
                    <p className="text-[11px] text-brand-700 font-medium">
                      Farm: {item.farmer?.farmerProfile?.farmName || item.farmer?.name || 'Partner Farm'} ({item.farmer?.city || 'Local'})
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logistics & Payment Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              Delivery Destination
            </span>
            <p className="font-bold text-gray-900">{order.shippingAddress}</p>
            <p className="text-gray-600">Contact: {order.contactPhone}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              Payment Breakdown
            </span>
            <p className="font-bold text-gray-900">Total: ₹{order.totalAmount}</p>
            <p className="text-gray-600">
              Method: {order.paymentMethod} • Status: <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
