import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const res = await wishlistApi.getWishlist();
      if (res.data.success && res.data.data) {
        setWishlist(res.data.data);
        setWishlistIds(new Set(res.data.data.map((p) => p.id)));
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: string) => wishlistIds.has(productId);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toastError('Please log in to save items to your wishlist.');
      return false;
    }

    try {
      const res = await wishlistApi.toggle(productId);
      if (res.data.success) {
        const inWishlist = res.data.data?.inWishlist;
        if (inWishlist) {
          success('Saved to wishlist! ❤️');
        } else {
          success('Removed from wishlist');
        }
        await refreshWishlist();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update wishlist';
      toastError(msg);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isLoading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
