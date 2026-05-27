import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Shield, Key, Power, Clock, FileText, Plus, X,
  Eye, EyeOff, UserPlus, Lock, Unlock, AlertTriangle,
} from 'lucide-react';

/* ─── Reusable Modal Shell ─── */
function Modal({ open, onClose, title, icon: Icon, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-ivory rounded-2xl shadow-xl border border-cream-dark/25 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[85vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark/25 shrink-0">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-gold" />}
            <h3 className="font-display text-lg font-bold text-espresso">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-champagne transition-colors text-warm-gray hover:text-espresso">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Feedback Banner ─── */
function FeedbackBanner({ message, type, onDismiss }) {
  if (!message) return null;
  const colors = type === 'error'
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-green-50 text-green-700 border-green-200';
  return (
    <div className={`mb-6 px-4 py-3 rounded-xl border flex items-center justify-between ${colors}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-4 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Role Badge ─── */
function RoleBadge({ role }) {
  const isSuperAdmin = role === 'superadmin';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      isSuperAdmin
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-blue-50 text-blue-700 border-blue-200'
    }`}>
      <Shield className="w-3 h-3" />
      {isSuperAdmin ? 'Super Admin' : 'Staff'}
    </span>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-600 border-red-200'
    }`}>
      {isActive ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ══════════════════════════════════════════════════ */
/* ─── Main Component ─── */
/* ══════════════════════════════════════════════════ */
export default function AdminStaffManagement() {
  const {
    isSuperAdmin,
    getStaffUsers,
    changeStaffPassword,
    toggleStaffStatus,
    addStaffUser,
    getLoginHistory,
    getAuditLogs,
  } = useAuth();

  // ── State ──
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Create Staff Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', name: '', email: '', password: '', phone: '' });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Change Password Modal
  const [passwordModal, setPasswordModal] = useState({ open: false, staffId: null, staffName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Login History Modal
  const [historyModal, setHistoryModal] = useState({ open: false, staffId: null, staffName: '' });

  // Audit Logs Modal
  const [auditModal, setAuditModal] = useState({ open: false, staffId: null, staffName: '' });

  // ── Derived data ──
  const staffUsers = useMemo(() => getStaffUsers(), [getStaffUsers]);

  const loginHistoryData = useMemo(() => {
    if (!historyModal.staffId) return [];
    return getLoginHistory(historyModal.staffId);
  }, [historyModal.staffId, getLoginHistory]);

  const auditLogData = useMemo(() => {
    if (!auditModal.staffId) return [];
    return getAuditLogs(auditModal.staffId);
  }, [auditModal.staffId, getAuditLogs]);

  // ── Helpers ──
  const showFeedback = useCallback((message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  }, []);

  const clearFeedback = useCallback(() => setFeedback({ message: '', type: '' }), []);

  // ── Guard: Super Admin only ──
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-espresso">Access Denied</h2>
        <p className="text-warm-gray text-center max-w-md">
          This page is restricted to Super Administrators only. Contact your system administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  // ── Handlers ──

  // Create Staff
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await addStaffUser(createForm);
      if (result.success) {
        showFeedback(`Staff account "${createForm.username}" created successfully.`);
        setShowCreateModal(false);
        setCreateForm({ username: '', name: '', email: '', password: '', phone: '' });
        setShowCreatePassword(false);
      } else {
        const errorMap = {
          auth_email_exists: 'A user with that username or email already exists.',
          auth_weak_password: 'Password must be at least 6 characters.',
        };
        showFeedback(errorMap[result.error] || result.error || 'Failed to create staff account.', 'error');
      }
    } catch {
      showFeedback('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showFeedback('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await changeStaffPassword(passwordModal.staffId, newPassword);
      if (result.success) {
        showFeedback(`Password changed successfully for "${passwordModal.staffName}".`);
        setPasswordModal({ open: false, staffId: null, staffName: '' });
        setNewPassword('');
        setConfirmPassword('');
        setShowNewPassword(false);
      } else {
        const errorMap = {
          auth_weak_password: 'Password must be at least 6 characters.',
        };
        showFeedback(errorMap[result.error] || result.error || 'Failed to change password.', 'error');
      }
    } catch {
      showFeedback('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = (staff) => {
    const action = staff.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} the account "${staff.username}"?`)) return;

    const result = toggleStaffStatus(staff.id);
    if (result.success) {
      showFeedback(`Account "${staff.username}" has been ${result.isActive ? 'activated' : 'deactivated'}.`);
    } else {
      showFeedback(result.error || 'Failed to toggle status.', 'error');
    }
  };

  // Format timestamp
  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const truncateUA = (ua) => {
    if (!ua) return '—';
    if (ua.length > 80) return ua.slice(0, 80) + '…';
    return ua;
  };

  // ── Render ──
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-espresso">Staff Management</h1>
            <p className="text-sm text-warm-gray mt-0.5">Manage admin & staff accounts</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-espresso text-cream px-5 py-2.5 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-walnut-light transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Create Staff Account
        </button>
      </div>

      {/* Feedback */}
      <FeedbackBanner message={feedback.message} type={feedback.type} onDismiss={clearFeedback} />

      {/* Staff Table */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden">
        <div className="px-6 py-5 border-b border-cream-dark/25 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-espresso">
            Staff Users ({staffUsers.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-champagne/50 text-warm-gray text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark/25">
              {staffUsers.map((staff) => (
                <tr key={staff.id} className="hover:bg-champagne/30 transition-colors">
                  {/* User */}
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-espresso">{staff.name}</p>
                      <p className="text-xs text-warm-gray">@{staff.username}</p>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="p-4 text-sm text-warm-gray-dark">{staff.email}</td>
                  {/* Role */}
                  <td className="p-4"><RoleBadge role={staff.role} /></td>
                  {/* Status */}
                  <td className="p-4"><StatusBadge isActive={staff.isActive} /></td>
                  {/* Created */}
                  <td className="p-4 text-sm text-warm-gray">{formatDate(staff.createdAt)}</td>
                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Change Password */}
                      <button
                        onClick={() => {
                          setPasswordModal({ open: true, staffId: staff.id, staffName: staff.username });
                          setNewPassword('');
                          setConfirmPassword('');
                          setShowNewPassword(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-champagne text-warm-gray-dark text-xs font-medium hover:bg-cream-dark/30 hover:text-espresso transition-colors"
                        title="Change Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Password</span>
                      </button>

                      {/* Toggle Status — don't show for superadmin accounts */}
                      {staff.role !== 'superadmin' && (
                        <button
                          onClick={() => handleToggleStatus(staff)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            staff.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={staff.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">{staff.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      )}

                      {/* Login History */}
                      <button
                        onClick={() => setHistoryModal({ open: true, staffId: staff.id, staffName: staff.username })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-champagne text-warm-gray-dark text-xs font-medium hover:bg-cream-dark/30 hover:text-espresso transition-colors"
                        title="Login History"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Logins</span>
                      </button>

                      {/* Audit Logs */}
                      <button
                        onClick={() => setAuditModal({ open: true, staffId: staff.id, staffName: staff.username })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-champagne text-warm-gray-dark text-xs font-medium hover:bg-cream-dark/30 hover:text-espresso transition-colors"
                        title="Audit Logs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Audit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staffUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-warm-gray">
                    No staff users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* ─── Create Staff Modal ─── */}
      {/* ═══════════════════════════════════════ */}
      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setShowCreatePassword(false); }}
        title="Create Staff Account"
        icon={UserPlus}
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-1.5">Username *</label>
            <input
              type="text"
              required
              value={createForm.username}
              onChange={(e) => setCreateForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 text-espresso"
              placeholder="e.g. johndoe"
            />
          </div>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 text-espresso"
              placeholder="e.g. John Doe"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 text-espresso"
              placeholder="e.g. john@gelatte.com"
            />
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showCreatePassword ? 'text' : 'password'}
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2.5 pr-12 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 text-espresso"
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowCreatePassword(!showCreatePassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-espresso transition-colors"
              >
                {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-1.5">Phone</label>
            <input
              type="tel"
              value={createForm.phone}
              onChange={(e) => setCreateForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 text-espresso"
              placeholder="Optional"
            />
          </div>
          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-cream py-3 rounded-xl font-medium tracking-wide hover:bg-walnut-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════ */}
      {/* ─── Change Password Modal ─── */}
      {/* ═══════════════════════════════════════ */}
      <Modal
        open={passwordModal.open}
        onClose={() => { setPasswordModal({ open: false, staffId: null, staffName: '' }); setNewPassword(''); setConfirmPassword(''); setShowNewPassword(false); }}
        title={`Change Password — @${passwordModal.staffName}`}
        icon={Key}
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 text-espresso"
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-espresso transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-1.5">Confirm Password</label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 text-espresso"
              placeholder="Re-enter new password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Passwords do not match
              </p>
            )}
          </div>
          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (confirmPassword && newPassword !== confirmPassword)}
              className="w-full bg-espresso text-cream py-3 rounded-xl font-medium tracking-wide hover:bg-walnut-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <Key className="w-5 h-5" />
              )}
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════ */}
      {/* ─── Login History Modal ─── */}
      {/* ═══════════════════════════════════════ */}
      <Modal
        open={historyModal.open}
        onClose={() => setHistoryModal({ open: false, staffId: null, staffName: '' })}
        title={`Login History — @${historyModal.staffName}`}
        icon={Clock}
        wide
      >
        {loginHistoryData.length === 0 ? (
          <div className="text-center py-8 text-warm-gray">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No login history found for this user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-warm-gray text-xs uppercase tracking-wider border-b border-cream-dark/25">
                  <th className="pb-3 pr-4 font-medium">Timestamp</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/15">
                {loginHistoryData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-champagne/30 transition-colors">
                    <td className="py-3 pr-4 text-espresso whitespace-nowrap">{formatDateTime(entry.timestamp)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.success
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {entry.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3 text-warm-gray text-xs break-all">{truncateUA(entry.userAgent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════ */}
      {/* ─── Audit Logs Modal ─── */}
      {/* ═══════════════════════════════════════ */}
      <Modal
        open={auditModal.open}
        onClose={() => setAuditModal({ open: false, staffId: null, staffName: '' })}
        title={`Audit Logs — @${auditModal.staffName}`}
        icon={FileText}
        wide
      >
        {auditLogData.length === 0 ? (
          <div className="text-center py-8 text-warm-gray">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No audit events found for this user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-warm-gray text-xs uppercase tracking-wider border-b border-cream-dark/25">
                  <th className="pb-3 pr-4 font-medium">Timestamp</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                  <th className="pb-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/15">
                {auditLogData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-champagne/30 transition-colors">
                    <td className="py-3 pr-4 text-espresso whitespace-nowrap">{formatDateTime(entry.timestamp)}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3 text-warm-gray text-xs break-all max-w-xs">{entry.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
