import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, Tractor, User as UserIcon, Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const from = (location.state as any)?.from?.pathname || '/';

  // If already authenticated, redirect to Home
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

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
    <div className="min-h-[85vh] w-full max-w-full flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Language Bar for Login Screen */}
      <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-sm">
        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 px-2">
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
        </span>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              language === lang.code
                ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </button>
        ))}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30">
            <Sprout className="w-7 h-7" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-gray-900 font-sans block leading-none">
              Farm<span className="text-emerald-600">se</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mt-0.5">
              {t('common.appTagline')}
            </span>
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 pt-2">{t('auth.loginTitle')}</h2>
        <p className="text-xs text-gray-500">{t('auth.loginSubtitle')}</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-xl border border-gray-100 rounded-3xl space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">{t('auth.emailLabel')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm focus:bg-white focus:border-emerald-500 outline-none transition"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">{t('auth.passwordLabel')}</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm focus:bg-white focus:border-emerald-500 outline-none transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md shadow-emerald-700/30 transition active:scale-95 flex items-center justify-center gap-2 tap-active"
            >
              {loading ? t('common.loading') : t('auth.loginButton')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              ⚡ Quick Demo Sign In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ramesh.patel@farmse.com', 'farmer123')}
                className="p-2.5 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition text-center text-[11px] font-bold text-amber-900 flex flex-col items-center gap-1 tap-active"
              >
                <Tractor className="w-4 h-4 text-amber-600" />
                Farmer
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.verma@farmse.com', 'customer123')}
                className="p-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition text-center text-[11px] font-bold text-emerald-900 flex flex-col items-center gap-1 tap-active"
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                Customer
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@farmse.com', 'admin123')}
                className="p-2.5 rounded-2xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition text-center text-[11px] font-bold text-purple-900 flex flex-col items-center gap-1 tap-active"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-50">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              {t('auth.registerButton')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
