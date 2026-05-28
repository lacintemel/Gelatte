import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Package, FolderTree, LogOut, Menu, X, ArrowLeft, 
  ShoppingCart, Ticket, Users, ScrollText, Shield, User, TrendingUp
} from 'lucide-react';

export default function AdminLayout() {
  const { logout, currentUser, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Build nav items based on role
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['superadmin', 'admin'] },
    { name: 'Ürünler', path: '/admin/products', icon: Package, roles: ['superadmin', 'admin'] },
    { name: 'Siparişler', path: '/admin/orders', icon: ShoppingCart, roles: ['superadmin', 'admin'] },
    { name: 'Kategoriler', path: '/admin/categories', icon: FolderTree, roles: ['superadmin'] },
    { name: 'Kuponlar', path: '/admin/coupons', icon: Ticket, roles: ['superadmin'] },
    { name: 'Finansal Geçmiş', path: '/admin/financials', icon: TrendingUp, roles: ['superadmin'] },
    { name: 'Personel Yönetimi', path: '/admin/staff', icon: Users, roles: ['superadmin'] },
    { name: 'İşlem Kayıtları', path: '/admin/audit-logs', icon: ScrollText, roles: ['superadmin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUser?.role));

  const roleBadge = isSuperAdmin
    ? { label: 'Super Admin', bg: 'bg-amber-100', text: 'text-amber-800', icon: Shield }
    : { label: 'Personel', bg: 'bg-blue-100', text: 'text-blue-800', icon: User };

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

          {/* User Info */}
          <div className="px-4 py-3 border-b border-cream-dark/25">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-espresso flex items-center justify-center">
                <roleBadge.icon className="w-4.5 h-4.5 text-cream" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-espresso truncate">
                  {currentUser?.username || currentUser?.name}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase ${roleBadge.bg} ${roleBadge.text}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => {
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
              Mağazaya Dön
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
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
