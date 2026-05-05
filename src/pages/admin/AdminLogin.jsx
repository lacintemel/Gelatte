import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-champagne flex items-center justify-center p-4">
      <div className="bg-ivory p-8 rounded-2xl shadow-xl w-full max-w-md border border-cream-dark/25">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-espresso rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-cream" />
          </div>
        </div>
        
        <h1 className="font-display text-2xl font-bold text-center text-espresso mb-2">
          Admin Access
        </h1>
        <p className="text-warm-gray text-center text-sm mb-8">
          Please enter the admin password to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
            />
            {error && <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-espresso text-cream rounded-xl font-medium tracking-wide hover:bg-walnut-light transition-colors"
          >
            Login
          </button>
        </form>
        <p className="text-xs text-warm-gray mt-6 text-center">
          Hint: try '[REDACTED]'
        </p>
      </div>
    </div>
  );
}
