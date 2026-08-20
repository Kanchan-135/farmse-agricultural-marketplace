import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, ShieldCheck, Lock, Save, Tractor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateUser, isFarmer } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useTranslation();

  const [name, setName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [address, setAddress] = useState<string>(user?.address || '');
  const [city, setCity] = useState<string>(user?.city || '');
  const [state, setState] = useState<string>(user?.state || '');
  const [pincode, setPincode] = useState<string>(user?.pincode || '');

  // Farmer specific
  const [farmName, setFarmName] = useState<string>(user?.farmerProfile?.farmName || '');
  const [bio, setBio] = useState<string>(user?.farmerProfile?.bio || '');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(user?.farmerProfile?.farmSizeAcres || 5);
  const [experienceYears, setExperienceYears] = useState<number>(user?.farmerProfile?.experienceYears || 3);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [pwLoading, setPwLoading] = useState<boolean>(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: any = {
        name,
        phone,
        address,
        city,
        state,
        pincode,
      };

      if (isFarmer) {
        payload.farmName = farmName;
        payload.bio = bio;
        payload.farmSizeAcres = farmSizeAcres;
        payload.experienceYears = experienceYears;
      }

      const res = await authApi.updateProfile(payload);
      if (res.data.success && res.data.data) {
        updateUser(res.data.data);
        success(t('toasts.profileUpdated'));
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    try {
      setPwLoading(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t('nav.profile')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left: User Card (1 col) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm text-center space-y-4">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=15803d&color=fff`
            }
            alt={user?.name}
            className="w-20 h-20 rounded-3xl object-cover mx-auto border-2 border-emerald-200 shadow-md"
          />
          <div>
            <h3 className="text-base font-bold text-gray-900">{user?.name}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isFarmer
                  ? 'bg-amber-100 text-amber-900'
                  : user?.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-900'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {user?.role === 'FARMER' ? t('nav.farmerAccount') : user?.role === 'ADMIN' ? t('nav.adminAccount') : t('nav.customerAccount')}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1 text-left">
            <p>{t('orders.placedOn')}: <strong>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</strong></p>
            <p>{t('common.status')}: <strong className="text-emerald-700">{t('common.verified')}</strong></p>
          </div>
        </div>

        {/* Right: Update Form (2 cols) */}
        <div className="md:col-span-2 space-y-8">
          <form
            onSubmit={handleUpdateProfile}
            className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6"
          >
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-700" /> {t('nav.profile')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.nameLabel')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.phoneLabel')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-gray-700">{t('auth.addressLabel')}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street / Apartment address"
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.cityLabel')}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.stateLabel')}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">{t('auth.pincodeLabel')}</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Farmer Farm Profile */}
            {isFarmer && (
              <div className="pt-4 border-t border-gray-100 space-y-4 text-xs">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Tractor className="w-4 h-4 text-amber-600" /> {t('auth.farmerDetailsTitle')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">{t('auth.farmNameLabel')}</label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-amber-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">{t('auth.farmSizeLabel')}</label>
                    <input
                      type="number"
                      value={farmSizeAcres}
                      onChange={(e) => setFarmSizeAcres(parseFloat(e.target.value))}
                      className="w-full p-2.5 bg-white rounded-xl border border-amber-200 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-gray-700">{t('auth.bioLabel')}</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-amber-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6"
          >
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" /> {t('auth.passwordLabel')}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pwLoading}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition"
              >
                {pwLoading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
