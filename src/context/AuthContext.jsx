import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const USERS_KEY = 'gelatte_users';
const SESSION_KEY = 'gelatte_session';

// Roles hierarchy
const ROLES = {
  superadmin: { level: 3, label: 'Super Admin' },
  admin: { level: 2, label: 'Admin' },
  customer: { level: 1, label: 'Customer' },
};

// Simple hash (for demo — in production use bcrypt via backend)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function getDefaultUsers() {
  return [
    {
      id: 'usr_superadmin',
      email: 'admin@gelatte.com',
      name: 'Super Admin',
      passwordHash: simpleHash('admin123'),
      role: 'superadmin',
      phone: '',
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_staff',
      email: 'staff@gelatte.com',
      name: 'Staff Member',
      passwordHash: simpleHash('staff123'),
      role: 'admin',
      phone: '',
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date().toISOString(),
    },
  ];
}

function loadUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) return JSON.parse(data);
    const defaults = getDefaultUsers();
    localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
    return defaults;
  } catch {
    return getDefaultUsers();
  }
}

function loadSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    // Check expiry (24h for admin, 7d for customer)
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [session, setSession] = useState(loadSession);
  const [currentUser, setCurrentUser] = useState(null);

  // Resolve current user from session
  useEffect(() => {
    if (session) {
      const user = users.find((u) => u.id === session.userId);
      setCurrentUser(user || null);
      if (!user) {
        // Invalid session
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [session, users]);

  // Persist users
  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  // ── Login ──
  const login = useCallback((email, password) => {
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) return { success: false, error: 'auth_invalid_credentials' };
    if (user.passwordHash !== simpleHash(password))
      return { success: false, error: 'auth_invalid_credentials' };

    const isAdminRole = user.role === 'superadmin' || user.role === 'admin';
    const expiresAt = new Date(
      Date.now() + (isAdminRole ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)
    ).toISOString();

    const newSession = {
      userId: user.id,
      role: user.role,
      token: `tk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return { success: true, user, isAdmin: isAdminRole };
  }, [users]);

  // ── Admin Login (convenience) ──
  const adminLogin = useCallback((email, password) => {
    const result = login(email, password);
    if (!result.success) return result;
    if (result.user.role !== 'superadmin' && result.user.role !== 'admin') {
      // Not an admin — clear session
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
      return { success: false, error: 'auth_not_admin' };
    }
    return result;
  }, [login]);

  // ── Register (customers only) ──
  const register = useCallback((userData) => {
    const { email, password, name, phone } = userData;
    if (!email || !password || !name)
      return { success: false, error: 'auth_missing_fields' };

    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: 'auth_email_exists' };

    if (password.length < 6)
      return { success: false, error: 'auth_weak_password' };

    const newUser = {
      id: `usr_${Date.now().toString(36)}`,
      email: email.toLowerCase(),
      name,
      phone: phone || '',
      passwordHash: simpleHash(password),
      role: 'customer',
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // Auto-login after register
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newSession = {
      userId: newUser.id,
      role: 'customer',
      token: `tk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);

    return { success: true, user: newUser };
  }, [users]);

  // ── Logout ──
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setCurrentUser(null);
  }, []);

  // ── Update Profile ──
  const updateProfile = useCallback((updates) => {
    if (!currentUser) return false;
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    return true;
  }, [currentUser, users]);

  // ── Change Password ──
  const changePassword = useCallback((oldPassword, newPassword) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    if (currentUser.passwordHash !== simpleHash(oldPassword))
      return { success: false, error: 'auth_invalid_credentials' };
    if (newPassword.length < 6)
      return { success: false, error: 'auth_weak_password' };

    const updatedUsers = users.map((u) =>
      u.id === currentUser.id
        ? { ...u, passwordHash: simpleHash(newPassword) }
        : u
    );
    setUsers(updatedUsers);
    return { success: true };
  }, [currentUser, users]);

  // ── Admin: manage staff ──
  const addStaffUser = useCallback((userData) => {
    if (!currentUser || currentUser.role !== 'superadmin')
      return { success: false, error: 'Unauthorized' };

    if (users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase()))
      return { success: false, error: 'auth_email_exists' };

    const newUser = {
      id: `usr_${Date.now().toString(36)}`,
      email: userData.email.toLowerCase(),
      name: userData.name,
      phone: userData.phone || '',
      passwordHash: simpleHash(userData.password),
      role: userData.role || 'admin',
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true, user: newUser };
  }, [currentUser, users]);

  // Derived state
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.role === 'superadmin';
  // Backward compatibility
  const isAdminAuth = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        isAuthenticated,
        isAdmin,
        isAdminAuth,
        isSuperAdmin,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        changePassword,
        addStaffUser,
        users,
        ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
