/**
 * LogsPage Component
 *
 * Page for viewing application logs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const LogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, filterLevel, searchTerm]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Get logs from localStorage
      const storedLogs = localStorage.getItem('app_logs') || '[]';
      const parsedLogs = JSON.parse(storedLogs);
      setLogs(parsedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      logger.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by level
    if (filterLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    const confirmed = window.confirm('Are you sure you want to clear all logs? This action cannot be undone.');
    if (confirmed) {
      localStorage.removeItem('app_logs');
      setLogs([]);
      setFilteredLogs([]);
      logger.info('All logs cleared');
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-400 bg-red-500/10';
      case 'WARN':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'INFO':
        return 'text-blue-400 bg-blue-500/10';
      case 'DEBUG':
        return 'text-green-400 bg-green-500/10';
      default:
        return 'text-[#92adc9] bg-[#192633]';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.LOGS} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Application Logs"
            subtitle="View and manage application activity logs"
            backButton
            onBack={() => navigate(ROUTES.HOMEPAGE)}
          />

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Filter by Level */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Log Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 py-3
                  focus:outline-none focus:border-[#137fec]"
              >
                <option value="ALL">All Levels</option>
                <option value="ERROR">Error</option>
                <option value="WARN">Warning</option>
                <option value="INFO">Info</option>
                <option value="DEBUG">Debug</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 py-3
                  placeholder-[#92adc9] focus:outline-none focus:border-[#137fec]"
              />
            </div>

            {/* Actions */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Actions
              </label>
              <div className="flex gap-2">
                <Button
                  onClick={exportLogs}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  Export
                </Button>
                <Button
                  onClick={clearLogs}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Logs Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
              <p className="text-[#92adc9] text-sm mb-1">Total Logs</p>
              <p className="text-2xl font-bold text-white">{logs.length}</p>
            </div>
            <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
              <p className="text-red-400 text-sm mb-1">Errors</p>
              <p className="text-2xl font-bold text-white">{logs.filter(l => l.level === 'ERROR').length}</p>
            </div>
            <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
              <p className="text-yellow-400 text-sm mb-1">Warnings</p>
              <p className="text-2xl font-bold text-white">{logs.filter(l => l.level === 'WARN').length}</p>
            </div>
            <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
              <p className="text-blue-400 text-sm mb-1">Info</p>
              <p className="text-2xl font-bold text-white">{logs.filter(l => l.level === 'INFO').length}</p>
            </div>
          </div>

          {/* Logs List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <svg className="w-12 h-12 text-[#137fec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="ml-4 text-white">Loading logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#92adc9] text-lg mb-4">No logs found</p>
              <Button onClick={loadLogs} variant="primary">
                Reload Logs
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="bg-[#192633] rounded-lg p-5 border border-[#324d67] hover:border-[#137fec] transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <p className="text-white font-semibold flex-1 break-words">
                        {log.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {log.data && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="text-[#137fec] hover:text-[#1a8fff] transition-colors flex-shrink-0"
                          title={expandedLogs.has(index) ? 'Collapse details' : 'Expand details'}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {expandedLogs.has(index) ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      )}
                      <p className="text-[#92adc9] text-xs whitespace-nowrap flex-shrink-0">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </div>
                  {log.data && expandedLogs.has(index) && (
                    <div className="mt-4 p-4 bg-[#101922] rounded border border-[#324d67] text-xs overflow-hidden">
                      <p className="text-[#92adc9] mb-3 font-semibold">Details:</p>
                      <pre className="text-[#92adc9] overflow-x-auto max-h-64 whitespace-pre-wrap word-wrap">
                        {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
