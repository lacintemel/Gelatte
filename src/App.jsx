import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';

import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';

// Admin Components
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <LanguageProvider>
          <ToastProvider>
            <WishlistProvider>
              <CartProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/shop/product/:id" element={<ProductDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />

                    {/* Admin Login */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={<AdminProtectedRoute />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/new" element={<AdminProductForm />} />
                        <Route path="products/:id" element={<AdminProductForm />} />
                        <Route path="categories" element={<AdminCategories />} />
                      </Route>
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </WishlistProvider>
          </ToastProvider>
        </LanguageProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
