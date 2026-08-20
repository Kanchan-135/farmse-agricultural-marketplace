import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, Tractor, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login({ email, password });
    setLoading(false);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login({ email: demoEmail, password: demoPass }).then((success) => {
      if (success) {
        navigate(from, { replace: true });
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900">
            Farm<span className="text-brand-600">se</span>
          </span>
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">Welcome Back</h2>
        <p className="text-xs text-gray-500">Sign in to manage your harvests, orders & account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-gray-100 rounded-3xl space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:bg-white focus:border-brand-500 outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:bg-white focus:border-brand-500 outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-brand-600/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              ⚡ 1-Click Quick Demo Sign In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ramesh.patel@farmse.com', 'farmer123')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition text-center text-[11px] font-bold text-amber-900 flex flex-col items-center gap-1"
              >
                <Tractor className="w-4 h-4 text-amber-600" />
                Farmer
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.verma@farmse.com', 'customer123')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition text-center text-[11px] font-bold text-emerald-900 flex flex-col items-center gap-1"
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                Customer
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@farmse.com', 'admin123')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition text-center text-[11px] font-bold text-purple-900 flex flex-col items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
