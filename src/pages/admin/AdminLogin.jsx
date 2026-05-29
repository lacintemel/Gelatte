import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already admin, redirect
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminLogin(username, password);

      if (result.success) {
        navigate('/admin');
      } else {
        const errorMessages = {
          auth_invalid_credentials: 'Geçersiz kullanıcı adı veya şifre',
          auth_not_admin: 'Bu hesabın yönetici erişimi yok',
          auth_account_disabled: 'Bu hesap devre dışı bırakılmıştır',
        };
        setError(errorMessages[result.error] || 'Giriş başarısız');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champagne flex items-center justify-center p-4">
      <div className="bg-ivory p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-cream-dark/25">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-espresso rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-cream" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-center text-espresso mb-1">
          Yönetim Paneli
        </h1>
        <p className="text-warm-gray text-center text-sm mb-8">
          Yönetici bilgilerinizle giriş yapın
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-espresso transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <Lock className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-espresso text-cream rounded-xl font-medium tracking-wider uppercase hover:bg-walnut-light disabled:opacity-50 disabled:cursor-wait transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
