import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, Lock, Mail, User as UserIcon, Phone, MapPin, Tractor, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>((searchParams.get('role') as Role) || 'CUSTOMER');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');

  // Farmer specific fields
  const [farmName, setFarmName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(5);
  const [experienceYears, setExperienceYears] = useState<number>(3);

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
      name,
      email,
      password,
      role,
      phone,
      address,
      city,
      state,
      pincode,
    };

    if (role === 'FARMER') {
      payload.farmName = farmName || `${name}'s Farm`;
      payload.bio = bio;
      payload.location = `${city}, ${state}` || 'Local Farm';
      payload.farmSizeAcres = Number(farmSizeAcres);
      payload.experienceYears = Number(experienceYears);
    }

    const success = await register(payload);
    setLoading(false);
    if (success) {
      if (role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/marketplace');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900">
            Farm<span className="text-brand-600">se</span>
          </span>
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">Create Your Account</h2>
        <p className="text-xs text-gray-500">Join the smart direct-from-farm ecosystem</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-gray-100 rounded-3xl space-y-6">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-gray-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'CUSTOMER'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              I'm a Customer / Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'FARMER'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Tractor className="w-4 h-4" />
              I'm a Farmer / Producer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                  />
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Password (min. 6 characters)</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="+91 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="sm:col-span-3 space-y-1">
                <label className="font-bold text-gray-700">Address</label>
                <input
                  type="text"
                  placeholder="Street / Area / Farm address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Pincode</label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Farmer Exclusive Section */}
            {role === 'FARMER' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3 text-xs pt-3 animate-slide-down">
                <h3 className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Tractor className="w-4 h-4 text-amber-600" />
                  Farm & Production Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Farm / Orchard Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Patel Organic Orchards"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-amber-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Total Farm Size (Acres)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={farmSizeAcres}
                      onChange={(e) => setFarmSizeAcres(parseFloat(e.target.value))}
                      className="w-full p-2.5 bg-white rounded-xl border border-amber-200 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-gray-700">Farming Bio / Specialty</label>
                    <input
                      type="text"
                      placeholder="e.g. Naturally grown heirloom crops, zero budget regenerative farming..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-amber-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold text-xs py-4 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 ${
                role === 'FARMER'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
              }`}
            >
              {loading ? 'Registering...' : `Join FarmSe as ${role === 'FARMER' ? 'Producer' : 'Customer'}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
