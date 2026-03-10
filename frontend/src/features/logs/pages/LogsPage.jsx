/**
 * LogsPage Component (Audit Trail)
 *
 * Displays a human-readable audit trail of all business actions.
 * Replaces the old localStorage-based technical log viewer.
 * Fetches from the /audit-logs backend endpoint.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';
import useAuth from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../shared/constants/appConstants';
import { formatTimeToEuropean } from '../../../shared/utils/dateFormatter';
import { formatDateToEuropean } from '../../../shared/utils/dateFormatter';
import auditLogRepository from '../../../data/repositories/auditLogRepository';

// ─── Constants ────────────────────────────────────────────

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Created' },
  { value: 'UPDATE', label: 'Updated' },
  { value: 'DELETE', label: 'Deleted' },
  { value: 'STATUS_CHANGE', label: 'Status Changed' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'ORDER', label: 'Orders' },
  { value: 'ITEM', label: 'Inventory Items' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'PROVIDER', label: 'Providers' },
  { value: 'EMPLOYEE', label: 'Employees' },
  { value: 'CATEGORY', label: 'Categories' },
  { value: 'PROVIDER_ORDER', label: 'Provider Orders' },
  { value: 'UNIT', label: 'Units' },
];

const ACTION_COLORS = {
  CREATE: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  UPDATE: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  DELETE: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  STATUS_CHANGE: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
};

const ACTION_ICONS = {
  CREATE: 'add_circle',
  UPDATE: 'edit',
  DELETE: 'delete',
  STATUS_CHANGE: 'swap_horiz',
};

const ENTITY_ICONS = {
  ORDER: 'assignment',
  ITEM: 'inventory_2',
  CUSTOMER: 'restaurant',
  PROVIDER: 'domain',
  EMPLOYEE: 'group',
  CATEGORY: 'category',
  PROVIDER_ORDER: 'shopping_cart',
  UNIT: 'straighten',
};

const ACTION_LABELS = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  STATUS_CHANGE: 'Status Changed',
};

const ENTITY_LABELS = {
  ORDER: 'Order',
  ITEM: 'Item',
  CUSTOMER: 'Customer',
  PROVIDER: 'Provider',
  EMPLOYEE: 'Employee',
  CATEGORY: 'Category',
  PROVIDER_ORDER: 'Provider Order',
  UNIT: 'Unit',
};

// ─── Helper Components ────────────────────────────────────

const ActionBadge = ({ action }) => {
  const colors = ACTION_COLORS[action] || ACTION_COLORS.UPDATE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        {ACTION_ICONS[action] || 'info'}
      </span>
      {ACTION_LABELS[action] || action}
    </span>
  );
};

const EntityBadge = ({ entityType }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#192633] text-[#92adc9] border border-[#324d67]">
    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
      {ENTITY_ICONS[entityType] || 'help'}
    </span>
    {ENTITY_LABELS[entityType] || entityType}
  </span>
);

const DetailsSummary = ({ log }) => {
  const { action, details, entityType } = log;
  if (!details) return null;

  // Status change
  if (action === 'STATUS_CHANGE' && details.previousStatus && details.newStatus) {
    return (
      <span className="text-[#92adc9] text-xs">
        <span className="text-[#637d97]">{details.previousStatus}</span>
        <span className="mx-1">→</span>
        <span className="text-white font-medium">{details.newStatus}</span>
        {details.inventoryRestored && <span className="ml-1 text-amber-400">(inventory restored)</span>}
      </span>
    );
  }

  // Create order
  if (action === 'CREATE' && entityType === 'ORDER' && details.customerName) {
    return (
      <span className="text-[#92adc9] text-xs">
        {details.itemCount} item{details.itemCount !== 1 ? 's' : ''} · ₺{details.totalAmount?.toLocaleString() || 0}
      </span>
    );
  }

  // Update with changes
  if (action === 'UPDATE' && details.changes) {
    const changedFields = Object.keys(details.changes);
    if (changedFields.length === 0) return <span className="text-[#637d97] text-xs">No field changes recorded</span>;
    return (
      <span className="text-[#92adc9] text-xs">
        Changed: {changedFields.join(', ')}
      </span>
    );
  }

  // Update with fields updated
  if (action === 'UPDATE' && details.fieldsUpdated) {
    return (
      <span className="text-[#92adc9] text-xs">
        Updated: {details.fieldsUpdated.join(', ')}
      </span>
    );
  }

  // Permissions change
  if (details.action === 'permissions_changed') {
    return (
      <span className="text-[#92adc9] text-xs">
        Permissions updated ({details.newPermissions?.length || 0} permissions set)
      </span>
    );
  }

  return null;
};

// ─── Main Component ───────────────────────────────────────

const LogsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { page, limit };
      if (actionFilter) filters.action = actionFilter;
      if (entityFilter) filters.entityType = entityFilter;
      if (searchTerm) filters.search = searchTerm;
      if (startDate) filters.startDate = new Date(startDate).toISOString();
      if (endDate) filters.endDate = new Date(endDate + 'T23:59:59').toISOString();

      const result = await auditLogRepository.getAuditLogs(filters);
      if (result.success) {
        setLogs(result.data.logs || []);
        setTotal(result.data.total || 0);
        setTotalPages(result.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter, searchTerm, startDate, endDate]);

  const loadStats = useCallback(async () => {
    try {
      const result = await auditLogRepository.getAuditStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load audit stats:', err);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [actionFilter, entityFilter, searchTerm, startDate, endDate]);

  const clearFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = actionFilter || entityFilter || searchTerm || startDate || endDate;

  const selectStyle = "h-10 rounded-lg border border-[#324d67] bg-[#192633] text-white pl-3 pr-8 text-sm focus:outline-none focus:border-[#137fec] appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.LOGS} />
      <div className="flex-1 flex flex-col">
        <TopBar user={user} />
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <PageHeader
              title="Audit Trail"
              subtitle="Track who did what and when across the entire system"
              backButton
              onBack={() => navigate(ROUTES.HOMEPAGE)}
            />

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
                  <p className="text-[#92adc9] text-xs mb-1">Total Events</p>
                  <p className="text-2xl font-bold text-white">{stats.total?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '14px' }}>add_circle</span>
                    <p className="text-emerald-400 text-xs">Created</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.byAction?.CREATE || 0}</p>
                </div>
                <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-blue-400" style={{ fontSize: '14px' }}>edit</span>
                    <p className="text-blue-400 text-xs">Updated</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{(stats.byAction?.UPDATE || 0) + (stats.byAction?.STATUS_CHANGE || 0)}</p>
                </div>
                <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-red-400" style={{ fontSize: '14px' }}>delete</span>
                    <p className="text-red-400 text-xs">Deleted</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.byAction?.DELETE || 0}</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67] mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                {/* Search */}
                <div>
                  <label className="block text-[#92adc9] text-xs font-medium mb-1.5">Search</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#637d97]" style={{ fontSize: '18px' }}>
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#324d67] bg-[#101922] text-white pl-10 pr-3 text-sm placeholder-[#637d97] focus:outline-none focus:border-[#137fec]"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <div>
                  <label className="block text-[#92adc9] text-xs font-medium mb-1.5">Action</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className={selectStyle + " w-full"}
                  >
                    {ACTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Entity Type Filter */}
                <div>
                  <label className="block text-[#92adc9] text-xs font-medium mb-1.5">Type</label>
                  <select
                    value={entityFilter}
                    onChange={(e) => setEntityFilter(e.target.value)}
                    className={selectStyle + " w-full"}
                  >
                    {ENTITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-[#92adc9] text-xs font-medium mb-1.5">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 rounded-lg border border-[#324d67] bg-[#101922] text-white px-3 text-sm focus:outline-none focus:border-[#137fec]"
                  />
                </div>
                <div>
                  <label className="block text-[#92adc9] text-xs font-medium mb-1.5">To</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 h-10 rounded-lg border border-[#324d67] bg-[#101922] text-white px-3 text-sm focus:outline-none focus:border-[#137fec]"
                    />
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="h-10 px-3 rounded-lg border border-[#324d67] text-[#92adc9] hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                        title="Clear all filters"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_alt_off</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Results summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#92adc9] text-sm">
                {total > 0 ? (
                  <>Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of <span className="text-white font-medium">{total.toLocaleString()}</span> events</>
                ) : (
                  'No events found'
                )}
              </p>
              <button
                onClick={() => { loadLogs(); loadStats(); }}
                className="text-[#92adc9] hover:text-white transition-colors flex items-center gap-1 text-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                Refresh
              </button>
            </div>

            {/* Logs List */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin">
                  <svg className="w-10 h-10 text-[#137fec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 bg-[#192633] rounded-lg border border-[#324d67]">
                <span className="material-symbols-outlined text-5xl text-[#324d67] mb-3 block">history</span>
                <p className="text-[#92adc9] text-lg mb-2">No audit events found</p>
                <p className="text-[#637d97] text-sm">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Audit events will appear here as users interact with the system'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[#137fec] hover:text-[#1a8fff] text-sm underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#192633] rounded-lg border border-[#324d67] hover:border-[#324d67]/80 transition-colors"
                  >
                    {/* Main row */}
                    <div
                      className="flex items-center gap-4 px-5 py-3.5 cursor-pointer"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      {/* Action badge */}
                      <div className="flex-shrink-0 w-32">
                        <ActionBadge action={log.action} />
                      </div>

                      {/* Entity type badge */}
                      <div className="flex-shrink-0 w-36">
                        <EntityBadge entityType={log.entityType} />
                      </div>

                      {/* Entity name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{log.entityName}</p>
                        <DetailsSummary log={log} />
                      </div>

                      {/* User */}
                      <div className="flex-shrink-0 text-right w-28">
                        <p className="text-white text-sm font-medium">@{log.username}</p>
                      </div>

                      {/* Timestamp */}
                      <div className="flex-shrink-0 text-right w-36">
                        <p className="text-[#637d97] text-xs">{formatDateToEuropean(log.createdAt)}</p>
                        <p className="text-[#637d97] text-xs">{formatTimeToEuropean(log.createdAt)}</p>
                      </div>

                      {/* Expand icon */}
                      {log.details && (
                        <div className="flex-shrink-0">
                          <span className={`material-symbols-outlined text-[#637d97] transition-transform duration-200 ${expandedLog === log.id ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>
                            expand_more
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expandedLog === log.id && log.details && (
                      <div className="px-5 pb-4 border-t border-[#324d67]/50">
                        <div className="mt-3 bg-[#101922] rounded-lg p-4 border border-[#324d67]/50">
                          <p className="text-[#637d97] text-xs font-semibold uppercase tracking-wider mb-2">Details</p>
                          <pre className="text-[#92adc9] text-xs whitespace-pre-wrap break-words font-mono leading-relaxed">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-9 px-3 rounded-lg border border-[#324d67] text-[#92adc9] hover:text-white hover:border-[#137fec] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-[#137fec] text-white'
                          : 'border border-[#324d67] text-[#92adc9] hover:text-white hover:border-[#137fec]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-9 px-3 rounded-lg border border-[#324d67] text-[#92adc9] hover:text-white hover:border-[#137fec] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
