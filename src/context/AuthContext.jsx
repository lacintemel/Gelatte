import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('gelatte_admin_auth');
    if (auth === 'true') {
      setIsAdminAuth(true);
    }
  }, []);

  const login = (password) => {
    // Mock login: password is 'admin123'
    if (password === 'admin123') {
      setIsAdminAuth(true);
      localStorage.setItem('gelatte_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminAuth(false);
    localStorage.removeItem('gelatte_admin_auth');
  };

  return (
    <AuthContext.Provider value={{ isAdminAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
