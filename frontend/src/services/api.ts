import axios from 'axios';
import {
  ApiResponse,
  User,
  Product,
  Category,
  Cart,
  Order,
  OrderItem,
  Review,
  Notification,
  FarmerDashboardData,
  AdminStats,
} from '../types';

// Production Render backend endpoint for Native Android App
const PRODUCTION_BACKEND_URL = 'https://farmse-agricultural-marketplace.onrender.com';

// Dynamic API URL with smart formatting for Web & Android Capacitor deployment
export const formatApiUrl = (url?: string): string => {
  if (url && url.trim() !== '') {
    const clean = url.trim().replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  // If running inside Capacitor Native or Android WebView without explicit VITE_API_URL, default to Render backend
  if (typeof window !== 'undefined') {
    const isNative =
      (window as any).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:' ||
      (window.location.hostname === 'localhost' && (window as any).Capacitor);
    if (isNative) {
      return `${PRODUCTION_BACKEND_URL}/api`;
    }
  }
  return '/api';
};

const rawApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = formatApiUrl(rawApiUrl);

/**
 * Resolves static media URLs (e.g. /uploads/...) to full absolute URLs when running
 * in mobile app mode (Capacitor) or when backend is on a separate domain.
 */
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const backendOrigin = rawApiUrl
    ? rawApiUrl.replace(/\/api\/?$/, '')
    : PRODUCTION_BACKEND_URL;
  return `${backendOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000, // 12-second timeout to prevent infinite freezes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmse_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear and let state know
      if (localStorage.getItem('farmse_token')) {
        localStorage.removeItem('farmse_token');
        localStorage.removeItem('farmse_user');
      }
    }
    return Promise.reject(error);
  }
);

// Memory Cache with 2-minute TTL for fast navigation
let cachedCategories: { data: ApiResponse<Category[]>; timestamp: number } | null = null;
let cachedFeatured: { data: ApiResponse<Product[]>; timestamp: number } | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000;

// 1. Auth API
export const authApi = {
  register: (data: any) => api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data),
  login: (data: any) => api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data),
  getMe: () => api.get<ApiResponse<User>>('/auth/me'),
  updateProfile: (data: any) => api.put<ApiResponse<User>>('/auth/profile', data),
  changePassword: (data: any) => api.post<ApiResponse<null>>('/auth/change-password', data),
  forgotPassword: (email: string) => api.post<ApiResponse<any>>('/auth/forgot-password', { email }),
};

// 2. Products API
export const productApi = {
  getAll: (params?: any) => api.get<ApiResponse<Product[]>>('/products', { params }),
  getFeatured: async (forceRefresh: boolean = false) => {
    const now = Date.now();
    if (!forceRefresh && cachedFeatured && now - cachedFeatured.timestamp < CACHE_TTL_MS) {
      return { data: cachedFeatured.data } as any;
    }
    const res = await api.get<ApiResponse<Product[]>>('/products/featured');
    if (res.data?.success) {
      cachedFeatured = { data: res.data, timestamp: now };
    }
    return res;
  },
  getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),
  create: async (data: any) => {
    cachedFeatured = null;
    return api.post<ApiResponse<Product>>('/products', data);
  },
  update: async (id: string, data: any) => {
    cachedFeatured = null;
    return api.put<ApiResponse<Product>>(`/products/${id}`, data);
  },
  delete: async (id: string) => {
    cachedFeatured = null;
    return api.delete<ApiResponse<null>>(`/products/${id}`);
  },
};

// 3. Categories API
export const categoryApi = {
  getAll: async (forceRefresh: boolean = false) => {
    const now = Date.now();
    if (!forceRefresh && cachedCategories && now - cachedCategories.timestamp < CACHE_TTL_MS) {
      return { data: cachedCategories.data } as any;
    }
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    if (res.data?.success) {
      cachedCategories = { data: res.data, timestamp: now };
    }
    return res;
  },
  getBySlug: (slug: string) => api.get<ApiResponse<Category>>(`/categories/${slug}`),
};

// 4. Cart API
export const cartApi = {
  getCart: () => api.get<ApiResponse<Cart>>('/cart'),
  addItem: (productId: string, quantity: number = 1) =>
    api.post<ApiResponse<null>>('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put<ApiResponse<any>>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete<ApiResponse<null>>(`/cart/items/${itemId}`),
  clearCart: () => api.delete<ApiResponse<null>>('/cart'),
};

// 5. Wishlist API
export const wishlistApi = {
  getWishlist: () => api.get<ApiResponse<Product[]>>('/wishlist'),
  toggle: (productId: string) =>
    api.post<ApiResponse<{ inWishlist: boolean }>>('/wishlist/toggle', { productId }),
};

// 6. Orders API
export const orderApi = {
  checkout: (data: {
    shippingAddress: string;
    contactPhone: string;
    paymentMethod: string;
    notes?: string;
    directItem?: { productId: string; quantity: number };
  }) => api.post<ApiResponse<{ order: Order; payment?: any }>>('/orders/checkout', data),
  getMyOrders: () => api.get<ApiResponse<Order[]>>('/orders/my-orders'),
  getOrderById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),
  getById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),
  cancelOrder: (id: string) => api.post<ApiResponse<Order>>(`/orders/${id}/cancel`),
};

// 7. Reviews API
export const reviewApi = {
  getProductReviews: (productId: string) =>
    api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`),
  getByProduct: (productId: string) =>
    api.get<ApiResponse<{ reviews: Review[]; total: number; averageRating: number }>>(
      `/reviews/product/${productId}`
    ),
  createReview: (data: { productId: string; rating: number; comment?: string }) =>
    api.post<ApiResponse<Review>>('/reviews', data),
  create: (data: { productId: string; rating: number; comment?: string }) =>
    api.post<ApiResponse<Review>>('/reviews', data),
};

