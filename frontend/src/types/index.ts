export type Role = 'CUSTOMER' | 'FARMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'NETBANKING';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  bio?: string;
  location: string;
  state?: string;
  farmSizeAcres?: number;
  experienceYears?: number;
  rating: number;
  isVerified: boolean;
  idProofUrl?: string;
  bankAccount?: string;
  ifscCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  preferredLanguage?: string;
  defaultAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
  isApproved: boolean;
  farmerProfile?: FarmerProfile;
  customerProfile?: CustomerProfile;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  farmerId: string;
  farmer?: {
    id: string;
    name: string;
    avatar?: string;
    city?: string;
    state?: string;
    email?: string;
    phone?: string;
    farmerProfile?: {
      farmName: string;
      isVerified: boolean;
      rating: number;
      location?: string;
      bio?: string;
    };
  };
  categoryId: string;
  category?: Category;
  name: string;
  description: string;
  images: string[];
  price: number;
  originalPrice?: number;
  quantity: number;
  unit: string;
  location: string;
  harvestDate?: string;
  isOrganic: boolean;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
  reviews?: Review[];
  relatedProducts?: Product[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  subtotal: number;
  isAvailable: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  order?: Order;
  productId: string;
  product: Product;
  farmerId: string;
  farmer?: {
    id: string;
    name: string;
    phone?: string;
    city?: string;
    farmerProfile?: {
      farmName: string;
      rating?: number;
      isVerified?: boolean;
    };
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
  customerId: string;
  customer?: {
    id: string;
    name: string;
    avatar?: string;
    city?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ORDER' | 'PROMOTION' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FarmerDashboardData {
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    rating: number;
    isVerified: boolean;
  };
  recentOrders: OrderItem[];
  recentProducts: Product[];
}

export interface AdminStats {
  stats: {
    totalUsers: number;
    totalFarmers: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingFarmersCount: number;
  };
  recentOrders: Order[];
  recentUsers: User[];
}
