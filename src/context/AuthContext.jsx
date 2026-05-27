import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const USERS_KEY = 'gelatte_users';
const SESSION_KEY = 'gelatte_session';
const AUDIT_LOG_KEY = 'gelatte_audit_log';
const LOGIN_HISTORY_KEY = 'gelatte_login_history';

// Roles hierarchy
const ROLES = {
  superadmin: { level: 3, label: 'Super Admin' },
  admin: { level: 2, label: 'Staff' },
  customer: { level: 1, label: 'Customer' },
};

// ── Secure password hashing (SHA-256 via SubtleCrypto) ──
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '__gelatte_salt_2024__');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed hashes for default accounts (so we can initialize synchronously)
// These were computed using the hashPassword function above:
// hashPassword('IlkMert#7392!Qx') and hashPassword('Personel2024!')
const PRECOMPUTED_HASHES = {
  ilkmert: null,     // Will be computed on first load
  personel: null,    // Will be computed on first load
};

function getDefaultUsers() {
  return [
    {
      id: 'usr_superadmin_ilkmert',
      username: 'ilkmert',
      email: 'ilkmert@gelatte.com',
      name: 'İlk Mert',
      passwordHash: null, // Will be set asynchronously on first load
      role: 'superadmin',
      isActive: true,
      phone: '',
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date('2024-01-01').toISOString(),
    },
    {
      id: 'usr_staff_personel',
      username: 'personel',
      email: 'personel@gelatte.com',
      name: 'Personel',
      passwordHash: null, // Will be set asynchronously on first load
      role: 'admin',
      isActive: true,
      phone: '',
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date('2024-01-01').toISOString(),
    },
  ];
}

function loadUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
      const users = JSON.parse(data);
      // Ensure all users have required fields
      return users.map(u => ({
        ...u,
        isActive: u.isActive !== undefined ? u.isActive : true,
        username: u.username || u.email?.split('@')[0] || '',
      }));
    }
    return null; // Signal that we need to initialize
  } catch {
    return null;
  }
}

function loadSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function loadAuditLog() {
  try {
    const data = localStorage.getItem(AUDIT_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadLoginHistory() {
  try {
    const data = localStorage.getItem(LOGIN_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(loadSession);
  const [currentUser, setCurrentUser] = useState(null);
  const [auditLog, setAuditLog] = useState(loadAuditLog);
  const [loginHistory, setLoginHistory] = useState(loadLoginHistory);
  const [initialized, setInitialized] = useState(false);

  // ── Initialize users (async because of password hashing) ──
  useEffect(() => {
    async function initUsers() {
      const existingUsers = loadUsers();
      if (existingUsers && existingUsers.length > 0) {
        // Check if we need to migrate from old system
        const hasOldAdmin = existingUsers.some(u => u.email === 'admin@example.com');
        const hasNewAdmin = existingUsers.some(u => u.username === 'ilkmert');

        if (hasOldAdmin && !hasNewAdmin) {
          // Migration: remove old default users, add new ones
          const nonDefaultUsers = existingUsers.filter(
            u => u.email !== 'admin@example.com' && u.email !== 'staff@example.com'
          );
          const ilkmertHash = await hashPassword('IlkMert#7392!Qx');
          const personelHash = await hashPassword('Personel2024!');
          const newDefaults = getDefaultUsers();
          newDefaults[0].passwordHash = ilkmertHash;
          newDefaults[1].passwordHash = personelHash;
          const mergedUsers = [...newDefaults, ...nonDefaultUsers];
          setUsers(mergedUsers);
          localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
        } else {
          setUsers(existingUsers);
        }
      } else {
        // Fresh start — create default users
        const ilkmertHash = await hashPassword('IlkMert#7392!Qx');
        const personelHash = await hashPassword('Personel2024!');
        const defaults = getDefaultUsers();
        defaults[0].passwordHash = ilkmertHash;
        defaults[1].passwordHash = personelHash;
        setUsers(defaults);
        localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
      }
      setInitialized(true);
    }
    initUsers();
  }, []);

  // Resolve current user from session
  useEffect(() => {
    if (!initialized) return;
    if (session) {
      const user = users.find((u) => u.id === session.userId);
      setCurrentUser(user || null);
      if (!user) {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [session, users, initialized]);

  // Persist users
  useEffect(() => {
    if (initialized && users.length > 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users, initialized]);

  // Persist audit log
  useEffect(() => {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLog));
  }, [auditLog]);

  // Persist login history
  useEffect(() => {
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(loginHistory));
  }, [loginHistory]);

  // ── Audit Logging ──
  const logAuditEvent = useCallback((action, details = {}, userId = null) => {
    const event = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: userId || currentUser?.id || 'system',
      username: userId
        ? users.find(u => u.id === userId)?.username || 'unknown'
        : currentUser?.username || 'system',
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date().toISOString(),
    };
    setAuditLog((prev) => [event, ...prev].slice(0, 1000)); // Keep last 1000 events
  }, [currentUser, users]);

  // ── Login History ──
  const logLoginAttempt = useCallback((username, success, role = null) => {
    const entry = {
      id: `login_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      username,
      success,
      role,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    setLoginHistory((prev) => [entry, ...prev].slice(0, 500));
  }, []);

  // ── Login (supports both email and username) ──
  const login = useCallback(async (identifier, password) => {
    const user = users.find(
      (u) =>
        u.email?.toLowerCase() === identifier.toLowerCase() ||
        u.username?.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      logLoginAttempt(identifier, false);
      return { success: false, error: 'auth_invalid_credentials' };
    }

    // Check if account is active
    if (user.isActive === false) {
      logLoginAttempt(user.username, false, user.role);
      return { success: false, error: 'auth_account_disabled' };
    }

    const inputHash = await hashPassword(password);
    if (user.passwordHash !== inputHash) {
      logLoginAttempt(user.username, false, user.role);
      return { success: false, error: 'auth_invalid_credentials' };
    }

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

    logLoginAttempt(user.username, true, user.role);
    logAuditEvent('user.login', { username: user.username, role: user.role }, user.id);

    return { success: true, user, isAdmin: isAdminRole };
  }, [users, logLoginAttempt, logAuditEvent]);

  // ── Admin Login (convenience) ──
  const adminLogin = useCallback(async (identifier, password) => {
    const result = await login(identifier, password);
    if (!result.success) return result;
    if (result.user.role !== 'superadmin' && result.user.role !== 'admin') {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
      return { success: false, error: 'auth_not_admin' };
    }
    return result;
  }, [login]);

  // ── Register (customers only) ──
  const register = useCallback(async (userData) => {
    const { email, password, name, phone } = userData;
    if (!email || !password || !name)
      return { success: false, error: 'auth_missing_fields' };

    if (users.find((u) => u.email?.toLowerCase() === email.toLowerCase()))
      return { success: false, error: 'auth_email_exists' };

    if (password.length < 6)
      return { success: false, error: 'auth_weak_password' };

    const pwHash = await hashPassword(password);

    const newUser = {
      id: `usr_${Date.now().toString(36)}`,
      email: email.toLowerCase(),
      username: email.toLowerCase().split('@')[0],
      name,
      phone: phone || '',
      passwordHash: pwHash,
      role: 'customer',
      isActive: true,
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

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
    if (currentUser) {
      logAuditEvent('user.logout', { username: currentUser.username });
    }
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setCurrentUser(null);
  }, [currentUser, logAuditEvent]);

  // ── Update Profile ──
  const updateProfile = useCallback((updates) => {
    if (!currentUser) return false;
    // Never allow updating passwordHash, role, id through this method
    const { passwordHash, role, id, ...safeUpdates } = updates;
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, ...safeUpdates } : u
    );
    setUsers(updatedUsers);
    logAuditEvent('user.profile_updated', { fields: Object.keys(safeUpdates) });
    return true;
  }, [currentUser, users, logAuditEvent]);

  // ── Change own Password ──
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const oldHash = await hashPassword(oldPassword);
    if (currentUser.passwordHash !== oldHash)
      return { success: false, error: 'auth_invalid_credentials' };
    if (newPassword.length < 6)
      return { success: false, error: 'auth_weak_password' };

    const newHash = await hashPassword(newPassword);
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id
        ? { ...u, passwordHash: newHash }
        : u
    );
    setUsers(updatedUsers);
    logAuditEvent('user.password_changed', { target: currentUser.username });
    return { success: true };
  }, [currentUser, users, logAuditEvent]);

  // ══════════════════════════════════════════
  // ── Super Admin: Staff Management ──
  // ══════════════════════════════════════════

  // Add a new staff user
  const addStaffUser = useCallback(async (userData) => {
    if (!currentUser || currentUser.role !== 'superadmin')
      return { success: false, error: 'Unauthorized' };

    if (users.find((u) =>
      u.email?.toLowerCase() === userData.email?.toLowerCase() ||
      u.username?.toLowerCase() === userData.username?.toLowerCase()
    ))
      return { success: false, error: 'auth_email_exists' };

    if (!userData.password || userData.password.length < 6)
      return { success: false, error: 'auth_weak_password' };

    const pwHash = await hashPassword(userData.password);

    const newUser = {
      id: `usr_${Date.now().toString(36)}`,
      email: userData.email?.toLowerCase() || `${userData.username}@gelatte.com`,
      username: userData.username?.toLowerCase() || userData.email?.split('@')[0],
      name: userData.name || userData.username,
      phone: userData.phone || '',
      passwordHash: pwHash,
      role: 'admin', // Staff role
      isActive: true,
      address: '',
      city: '',
      zip: '',
      deliveryPreference: 'delivery',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    logAuditEvent('staff.created', {
      targetUsername: newUser.username,
      targetId: newUser.id,
    });
    return { success: true, user: newUser };
  }, [currentUser, users, logAuditEvent]);

  // Change a staff user's password (superadmin only)
  const changeStaffPassword = useCallback(async (staffId, newPassword) => {
    if (!currentUser || currentUser.role !== 'superadmin')
      return { success: false, error: 'Unauthorized' };

    const staffUser = users.find((u) => u.id === staffId);
    if (!staffUser) return { success: false, error: 'User not found' };
    if (staffUser.role === 'superadmin' && staffUser.id !== currentUser.id)
      return { success: false, error: 'Cannot change another superadmin password' };

    if (!newPassword || newPassword.length < 6)
      return { success: false, error: 'auth_weak_password' };

    const newHash = await hashPassword(newPassword);
    const updatedUsers = users.map((u) =>
      u.id === staffId ? { ...u, passwordHash: newHash } : u
    );
    setUsers(updatedUsers);
    logAuditEvent('staff.password_changed', {
      targetUsername: staffUser.username,
      targetId: staffId,
    });
    return { success: true };
  }, [currentUser, users, logAuditEvent]);

  // Toggle staff account active/inactive (superadmin only)
  const toggleStaffStatus = useCallback((staffId) => {
    if (!currentUser || currentUser.role !== 'superadmin')
      return { success: false, error: 'Unauthorized' };

    const staffUser = users.find((u) => u.id === staffId);
    if (!staffUser) return { success: false, error: 'User not found' };
    if (staffUser.role === 'superadmin')
      return { success: false, error: 'Cannot deactivate a superadmin' };

    const newStatus = !staffUser.isActive;
    const updatedUsers = users.map((u) =>
      u.id === staffId ? { ...u, isActive: newStatus } : u
    );
    setUsers(updatedUsers);

    // If the staff user is currently logged in and being deactivated, invalidate their session
    if (!newStatus && session?.userId === staffId) {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    }

    logAuditEvent(newStatus ? 'staff.activated' : 'staff.deactivated', {
      targetUsername: staffUser.username,
      targetId: staffId,
    });
    return { success: true, isActive: newStatus };
  }, [currentUser, users, session, logAuditEvent]);

  // Get staff users (superadmin only)
  const getStaffUsers = useCallback(() => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    return users
      .filter((u) => u.role === 'admin' || u.role === 'superadmin')
      .map(({ passwordHash, ...rest }) => rest); // Never expose password hashes
  }, [currentUser, users]);

  // Get login history for a specific user
  const getLoginHistory = useCallback((userId = null) => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (!user) return [];
      return loginHistory.filter((h) => h.username === user.username);
    }
    return loginHistory;
  }, [currentUser, users, loginHistory]);

  // Get audit logs (optionally filtered by userId)
  const getAuditLogs = useCallback((userId = null) => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    if (userId) {
      return auditLog.filter((l) => l.userId === userId);
    }
    return auditLog;
  }, [currentUser, auditLog]);

  // Derived state
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isStaff = currentUser?.role === 'admin';
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
        isStaff,
        initialized,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        changePassword,
        // Staff management (superadmin)
        addStaffUser,
        changeStaffPassword,
        toggleStaffStatus,
        getStaffUsers,
        getLoginHistory,
        getAuditLogs,
        logAuditEvent,
        // Reference
        users: currentUser?.role === 'superadmin'
          ? users.map(({ passwordHash, ...rest }) => rest)
          : [],
        ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
