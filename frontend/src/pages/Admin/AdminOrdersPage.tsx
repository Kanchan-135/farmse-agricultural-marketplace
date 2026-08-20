import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, MapPin, Search, RefreshCw, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');
  const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
  const { success, error: toastError } = useToast();

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await adminApi.updateOrderStatus(orderId, { orderStatus: newStatus });
      if (res.data.success) {
        success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus as any } : o))
        );
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefundSubmit = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingId(selectedOrder.id);
      const res = await adminApi.processRefund(selectedOrder.id, {
        refundReason: refundReason || 'Approved by administrator',
      });
      if (res.data.success) {
        success(`Refund processed for order #${selectedOrder.orderNumber}`);
        setShowRefundModal(false);
        setRefundReason('');
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to process refund');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Platform Orders & Administrative Control
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Super Administrator permissions: Override status, confirm orders, execute cancellations & refunds.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-2xl hover:bg-gray-50 transition self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </button>
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
          <div className="p-12 text-center text-xs text-gray-400">Loading all platform orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No orders found matching filter.</div>
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
                  <th className="py-4 px-4">Change Status (Admin Override)</th>
                  <th className="py-4 px-6 text-right">Actions</th>
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
                      <p className="font-bold text-gray-900">{ord.customer?.name || 'Customer'}</p>
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
                      <span
                        className={`text-[10px] block font-bold ${
                          ord.paymentStatus === 'REFUNDED'
                            ? 'text-rose-600'
                            : ord.paymentStatus === 'COMPLETED'
                            ? 'text-emerald-700'
                            : 'text-amber-600'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        disabled={updatingId === ord.id}
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`text-[11px] font-bold rounded-xl px-2.5 py-1.5 border outline-none transition cursor-pointer ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ord.orderStatus === 'PREPARING'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {ord.orderStatus !== 'CANCELLED' && ord.paymentStatus !== 'REFUNDED' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setShowRefundModal(true);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 transition inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-gray-900 text-base">
                Process Administrative Refund
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              You are refunding Order <span className="font-bold text-gray-900">#{selectedOrder.orderNumber}</span> for an amount of <span className="font-bold text-gray-900">₹{selectedOrder.totalAmount}</span>.
              This will update the payment status to <span className="font-bold text-rose-600">REFUNDED</span>, cancel the order, and restore product inventory.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Reason / Note:
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g., Customer cancellation dispute resolved, defective shipment, or payment reversal."
                className="w-full text-xs p-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 resize-none h-20"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                disabled={updatingId === selectedOrder.id}
                onClick={handleRefundSubmit}
                className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition shadow-md shadow-rose-600/20"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
