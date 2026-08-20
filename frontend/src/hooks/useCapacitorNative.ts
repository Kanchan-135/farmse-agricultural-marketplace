import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const useCapacitorNative = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Configure Status Bar
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#047857' }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

    // Hide Splash Screen once app is ready
    SplashScreen.hide().catch(() => {});

    // Handle Android Hardware Back Button
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/' || location.pathname === '/marketplace') {
        CapApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      backListener.then((handler) => handler.remove()).catch(() => {});
    };
  }, [location.pathname, navigate]);
};
