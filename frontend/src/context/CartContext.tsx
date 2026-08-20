import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '../types';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      const res = await cartApi.getCart();
      if (res.data.success && res.data.data) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      toastError('Please log in to add items to your cart.');
      return false;
    }

    try {
      setIsLoading(true);
      const res = await cartApi.addItem(productId, quantity);
      if (res.data.success) {
        success('Added to cart! 🛒');
        await refreshCart();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Could not add to cart';
      toastError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await cartApi.updateItem(itemId, quantity);
      if (res.data.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update item';
      toastError(msg);
      return false;
    }
  };

  const removeFromCart = async (itemId: string): Promise<boolean> => {
    try {
      const res = await cartApi.removeItem(itemId);
      if (res.data.success) {
        success('Item removed from cart');
        await refreshCart();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to remove item';
      toastError(msg);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      await refreshCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items || [],
        itemCount: cart?.itemCount || 0,
        subtotal: cart?.subtotal || 0,
        deliveryFee: cart?.deliveryFee || 0,
        total: cart?.total || 0,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
