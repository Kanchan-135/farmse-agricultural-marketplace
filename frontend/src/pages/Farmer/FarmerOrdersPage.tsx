import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, Package, Truck, Home, MapPin, Phone, AlertCircle } from 'lucide-react';
import { farmerApi } from '../../services/api';
import { OrderItem, OrderStatus } from '../../types';
import { useToast } from '../../context/ToastContext';

export const FarmerOrdersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await farmerApi.getOrders({
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      });
      if (res.data.success && res.data.data) {
        setOrderItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await farmerApi.updateOrderStatus(orderId, newStatus);
      if (res.data.success) {
        success(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Direct Customer Orders
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review incoming orders, pack farm items, and update delivery milestones.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
              selectedStatus === st
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-gray-100">
            Loading orders...
          </div>
        ) : orderItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">No orders in this status</h3>
            <p className="text-xs text-gray-400">All customer requests will appear here in real time.</p>
          </div>
        ) : (
          orderItems.map((item) => {
            const ord = (item as any).order;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 hover:border-gray-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        Order #{ord?.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord?.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord?.orderStatus === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : ord?.orderStatus === 'SHIPPED'
                            ? 'bg-purple-100 text-purple-800'
                            : ord?.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord?.orderStatus}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Received: {new Date(ord?.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Status Changer */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">Update Status:</span>
                    <select
                      value={ord?.orderStatus}
                      onChange={(e) => handleUpdateStatus(item.orderId, e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PREPARING">PREPARING (Harvesting)</option>
                      <option value="SHIPPED">SHIPPED (In Transit)</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Produce Item and Customer details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-2xl">
                    <img
                      src={
                        item.product?.images && item.product?.images.length > 0
                          ? item.product.images[0]
                          : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={item.product?.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{item.product?.name}</h4>
                      <p className="text-gray-600">
                        Requested Quantity: <strong>{item.quantity} {item.product?.unit}</strong>
                      </p>
                      <p className="text-brand-700 font-extrabold mt-0.5">
                        Earnings: ₹{item.subtotal} (₹{item.unitPrice}/{item.product?.unit})
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Customer Shipping Info
                    </span>
                    <p className="font-bold text-gray-900">{ord?.customer?.name}</p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {ord?.shippingAddress}
                    </p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {ord?.contactPhone}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
