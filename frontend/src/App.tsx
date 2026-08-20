import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';

// Auth Pages
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';

// Farmer Pages
import { FarmerDashboard } from './pages/Farmer/FarmerDashboard';
import { FarmerProductsPage } from './pages/Farmer/FarmerProductsPage';
import { FarmerAddEditProductPage } from './pages/Farmer/FarmerAddEditProductPage';
import { FarmerOrdersPage } from './pages/Farmer/FarmerOrdersPage';

// Customer Pages
import { CustomerDashboard } from './pages/Customer/CustomerDashboard';
import { CustomerOrdersPage } from './pages/Customer/CustomerOrdersPage';
import { CustomerWishlistPage } from './pages/Customer/CustomerWishlistPage';
import { CustomerProfilePage } from './pages/Customer/CustomerProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminFarmersPage } from './pages/Admin/AdminFarmersPage';
import { AdminProductsPage } from './pages/Admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/Admin/AdminOrdersPage';
import { AdminUsersPage } from './pages/Admin/AdminUsersPage';

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
                <Navbar />
                <main className="flex-1 pb-16 md:pb-0">
                  <Routes>
                    {/* Public Marketplace & Home Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Customer Protected Routes */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-success/:id"
                      element={
                        <ProtectedRoute>
                          <OrderSuccessPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/track/:id"
                      element={
                        <ProtectedRoute>
                          <OrderTrackingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/dashboard"
                      element={
                        <ProtectedRoute>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/orders"
                      element={
                        <ProtectedRoute>
                          <CustomerOrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/wishlist"
                      element={
                        <ProtectedRoute>
                          <CustomerWishlistPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/profile"
                      element={
                        <ProtectedRoute>
                          <CustomerProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Farmer Protected Routes */}
                    <Route
                      path="/farmer/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                          <FarmerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farmer/products"
                      element={
                        <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                          <FarmerProductsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farmer/products/new"
                      element={
                        <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                          <FarmerAddEditProductPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farmer/products/edit/:id"
                      element={
                        <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                          <FarmerAddEditProductPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farmer/orders"
                      element={
                        <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                          <FarmerOrdersPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Protected Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/farmers"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminFarmersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminProductsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminOrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminUsersPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
                <BottomNav />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
