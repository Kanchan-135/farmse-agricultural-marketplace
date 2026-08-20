import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { orderApi } from '../services/api';
import { PaymentMethod } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form State
  const [address, setAddress] = useState<string>(user?.address || user?.customerProfile?.defaultAddress || '');
  const [city, setCity] = useState<string>(user?.city || 'Mumbai');
  const [state, setState] = useState<string>(user?.state || 'Maharashtra');
  const [pincode, setPincode] = useState<string>(user?.pincode || '400076');
  const [phone, setPhone] = useState<string>(user?.phone || '+91 9820098200');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [loading, setLoading] = useState<boolean>(false);

  // Mock Card Inputs
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState<string>('09/28');
  const [cardCvv, setCardCvv] = useState<string>('892');

  const fullShippingAddress = `${address}, ${city}, ${state} - ${pincode}`;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim() || !city.trim() || !pincode.trim()) {
      alert('Please fill out complete delivery address.');
      return;
    }

    if (!phone.trim()) {
      alert('Please provide contact phone number for delivery updates.');
      return;
    }

    try {
      setLoading(true);
      const res = await orderApi.checkout({
        shippingAddress: fullShippingAddress,
        contactPhone: phone,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      if (res.data.success && res.data.data) {
        const order = res.data.data.order;

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        navigate(`/order-success/${order.id}`, { state: { order } });
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{t('cart.emptyTitle')}</h2>
        <Link to="/marketplace" className="inline-block text-xs font-bold text-emerald-700 underline">
          {t('cart.browseMarketplace')} →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t('checkout.title')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {t('checkout.subtitle')}
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Shipping & Payment Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <MapPin className="w-5 h-5 text-emerald-700" />
              1. {t('checkout.deliveryDetails')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-gray-700">{t('checkout.shippingAddress')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('checkout.addressPlaceholder')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.cityLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.stateLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.pincodeLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder="6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('checkout.contactPhone')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('checkout.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-gray-700">{t('checkout.orderNotes')}</label>
                <input
                  type="text"
                  placeholder={t('checkout.notesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Abstraction Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Lock className="w-5 h-5 text-emerald-700" />
              2. {t('checkout.paymentMethod')}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Option 1: UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <QrCode className="w-6 h-6 mx-auto text-emerald-700" />
                <span className="block text-xs font-bold">{t('checkout.upi')}</span>
                <span className="block text-[10px] text-gray-400">GPay, PhonePe, Paytm</span>
              </button>

              {/* Option 2: Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                  paymentMethod === 'CARD'
                    ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto text-emerald-700" />
                <span className="block text-xs font-bold">{t('checkout.card')}</span>
                <span className="block text-[10px] text-gray-400">Visa, MC, RuPay</span>
              </button>

              {/* Option 3: NetBanking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Building className="w-6 h-6 mx-auto text-emerald-700" />
                <span className="block text-xs font-bold">{t('checkout.netbanking')}</span>
                <span className="block text-[10px] text-gray-400">All Major Banks</span>
              </button>

              {/* Option 4: COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Banknote className="w-6 h-6 mx-auto text-emerald-700" />
                <span className="block text-xs font-bold">{t('checkout.cod')}</span>
                <span className="block text-[10px] text-gray-400">Cash / UPI at door</span>
              </button>
            </div>

            {/* Payment Details Sub-panel */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4 text-xs">
                <div className="w-16 h-16 bg-white p-1 rounded-xl border border-gray-200 shrink-0 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-800" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t('checkout.upi')}</p>
                  <p className="text-gray-500 mt-0.5">UPI ID: <span className="font-mono font-bold text-emerald-700">farmse.pay@icici</span></p>
                  <p className="text-[10px] text-emerald-700 mt-1">✓ Instant automatic capture & verified farm escrow</p>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{t('checkout.card')}</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-gray-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">{t('checkout.cod')}</p>
                <p className="text-amber-800 text-[11px]">
                  {t('checkout.codNotice')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary & Placement (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
            {t('cart.orderSummary')} ({items.length} {t('common.all')})
          </h3>

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 space-y-2">
            {items.map((item) => {
              const translatedUnit = t(`common.${item.product.unit}`) !== `common.${item.product.unit}` ? t(`common.${item.product.unit}`) : item.product.unit;
              return (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="pr-2">
                    <p className="font-bold text-gray-900 truncate max-w-[170px]">{item.product.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {item.quantity} {translatedUnit} × ₹{item.product.price}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>{t('cart.produceTotal')}</span>
              <span className="font-bold text-gray-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('cart.deliveryFee')}</span>
              <span className="font-bold text-gray-900">
                {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900">
              <span>{t('cart.grandTotal')}</span>
              <span className="text-xl text-emerald-800 font-black">₹{total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold text-sm py-4 rounded-full shadow-lg shadow-emerald-700/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t('checkout.placingOrder')}</span>
            ) : (
              <>
                <span>{t('checkout.placeOrder')} (₹{total})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-400">
            🔒 256-bit encrypted checkout. Direct bank escrow with farmers.
          </p>
        </div>
      </form>
    </div>
  );
};
