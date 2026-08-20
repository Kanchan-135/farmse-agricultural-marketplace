import React from 'react';
import { Download, X, WifiOff, Sparkles, MoreVertical, Smartphone, PlusSquare, Check } from 'lucide-react';
import { usePwa } from '../../context/PwaContext';
import { useTranslation } from '../../context/LanguageContext';

export const PwaInstallPrompt: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    dismissInstallPrompt,
    showInstallBanner,
    showAndroidGuide,
    setShowAndroidGuide,
  } = usePwa();
  const { t } = useTranslation();

  return (
    <>
      {/* Offline Connectivity Toast Banner */}
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
                  Install on Your Device
                </h4>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Runs full screen with instant loading, offline access & direct updates.
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

      {/* Android / iOS Step-by-Step Manual Install Guide Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-5 animate-slide-up text-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">Install FarmSe on Android</h3>
                  <p className="text-[11px] text-gray-500">Standalone App Setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <p className="text-gray-700 leading-snug">
                  Tap the <strong className="text-gray-900">three dots (⋮)</strong> or <strong className="text-gray-900">Share</strong> icon in your browser menu.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <p className="text-gray-700 leading-snug">
                  Select <strong className="text-gray-900">"Install app"</strong> or <strong className="text-gray-900">"Add to Home screen"</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <p className="text-gray-700 leading-snug">
                  Confirm <strong className="text-gray-900">"Install"</strong>. FarmSe will now launch without the browser URL bar!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