// 8. Farmer API
export const farmerApi = {
  getDashboard: () => api.get<ApiResponse<FarmerDashboardData>>('/farmer/dashboard'),
  getProducts: () => api.get<ApiResponse<Product[]>>('/farmer/products'),
  getOrders: (params?: { status?: string }) =>
    api.get<ApiResponse<OrderItem[]>>('/farmer/orders', { params }),
  updateOrderStatus: (orderId: string, status: string) =>
    api.patch<ApiResponse<Order>>(`/farmer/orders/${orderId}/status`, { status }),
  toggleProductStock: (productId: string) =>
    api.patch<ApiResponse<Product>>(`/farmer/products/${productId}/toggle-stock`),
};

// 9. Admin API
export const adminApi = {
  getStats: () => api.get<ApiResponse<AdminStats>>('/admin/stats'),
  getUsers: (params?: any) => api.get<ApiResponse<User[]>>('/admin/users', { params }),
  deleteUser: (id: string) => api.delete<ApiResponse<null>>(`/admin/users/${id}`),
  getAllFarmers: () => api.get<ApiResponse<any[]>>('/admin/farmers'),
  toggleUserStatus: (id: string) => api.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-status`),
  toggleFarmerApproval: (id: string) =>
    api.patch<ApiResponse<{ isApproved: boolean }>>(`/admin/farmers/${id}/toggle-approval`),
  verifyFarmer: (farmerId: string, isVerified: boolean) =>
    api.patch<ApiResponse<any>>(`/admin/farmers/${farmerId}/toggle-approval`),
  getOrders: (params?: any) => api.get<ApiResponse<Order[]>>('/admin/orders', { params }),
  getOrderById: (id: string) => api.get<ApiResponse<Order>>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, data: { orderStatus: string; paymentStatus?: string; notes?: string }) =>
    api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, data),
  processRefund: (id: string, data: { refundReason: string; refundAmount?: number }) =>
    api.post<ApiResponse<Order>>(`/admin/orders/${id}/refund`, data),
  getReviews: () => api.get<ApiResponse<Review[]>>('/admin/reviews'),
  deleteReview: (id: string) => api.delete<ApiResponse<null>>(`/admin/reviews/${id}`),
  createCategory: (data: any) => {
    cachedCategories = null;
    return api.post<ApiResponse<any>>('/categories', data);
  },
  updateCategory: (id: string, data: any) => {
    cachedCategories = null;
    return api.put<ApiResponse<any>>(`/categories/${id}`, data);
  },
  deleteCategory: (id: string) => {
    cachedCategories = null;
    return api.delete<ApiResponse<null>>(`/categories/${id}`);
  },
};

// 10. Notifications API
export const notificationApi = {
  getMyNotifications: () =>
    api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>('/notifications'),
  markAsRead: (id: string = 'all') => api.patch<ApiResponse<null>>(`/notifications/${id}/read`),
};

// 11. Upload API
export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{ url: string; filename: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
