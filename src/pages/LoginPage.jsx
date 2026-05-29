import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import ShopNavbar from '../components/ShopNavbar';
import CartDrawer from '../components/CartDrawer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/account" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      addToast(t('auth_welcome_back'), 'success');
      navigate('/account');
    } else {
      setError(t(result.error) || t('auth_invalid_credentials'));
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
              <LogIn className="w-7 h-7 text-cream" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-center text-espresso mb-1">{t('auth_login')}</h1>
          <p className="text-warm-gray text-center text-sm mb-8">{t('auth_login_desc')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com" required autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('auth_password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-espresso transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-espresso text-cream rounded-xl font-medium tracking-wider uppercase hover:bg-walnut-light disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> : t('auth_login')}
            </button>
          </form>

          <p className="text-center text-sm text-warm-gray mt-6">
            {t('auth_no_account')}{' '}
            <Link to="/register" className="text-gold-dark font-medium hover:text-espresso transition-colors">{t('auth_register')}</Link>
          </p>
        </div>
      </div>
    </>
  );
}
