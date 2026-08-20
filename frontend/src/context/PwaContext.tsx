import React, { createContext, useContext, useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  showInstallBanner: boolean;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt event (Chrome, Edge, Android Chrome, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Check if dismissed recently in this session
      const dismissed = sessionStorage.getItem('farmse_pwa_dismissed');
      if (!dismissed && !isStandalone) {
        setShowInstallBanner(true);
      }
    };

    // Track appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('[FarmSe PWA] Application installed successfully!');
    };

    // Track network online/offline transitions
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowInstallBanner(false);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.error('Error during PWA installation:', err);
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
