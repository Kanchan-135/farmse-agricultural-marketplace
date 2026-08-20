import React from 'react';
import { Download, X, WifiOff, Smartphone, Sparkles } from 'lucide-react';
import { usePwa } from '../../context/PwaContext';
import { useTranslation } from '../../context/LanguageContext';

export const PwaInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, installApp, dismissInstallPrompt, showInstallBanner } = usePwa();
  const { t } = useTranslation();

  return (
    <>
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>You are currently in Offline Mode. Cached harvests and details remain accessible.</span>
        </div>
      )}

      {/* Floating PWA Install Banner */}
      {showInstallBanner && isInstallable && !isInstalled && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-emerald-500/30 backdrop-blur-xl animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 p-2 flex items-center justify-center border border-emerald-400/40 shadow-inner shrink-0">
                <img src="/icons/icon-192x192.png" alt="FarmSe Icon" className="w-8 h-8 rounded-lg object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Install FarmSe App
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white leading-tight mt-0.5">
                  Get the Best Mobile Experience
                </h4>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Add to home screen for instant access, offline orders & smooth checkout.
                </p>
              </div>
            </div>

            <button
              onClick={dismissInstallPrompt}
              className="text-emerald-400 hover:text-white p-1 rounded-lg transition shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              onClick={dismissInstallPrompt}
              className="px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:text-white transition"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={installApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          </div>
        </div>
      )}
    </>
  );
};
