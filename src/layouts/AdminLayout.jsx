import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, FolderTree, LogOut, Menu, X, ArrowLeft, ShoppingCart, Ticket } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-champagne flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-espresso/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-ivory border-r border-cream-dark/25 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-cream-dark/25">
            <Link to="/admin" className="font-display text-2xl font-bold text-espresso tracking-[0.08em]">
              ADMIN
            </Link>
            <button className="md:hidden text-warm-gray" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-espresso text-cream shadow-md' 
                      : 'text-warm-gray hover:bg-cream hover:text-espresso'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-cream-dark/25 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-gray hover:bg-cream hover:text-espresso transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Shop
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-ivory border-b border-cream-dark/25 px-6 py-4 flex items-center md:hidden">
          <button 
            className="text-espresso p-2 -ml-2 rounded-lg hover:bg-cream"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display text-xl font-bold text-espresso tracking-[0.08em] ml-4">
            ADMIN
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
