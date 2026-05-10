import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already admin, redirect
  if (isAdmin) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));

    const result = adminLogin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      const errorMessages = {
        auth_invalid_credentials: 'Invalid email or password',
        auth_not_admin: 'This account does not have admin access',
      };
      setError(errorMessages[result.error] || 'Login failed');
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
          Admin Panel
        </h1>
        <p className="text-warm-gray text-center text-sm mb-8">
          Sign in with your admin credentials
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-champagne border border-cream-dark/25 text-espresso text-sm placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
              Password
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
              'Sign In'
            )}
          </button>
        </form>

        {/* Credentials hint */}
        <div className="mt-8 p-4 rounded-xl bg-cream-light border border-cream-dark/15">
          <p className="text-[11px] text-warm-gray tracking-wide uppercase font-medium mb-2">Demo Credentials</p>
          <div className="space-y-1 text-xs text-walnut-light">
            <p><strong>Super Admin:</strong> admin@example.com / [REDACTED]</p>
            <p><strong>Staff:</strong> staff@example.com / [REDACTED]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
