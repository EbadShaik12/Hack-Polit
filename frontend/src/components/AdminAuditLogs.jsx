import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  ShieldAlert,
  RefreshCw,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Tag,
} from 'lucide-react';
import api from '../services/api';

const ACTION_TYPE_STYLES = {
  registration: { bg: 'bg-blue-50 text-blue-600 border-blue-200', label: 'Registration' },
  submission: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Submission' },
  review: { bg: 'bg-purple-50 text-purple-600 border-purple-200', label: 'Review' },
  publish: { bg: 'bg-amber-50 text-amber-600 border-amber-200', label: 'Publish' },
  role_change: { bg: 'bg-rose-50 text-rose-600 border-rose-200', label: 'Role Change' },
  auth: { bg: 'bg-indigo-50 text-indigo-600 border-indigo-200', label: 'Authentication' },
  sponsor: { bg: 'bg-teal-50 text-teal-600 border-teal-200', label: 'Sponsor' },
  feedback: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Feedback' },
  system: { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'System' },
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
      });

      if (search) params.append('search', search);
      if (userQuery) params.append('user', userQuery);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/activities/audit-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotalLogs(res.data.totalLogs || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, selectedType, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setUserQuery('');
    setSelectedType('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="h-6 w-6 text-blue-600" /> Admin Platform Audit Log
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wide">
              {totalLogs} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of user actions, hackathon creations, project submissions, role changes, and result publications.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-blue-600" /> Refresh Audit Trail
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search in log message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* User Search */}
          <div className="lg:col-span-3 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Filter by user name / email..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Type Select */}
          <div className="lg:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Action Types</option>
              <option value="registration">Registrations & Teams</option>
              <option value="submission">Project Submissions</option>
              <option value="review">Reviews & Grading</option>
              <option value="publish">Result Publications</option>
              <option value="role_change">Role Changes</option>
              <option value="auth">Authentication & Signups</option>
              <option value="sponsor">Sponsor Activity</option>
              <option value="feedback">Participant Feedback</option>
              <option value="system">System Events</option>
            </select>
          </div>

          {/* Search Trigger */}
          <div className="lg:col-span-2 flex gap-2">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Date Range Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-blue-600" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {(search || userQuery || selectedType !== 'all' || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer self-end sm:self-auto"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Log Table */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-xs text-slate-900">
          <FileText className="h-12 w-12 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No matching audit logs found.</p>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or date filters.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs text-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Event Message</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const style = ACTION_TYPE_STYLES[log.type] || ACTION_TYPE_STYLES.system;
                  const uName = log.user?.name || log.userName || 'System';
                  const uEmail = log.user?.email || log.userEmail || '';
                  const uRole = log.user?.role || '';

                  return (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 shrink-0">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${style.bg}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 min-w-[160px]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                            {uName}
                            {uRole && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 uppercase">
                                {uRole}
                              </span>
                            )}
                          </p>
                          {uEmail && <p className="text-[10px] text-slate-500">{uEmail}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[280px]">
                        <p className="text-slate-700 font-medium leading-relaxed">{log.message}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium shrink-0 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-slate-50 p-4 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalLogs} total events)
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
