import React, { createContext, useContext, useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  showInstallBanner: boolean;
  showAndroidGuide: boolean;
  setShowAndroidGuide: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    (typeof window !== 'undefined' && window.__deferredPwaPrompt) || null
  );
  const [isInstallable, setIsInstallable] = useState<boolean>(
    typeof window !== 'undefined' && !!window.__deferredPwaPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (installed as PWA on Android / iOS / Capacitor APK)
    const isStandalone =
      (window as any).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('source=pwa');

    if (isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
    }

    // Check if early event was caught
    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
      setIsInstallable(true);
      const dismissed = sessionStorage.getItem('farmse_pwa_dismissed');
      if (!dismissed && !isStandalone) {
        setShowInstallBanner(true);
      }
    }

    const handlePromptEvent = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      const dismissed = sessionStorage.getItem('farmse_pwa_dismissed');
      if (!dismissed && !isStandalone) {
        setShowInstallBanner(true);
      }
    };

    const handleEarlyReady = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
        setIsInstallable(true);
        const dismissed = sessionStorage.getItem('farmse_pwa_dismissed');
        if (!dismissed && !isStandalone) {
          setShowInstallBanner(true);
        }
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setShowAndroidGuide(false);
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
      console.log('[FarmSe PWA] Successfully installed to home screen!');
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handlePromptEvent);
    window.addEventListener('farmse:pwa-ready', handleEarlyReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePromptEvent);
      window.removeEventListener('farmse:pwa-ready', handleEarlyReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    const promptToUse = deferredPrompt || window.__deferredPwaPrompt;
    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const { outcome } = await promptToUse.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setShowInstallBanner(false);
          setDeferredPrompt(null);
          window.__deferredPwaPrompt = null;
          return true;
        }
      } catch (err) {
        console.error('[FarmSe PWA] Error triggering install prompt:', err);
      }
    } else {
      // If deferredPrompt is unavailable, show step-by-step Android/iOS install modal guide
      setShowAndroidGuide(true);
    }
    return false;
  };

  const dismissInstallPrompt = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('farmse_pwa_dismissed', 'true');
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOnline,
        installApp,
        dismissInstallPrompt,
        showInstallBanner,
        showAndroidGuide,
        setShowAndroidGuide,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
};
