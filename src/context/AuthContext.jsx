import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

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
    if (!data) return [];
    const logs = JSON.parse(data);
    // Migrate old format entries to new format
    return logs.map(entry => {
      if (entry.actionType) return entry; // Already migrated
      return {
        ...entry,
        actionType: entry.action || 'unknown',
        userRole: entry.userRole || null,
        module: entry.module || deriveModuleFromAction(entry.action),
        recordId: entry.recordId || null,
        oldValue: entry.oldValue || null,
        newValue: entry.newValue || null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        description: entry.description || null,
      };
    });
  } catch {
    return [];
  }
}

// Helper to derive module from legacy action strings
function deriveModuleFromAction(action) {
  if (!action) return 'system';
  if (action.startsWith('user.')) return 'auth';
  if (action.startsWith('staff.')) return 'staff';
  if (action.startsWith('order.')) return 'orders';
  if (action.startsWith('product.')) return 'products';
  if (action.startsWith('coupon.')) return 'coupons';
  if (action.startsWith('finance.')) return 'finance';
  if (action.startsWith('category.')) return 'categories';
  return 'system';
}

function loadLoginHistory() {
  try {
    const data = localStorage.getItem(LOGIN_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ── Client-side IP detection cache ──
let _cachedIP = null;
async function getClientIP() {
  if (_cachedIP) return _cachedIP;
  try {
    const resp = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    const data = await resp.json();
    _cachedIP = data.ip || 'unknown';
    return _cachedIP;
  } catch {
    return 'client-local';
  }
}

// Fire-and-forget IP fetch on module load
getClientIP();

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
    }
    initUsers();
  }, []);

  // ── Initialization (API call to /me) ──
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('gelatte_token');
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success) {
            setCurrentUser(response.data);
            setSession({ token, userId: response.data.id, role: response.data.role });
          } else {
            localStorage.removeItem('gelatte_token');
            setSession(null);
            setCurrentUser(null);
          }
        } catch (err) {
          localStorage.removeItem('gelatte_token');
          setSession(null);
          setCurrentUser(null);
        }
      }
      setInitialized(true);
    }
    initAuth();
  }, []);

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

  // ══════════════════════════════════════════
  // ── Enhanced Audit Logging System ──
  // ══════════════════════════════════════════

  /**
   * Log a detailed audit event with full tracking fields.
   * @param {Object} params
   * @param {string} params.actionType - e.g. 'order.status_changed', 'product.updated'
   * @param {string} params.module - 'orders'|'products'|'coupons'|'staff'|'auth'|'finance'|'categories'
   * @param {string|null} params.recordId - ID of the affected record
   * @param {*} params.oldValue - Previous value (will be JSON-stringified)
   * @param {*} params.newValue - New value (will be JSON-stringified)
   * @param {string|null} params.description - Human-readable description
   * @param {string|null} params.userId - Override user ID (defaults to current user)
   * @param {string|null} params.username - Override username
   * @param {string|null} params.userRole - Override user role
   */
  const logDetailedAuditEvent = useCallback((params) => {
    const {
      actionType,
      module,
      recordId = null,
      oldValue = null,
      newValue = null,
      description = null,
      userId = null,
      username = null,
      userRole = null,
    } = params;

    const resolvedUserId = userId || currentUser?.id || 'system';
    const resolvedUsername = username || (userId ? users.find(u => u.id === userId)?.username : null) || currentUser?.username || 'system';
    const resolvedRole = userRole || currentUser?.role || 'system';

    const event = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: resolvedUserId,
      username: resolvedUsername,
      userRole: resolvedRole,
      actionType,
      module: module || deriveModuleFromAction(actionType),
      recordId,
      oldValue: oldValue != null ? (typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue)) : null,
      newValue: newValue != null ? (typeof newValue === 'string' ? newValue : JSON.stringify(newValue)) : null,
      ipAddress: _cachedIP || 'pending',
      userAgent: navigator.userAgent,
      description,
      timestamp: new Date().toISOString(),
    };

    setAuditLog((prev) => [event, ...prev].slice(0, 5000)); // Keep last 5000 events
  }, [currentUser, users]);

  // Legacy-compatible wrapper (keeps old call sites working)
  const logAuditEvent = useCallback((action, details = {}, userId = null) => {
    logDetailedAuditEvent({
      actionType: action,
      module: deriveModuleFromAction(action),
      description: typeof details === 'string' ? details : null,
      oldValue: null,
      newValue: typeof details === 'object' ? details : null,
      userId,
    });
  }, [logDetailedAuditEvent]);

  // ── Audit Log Filter Helpers ──
  const getAuditLogsByModule = useCallback((module) => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    return auditLog.filter(l => l.module === module);
  }, [currentUser, auditLog]);

  const getAuditLogsByUser = useCallback((userId) => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    return auditLog.filter(l => l.userId === userId);
  }, [currentUser, auditLog]);

  const getAuditLogsByDateRange = useCallback((from, to) => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // Include the full "to" day
    return auditLog.filter(l => {
      const d = new Date(l.timestamp);
      return d >= fromDate && d <= toDate;
    });
  }, [currentUser, auditLog]);

  const getAuditLogsByActionType = useCallback((actionType) => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    return auditLog.filter(l => l.actionType === actionType);
  }, [currentUser, auditLog]);

  const getAuditLogsByRecordId = useCallback((recordId) => {
    if (!currentUser || currentUser.role !== 'superadmin') return [];
    return auditLog.filter(l => l.recordId === recordId);
  }, [currentUser, auditLog]);

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

  // ── Login ──
  const login = useCallback(async (identifier, password) => {
    try {
      const response = await api.login(identifier, password);
      if (response.success) {
        const { token, user } = response.data;
        localStorage.setItem('gelatte_token', token);
        
        const newSession = {
          userId: user.id,
          role: user.role,
          token,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        setSession(newSession);
        setCurrentUser(user);
        
        logLoginAttempt(user.email, true, user.role);
        logDetailedAuditEvent({
          actionType: 'user.login',
          module: 'auth',
          description: `${user.email} (${user.role}) giriş yaptı`,
          newValue: { email: user.email, role: user.role },
          userId: user.id,
          userRole: user.role,
        });

        const isAdminRole = user.role === 'superadmin' || user.role === 'admin';
        return { success: true, user, isAdmin: isAdminRole };
      }
      return { success: false, error: 'auth_invalid_credentials' };
    } catch (err) {
      logLoginAttempt(identifier, false);
      return { success: false, error: err.data?.error || 'auth_error' };
    }
  }, [logLoginAttempt, logDetailedAuditEvent]);

  // ── Admin Login ──
  const adminLogin = useCallback(async (identifier, password) => {
    const result = await login(identifier, password);
    if (!result.success) return result;
    if (result.user.role !== 'superadmin' && result.user.role !== 'admin') {
      localStorage.removeItem('gelatte_token');
      setSession(null);
      setCurrentUser(null);
      return { success: false, error: 'auth_not_admin' };
    }
    return result;
  }, [login]);

  // ── Register ──
  const register = useCallback(async (userData) => {
    try {
      const response = await api.register(userData);
      if (response.success) {
        const { token, user } = response.data;
        localStorage.setItem('gelatte_token', token);
        
        const newSession = {
          userId: user.id,
          role: user.role,
          token,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        setSession(newSession);
        setCurrentUser(user);
        
        return { success: true, user };
      }
      return { success: false, error: 'auth_error' };
    } catch (err) {
      return { success: false, error: err.data?.error || 'auth_error' };
    }
  }, []);

  // ── Logout ──
  const logout = useCallback(() => {
    if (currentUser) {
      logDetailedAuditEvent({
        actionType: 'user.logout',
        module: 'auth',
        description: `${currentUser.email} çıkış yaptı`,
        newValue: { email: currentUser.email },
      });
    }
    localStorage.removeItem('gelatte_token');
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setCurrentUser(null);
  }, [currentUser, logDetailedAuditEvent]);

  // ── Update Profile ──
  const updateProfile = useCallback((updates) => {
    if (!currentUser) return false;
    // Never allow updating passwordHash, role, id through this method
    const { passwordHash, role, id, ...safeUpdates } = updates;
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, ...safeUpdates } : u
    );
    setUsers(updatedUsers);
    logDetailedAuditEvent({
      actionType: 'user.profile_updated',
      module: 'auth',
      recordId: currentUser.id,
      description: `Profil güncellendi: ${Object.keys(safeUpdates).join(', ')}`,
      newValue: { fields: Object.keys(safeUpdates) },
    });
    return true;
  }, [currentUser, users, logDetailedAuditEvent]);

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
    logDetailedAuditEvent({
      actionType: 'user.password_changed',
      module: 'auth',
      recordId: currentUser.id,
      description: `${currentUser.username} şifresini değiştirdi`,
    });
    return { success: true };
  }, [currentUser, users, logDetailedAuditEvent]);

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
    logDetailedAuditEvent({
      actionType: 'staff.created',
      module: 'staff',
      recordId: newUser.id,
      description: `Yeni personel hesabı oluşturuldu: ${newUser.username}`,
      newValue: { username: newUser.username, email: newUser.email, role: 'admin' },
    });
    return { success: true, user: newUser };
  }, [currentUser, users, logDetailedAuditEvent]);

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
    logDetailedAuditEvent({
      actionType: 'staff.password_changed',
      module: 'staff',
      recordId: staffId,
      description: `${staffUser.username} hesabının şifresi değiştirildi`,
      newValue: { targetUsername: staffUser.username },
    });
    return { success: true };
  }, [currentUser, users, logDetailedAuditEvent]);

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

    logDetailedAuditEvent({
      actionType: newStatus ? 'staff.activated' : 'staff.deactivated',
      module: 'staff',
      recordId: staffId,
      description: `${staffUser.username} hesabı ${newStatus ? 'aktif' : 'deaktif'} edildi`,
      oldValue: { isActive: !newStatus },
      newValue: { isActive: newStatus },
    });
    return { success: true, isActive: newStatus };
  }, [currentUser, users, session, logDetailedAuditEvent]);

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
        // Enhanced audit system
        logAuditEvent,
        logDetailedAuditEvent,
        getAuditLogsByModule,
        getAuditLogsByUser,
        getAuditLogsByDateRange,
        getAuditLogsByActionType,
        getAuditLogsByRecordId,
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
