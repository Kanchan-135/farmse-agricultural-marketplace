import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const useCapacitorNative = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  locationRef.current = location.pathname;

  // 1. One-time Native Initialization (Status Bar, Splash Screen)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Configure Status Bar once on app boot
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#047857' }).catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

      // Hide Splash Screen once on startup
      SplashScreen.hide().catch(() => {});
    } catch (e) {
      console.warn('Capacitor native setup warning:', e);
    }
  }, []);

  // 2. Register Android Hardware Back Button listener once
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;
    let removeListener: (() => void) | null = null;

    CapApp.addListener('backButton', () => {
      const currentPath = locationRef.current;
      if (currentPath === '/' || currentPath === '/login' || currentPath === '/marketplace') {
        CapApp.exitApp();
      } else {
        navigate(-1);
      }
    })
      .then((handler) => {
        if (isMounted) {
          removeListener = () => handler.remove();
        } else {
          handler.remove();
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      if (removeListener) {
        removeListener();
      }
    };
  }, [navigate]);
};

export default useCapacitorNative;
