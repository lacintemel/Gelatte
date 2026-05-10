import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { User, Package, LogOut, Settings, MapPin, Phone, Mail, Truck, Store, Eye, Clock, CheckCircle, XCircle, ChefHat, Save } from 'lucide-react';
import ShopNavbar from '../components/ShopNavbar';
import CartDrawer from '../components/CartDrawer';

const STATUS_ICONS = { new: Clock, preparing: ChefHat, ready: CheckCircle, completed: CheckCircle, cancelled: XCircle };
const STATUS_COLORS = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  preparing: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AccountPage() {
  const { currentUser, updateProfile, changePassword, logout, isAuthenticated } = useAuth();
  const { orders } = useOrders();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [profileForm, setProfileForm] = useState(null);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  if (!isAuthenticated) { navigate('/login', { replace: true }); return null; }

  // Customer's orders
  const myOrders = orders.filter(o => o.customer?.email?.toLowerCase() === currentUser?.email?.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const initProfileForm = () => {
    if (!profileForm) {
      setProfileForm({
        name: currentUser.name || '', phone: currentUser.phone || '',
        address: currentUser.address || '', city: currentUser.city || '', zip: currentUser.zip || '',
        deliveryPreference: currentUser.deliveryPreference || 'delivery',
      });
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    addToast(t('auth_profile_saved'), 'success');
  };

  const handleChangePw = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      addToast(t('auth_passwords_mismatch'), 'warning'); return;
    }
    const result = changePassword(pwForm.oldPassword, pwForm.newPassword);
    if (result.success) {
      addToast(t('auth_password_changed'), 'success');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      addToast(t(result.error) || 'Failed', 'warning');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const tabs = [
    { id: 'orders', icon: Package, label: t('auth_my_orders') },
    { id: 'profile', icon: Settings, label: t('auth_profile') },
  ];

  return (
    <>
      <ShopNavbar />
      <CartDrawer />
      <div className="min-h-screen bg-champagne pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-espresso rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-cream" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-espresso">{currentUser?.name}</h1>
                <p className="text-sm text-warm-gray">{currentUser?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all">
              <LogOut className="w-4 h-4" /> {t('auth_logout')}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => { setTab(tb.id); if (tb.id === 'profile') initProfileForm(); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${tab === tb.id ? 'bg-espresso text-cream shadow-md' : 'bg-ivory border border-cream-dark/20 text-walnut-light hover:bg-cream'}`}>
                <tb.icon className="w-4 h-4" /> {tb.label}
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="space-y-4">
              {myOrders.length > 0 ? myOrders.map(order => {
                const StatusIcon = STATUS_ICONS[order.status] || Clock;
                return (
                  <div key={order.id} className="bg-ivory rounded-2xl border border-cream-dark/15 p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="font-display text-lg font-bold text-espresso">{order.id}</span>
                        <p className="text-xs text-warm-gray mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
                          <StatusIcon className="w-3 h-3" /> {t(`ord_${order.status}`)}
                        </span>
                        <span className="font-display text-lg font-bold text-espresso">€{(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-cream-light text-xs text-walnut-light border border-cream-dark/10">
                          {t(item.name)} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-16 bg-ivory rounded-2xl border border-cream-dark/15">
                  <Package className="w-12 h-12 text-warm-gray mx-auto mb-4" />
                  <p className="font-display text-lg text-espresso mb-2">{t('ord_no_orders')}</p>
                  <Link to="/shop" className="text-sm text-gold-dark hover:text-espresso font-medium">{t('cart_browse')}</Link>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && profileForm && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Form */}
              <div className="bg-ivory rounded-2xl border border-cream-dark/15 p-6">
                <h2 className="font-display text-lg font-bold text-espresso mb-5">{t('auth_profile')}</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_name')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                      <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="form-input pl-11" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                      <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="form-input pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_address')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                      <input type="text" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="form-input pl-11" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('ch_city')}</label>
                      <input type="text" value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="form-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('ch_zip')}</label>
                      <input type="text" value={profileForm.zip} onChange={e => setProfileForm({ ...profileForm, zip: e.target.value })}
                        className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-3">{t('auth_delivery_pref')}</label>
                    <div className="flex gap-3">
                      {[{ id: 'delivery', icon: Truck, label: t('auth_pref_delivery') }, { id: 'takeaway', icon: Store, label: t('auth_pref_takeaway') }].map(opt => (
                        <button key={opt.id} type="button" onClick={() => setProfileForm({ ...profileForm, deliveryPreference: opt.id })}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${profileForm.deliveryPreference === opt.id ? 'bg-espresso text-cream border-espresso' : 'bg-cream-light border-cream-dark/20 text-walnut-light hover:bg-cream'}`}>
                          <opt.icon className="w-4 h-4" /> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-espresso text-cream rounded-xl font-medium tracking-wider uppercase hover:bg-walnut-light transition-all flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> {t('auth_save')}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-ivory rounded-2xl border border-cream-dark/15 p-6">
                <h2 className="font-display text-lg font-bold text-espresso mb-5">{t('auth_change_pw')}</h2>
                <form onSubmit={handleChangePw} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_current_pw')}</label>
                    <input type="password" value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                      className="form-input" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_new_pw')}</label>
                    <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      className="form-input" required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_confirm_pw')}</label>
                    <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      className="form-input" required minLength={6} />
                  </div>
                  <button type="submit" className="w-full py-3 bg-espresso text-cream rounded-xl font-medium tracking-wider uppercase hover:bg-walnut-light transition-all">
                    {t('auth_change_pw')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
