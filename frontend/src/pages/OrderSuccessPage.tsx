import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Home, Calendar, Phone } from 'lucide-react';
import { orderApi } from '../services/api';
import { Order } from '../types';
import { useTranslation } from '../context/LanguageContext';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState<boolean>(!order);

  useEffect(() => {
    if (!order && id) {
      orderApi.getOrderById(id).then((res) => {
        if (res.data.success && res.data.data) {
          setOrder(res.data.data);
        }
        setLoading(false);
      });
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Confirmation Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
            {t('orderSuccess.title')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {t('orderSuccess.title')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t('orderSuccess.orderNumber')}: <span className="font-mono font-bold text-gray-900">#{order?.orderNumber || id}</span>
          </p>
        </div>

        <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
          {t('orderSuccess.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={`/orders/track/${order?.id || id}`}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" /> {t('orderSuccess.trackOrder')}
          </Link>
          <Link
            to="/marketplace"
            className="w-full sm:w-auto bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs px-6 py-3 rounded-full border border-gray-200 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> {t('orderSuccess.continueShopping')}
          </Link>
        </div>
      </div>

      {/* Order Items & Shipping Summary */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
            {t('cart.orderSummary')}
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{item.product?.name || 'Farm Product'}</p>
                  <p className="text-[11px] text-gray-500">
                    {t('common.quantity')}: {item.quantity} × ₹{item.unitPrice} • Farmer: {item.farmer?.name || 'Local Farm'}
                  </p>
                </div>
                <span className="font-bold text-gray-900">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 font-medium block mb-1">{t('checkout.deliveryDetails')}:</span>
              <p className="font-bold text-gray-900">{order.shippingAddress}</p>
              <p className="text-gray-600 mt-0.5">{t('checkout.contactPhone')}: {order.contactPhone}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium block mb-1">{t('checkout.paymentMethod')}:</span>
              <p className="font-bold text-gray-900">{order.paymentMethod}</p>
              <p className="text-emerald-700 font-semibold mt-0.5">{t('orders.paymentStatus')}: {order.paymentStatus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
