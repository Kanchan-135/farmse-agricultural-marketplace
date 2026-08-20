import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, MapPin, Search } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.data.success && res.data.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Platform-Wide Orders & Escrow
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor transactions between consumers and direct producers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
              statusFilter === s
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading all orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6">Order ID & Date</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Items / Produce</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-6 text-right">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-gray-900 block">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(ord.createdAt).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900">{ord.customer?.name}</p>
                      <p className="text-[10px] text-gray-500">{ord.contactPhone}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-700">
                        {ord.items?.length || 0} harvest items
                      </span>
                    </td>

                    <td className="py-4 px-4 font-black text-gray-900">
                      ₹{ord.totalAmount}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800">{ord.paymentMethod}</span>
                      <span className="text-[10px] text-emerald-700 block font-medium">
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
