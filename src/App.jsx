import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { ReviewProvider } from './context/ReviewContext';
import { OrderProvider } from './context/OrderContext';
import { CouponProvider } from './context/CouponContext';
import { ThemeProvider } from './context/ThemeContext';
import { FinancialProvider } from './context/FinancialContext';
import { CMSProvider } from './context/CMSContext';

import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';

// Admin Components
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminStaffManagement from './pages/admin/AdminStaffManagement';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminFinancialHistory from './pages/admin/AdminFinancialHistory';
import AdminCMS from './pages/admin/AdminCMS';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <LanguageProvider>
            <ToastProvider>
              <WishlistProvider>
                <CartProvider>
                  <ReviewProvider>
                    <OrderProvider>
                      <CouponProvider>
                        <FinancialProvider>
                          <CMSProvider>
                            <BrowserRouter>
                              <ScrollToTop />
                              <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/shop" element={<ShopPage />} />
                                <Route path="/shop/product/:id" element={<ProductDetailPage />} />
                                <Route path="/checkout" element={<CheckoutPage />} />
                                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                                <Route path="/payment/fail" element={<PaymentFailPage />} />

                                {/* Customer Auth */}
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/account" element={<AccountPage />} />

                                {/* Admin Login */}
                                <Route path="/admin/login" element={<AdminLogin />} />

                                {/* Protected Admin Routes */}
                                <Route path="/admin" element={<AdminProtectedRoute />}>
                                  <Route element={<AdminLayout />}>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="products/new" element={<AdminProductForm />} />
                                    <Route path="products/:id" element={<AdminProductForm />} />
                                    <Route path="orders" element={<AdminOrders />} />

                                    {/* Super Admin Only Routes */}
                                    <Route element={<AdminProtectedRoute requiredRole="superadmin" />}>
                                      <Route path="categories" element={<AdminCategories />} />
                                      <Route path="coupons" element={<AdminCoupons />} />
                                      <Route path="cms" element={<AdminCMS />} />
                                      <Route path="staff" element={<AdminStaffManagement />} />
                                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                                      <Route path="financials" element={<AdminFinancialHistory />} />
                                    </Route>
                                  </Route>
                                </Route>

                                {/* Catch-all — redirect unknown routes to home */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                              </Routes>
                            </BrowserRouter>
                          </CMSProvider>
                        </FinancialProvider>
                      </CouponProvider>
                    </OrderProvider>
                  </ReviewProvider>
                </CartProvider>
              </WishlistProvider>
            </ToastProvider>
          </LanguageProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
