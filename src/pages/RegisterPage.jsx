import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Phone } from 'lucide-react';
import ShopNavbar from '../components/ShopNavbar';
import CartDrawer from '../components/CartDrawer';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/account" replace />;

  const update = (key, val) => { setForm(f => ({ ...f, [key]: val })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError(t('auth_passwords_mismatch')); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);
    if (result.success) {
      addToast(t('auth_register_success'), 'success');
      navigate('/account');
    } else {
      const msgs = {
        auth_email_exists: t('auth_email_exists'),
        auth_weak_password: t('auth_weak_password'),
        auth_missing_fields: t('auth_missing_fields'),
      };
      setError(msgs[result.error] || 'Registration failed');
    }
  };

  return (
    <>
      <ShopNavbar />
      <CartDrawer />
      <div className="min-h-screen bg-champagne pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="bg-ivory p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-cream-dark/25">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-espresso rounded-2xl flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-cream" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-center text-espresso mb-1">{t('auth_register')}</h1>
          <p className="text-warm-gray text-center text-sm mb-8">{t('auth_register_desc')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_name')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder={t('auth_name_ph')} required className="w-full pl-11 pr-4 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com" required autoComplete="email" className="w-full pl-11 pr-4 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_phone')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="+49 123 456 789" className="w-full pl-11 pr-4 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                    placeholder="••••••" required minLength={6} className="w-full pl-10 pr-3 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_confirm_pw')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                  <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                    placeholder="••••••" required minLength={6} className="w-full pl-10 pr-3 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-xs text-warm-gray hover:text-espresso flex items-center gap-1 transition-colors">
                {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {showPw ? 'Hide' : 'Show'}
              </button>
            </div>

            {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-espresso text-cream rounded-xl font-medium tracking-wider uppercase hover:bg-walnut-light disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> : t('auth_register')}
            </button>
          </form>

          <p className="text-center text-sm text-warm-gray mt-6">
            {t('auth_have_account')}{' '}
            <Link to="/login" className="text-gold-dark font-medium hover:text-espresso transition-colors">{t('auth_login')}</Link>
          </p>
        </div>
      </div>
    </>
  );
}
