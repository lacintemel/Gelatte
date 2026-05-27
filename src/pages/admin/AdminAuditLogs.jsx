import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ScrollText, Filter, Search, Clock, User, ChevronDown, ChevronLeft, ChevronRight, Shield, AlertTriangle } from 'lucide-react';

/* ── Action badge color map ── */
function getActionBadge(action) {
  if (action === 'user.login')
    return { label: 'Login', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (action === 'user.logout')
    return { label: 'Logout', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  if (action === 'staff.created')
    return { label: 'Staff Created', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  if (action === 'staff.password_changed')
    return { label: 'Password Changed', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  if (action === 'staff.activated')
    return { label: 'Staff Activated', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (action === 'staff.deactivated')
    return { label: 'Staff Deactivated', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  if (action?.startsWith('product.'))
    return { label: action.replace('product.', 'Product '), bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
  if (action?.startsWith('order.'))
    return { label: action.replace('order.', 'Order '), bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
  if (action?.startsWith('user.'))
    return { label: action.replace('user.', 'User '), bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  return { label: action || 'Unknown', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
}

/* ── Parse and render details ── */
function renderDetails(details) {
  if (!details) return <span className="text-warm-gray italic">—</span>;
  try {
    const parsed = typeof details === 'string' ? JSON.parse(details) : details;
    if (typeof parsed === 'object' && parsed !== null) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(parsed).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 text-xs bg-cream-light text-warm-gray-dark px-2 py-0.5 rounded-md"
            >
              <span className="font-medium text-espresso/70">{key}:</span>
              <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-sm text-warm-gray-dark">{String(parsed)}</span>;
  } catch {
    return <span className="text-sm text-warm-gray-dark">{String(details)}</span>;
  }
}

/* ── Format timestamp ── */
function formatTimestamp(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { date, time };
  } catch {
    return { date: '—', time: '' };
  }
}

const ITEMS_PER_PAGE = 20;

export default function AdminAuditLogs() {
  const { isSuperAdmin, getAuditLogs, getStaffUsers } = useAuth();

  // Filters
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const allLogs = useMemo(() => getAuditLogs() || [], [getAuditLogs]);
  const staffUsers = useMemo(() => getStaffUsers() || [], [getStaffUsers]);

  // Unique action types
  const uniqueActions = useMemo(() => {
    const actions = new Set(allLogs.map((l) => l.action));
    return Array.from(actions).sort();
  }, [allLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    let logs = [...allLogs];

    if (filterUser !== 'all') {
      logs = logs.filter((l) => l.username === filterUser);
    }

    if (filterAction !== 'all') {
      logs = logs.filter((l) => l.action === filterAction);
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      logs = logs.filter((l) => new Date(l.timestamp) >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      logs = logs.filter((l) => new Date(l.timestamp) <= to);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.username?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.details?.toLowerCase().includes(q)
      );
    }

    return logs;
  }, [allLogs, filterUser, filterAction, filterDateFrom, filterDateTo, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Access guard
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-espresso mb-2">Access Denied</h2>
        <p className="text-warm-gray max-w-md">
          Only Super Admins can view audit logs. Contact your system administrator if you need access.
        </p>
      </div>
    );
  }

  const hasActiveFilters =
    filterUser !== 'all' || filterAction !== 'all' || filterDateFrom || filterDateTo || searchQuery;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-espresso">Audit Logs</h1>
          </div>
          <p className="text-warm-gray ml-[52px]">
            {filteredLogs.length === allLogs.length
              ? `${allLogs.length} total event${allLogs.length !== 1 ? 's' : ''} recorded`
              : `Showing ${filteredLogs.length} of ${allLogs.length} events`}
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-warm-gray" />
          <span className="text-sm font-medium text-espresso">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilterUser('all');
                setFilterAction('all');
                setFilterDateFrom('');
                setFilterDateTo('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="ml-auto text-xs text-gold hover:text-espresso transition-colors font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-cream-dark/30 bg-champagne text-espresso placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
            />
          </div>

          {/* User Filter */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
            <select
              value={filterUser}
              onChange={(e) => handleFilterChange(setFilterUser)(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-cream-dark/30 bg-champagne text-espresso appearance-none focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all cursor-pointer"
            >
              <option value="all">All Users</option>
              {staffUsers.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.name || u.username}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
          </div>

          {/* Action Filter */}
          <div className="relative">
            <ScrollText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
            <select
              value={filterAction}
              onChange={(e) => handleFilterChange(setFilterAction)(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-cream-dark/30 bg-champagne text-espresso appearance-none focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all cursor-pointer"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
          </div>

          {/* Date From */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => handleFilterChange(setFilterDateFrom)(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-cream-dark/30 bg-champagne text-espresso focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
              placeholder="From"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => handleFilterChange(setFilterDateTo)(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-cream-dark/30 bg-champagne text-espresso focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length > 0 ? (
        <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-dark/25 bg-champagne/60">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-warm-gray uppercase tracking-wider w-[180px]">
                    Timestamp
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-warm-gray uppercase tracking-wider w-[120px]">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-warm-gray uppercase tracking-wider w-[180px]">
                    Action
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-warm-gray uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/15">
                {paginatedLogs.map((log) => {
                  const { date, time } = formatTimestamp(log.timestamp);
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-champagne/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-espresso">{date}</div>
                        <div className="text-xs text-warm-gray">{time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-cream flex items-center justify-center border border-cream-dark/20">
                            <User className="w-3 h-3 text-warm-gray" />
                          </span>
                          <span className="text-sm font-medium text-espresso">{log.username}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">{renderDetails(log.details)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-cream-dark/15">
            {paginatedLogs.map((log) => {
              const { date, time } = formatTimestamp(log.timestamp);
              const badge = getActionBadge(log.action);
              return (
                <div key={log.id} className="p-4 space-y-3 hover:bg-champagne/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-cream flex items-center justify-center border border-cream-dark/20">
                        <User className="w-3 h-3 text-warm-gray" />
                      </span>
                      <span className="text-sm font-medium text-espresso">{log.username}</span>
                    </span>
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div>{renderDetails(log.details)}</div>
                  <div className="flex items-center gap-1.5 text-xs text-warm-gray">
                    <Clock className="w-3 h-3" />
                    <span>{date} · {time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-cream-dark/25 bg-champagne/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-warm-gray">
                Page {currentPage} of {totalPages} · {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-cream-dark/30 bg-ivory text-espresso hover:bg-champagne disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-warm-gray text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                          currentPage === item
                            ? 'bg-espresso text-cream shadow-sm'
                            : 'border border-cream-dark/30 bg-ivory text-espresso hover:bg-champagne'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-cream-dark/30 bg-ivory text-espresso hover:bg-champagne disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-12 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center">
              {hasActiveFilters ? (
                <AlertTriangle className="w-9 h-9 text-warm-gray" />
              ) : (
                <ScrollText className="w-9 h-9 text-warm-gray" />
              )}
            </div>
          </div>
          <h3 className="font-display text-xl font-bold text-espresso mb-2">
            {hasActiveFilters ? 'No matching logs' : 'No audit logs yet'}
          </h3>
          <p className="text-warm-gray max-w-md mx-auto mb-5">
            {hasActiveFilters
              ? 'Try adjusting your filters or clearing them to see all audit events.'
              : 'Audit events will appear here as users interact with the admin panel.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilterUser('all');
                setFilterAction('all');
                setFilterDateFrom('');
                setFilterDateTo('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-espresso text-cream font-medium text-sm hover:bg-walnut transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
