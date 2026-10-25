import React, { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownUp,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import type { FaultEvent, Severity } from '../types';

interface EventLogProps {
  events: FaultEvent[];
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
  onClearResolved: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({
  events,
  onAcknowledge,
  onAcknowledgeAll,
  onClearResolved,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Search
        const matchesSearch =
          ev.faultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.affectedPhase.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.recommendedAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.measuredValue.toLowerCase().includes(searchTerm.toLowerCase());

        // Severity filter
        const matchesSeverity =
          selectedSeverity === 'ALL' || ev.severity === selectedSeverity;

        // Phase filter
        const matchesPhase =
          selectedPhase === 'ALL' ||
          (selectedPhase === 'Phase R' && ev.affectedPhase.includes('Phase R')) ||
          (selectedPhase === 'Phase Y' && ev.affectedPhase.includes('Phase Y')) ||
          (selectedPhase === 'Phase B' && ev.affectedPhase.includes('Phase B')) ||
          (selectedPhase === 'Motor' &&
            (ev.affectedPhase.includes('Motor') || ev.affectedPhase.includes('Stator') || ev.affectedPhase.includes('Bearing'))) ||
          (selectedPhase === 'Supply' &&
            (ev.affectedPhase.includes('Supply') || ev.affectedPhase.includes('All')));

        // Status filter
        const matchesStatus =
          selectedStatus === 'ALL' || ev.status === selectedStatus;

        return matchesSearch && matchesSeverity && matchesPhase && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [events, searchTerm, selectedSeverity, selectedPhase, selectedStatus, sortOrder]);

  // Export events to CSV
  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = [
      'ID',
      'Timestamp',
      'Fault Name',
      'Affected Phase',
      'Severity',
      'Measured Value',
      'Threshold / Reason',
      'Recommended Action',
      'Status',
      'Acknowledged',
      'Resolved At',
    ];
    const rows = events.map((e) => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.faultName}"`,
      `"${e.affectedPhase}"`,
      `"${e.severity}"`,
      `"${e.measuredValue}"`,
      `"${e.thresholdReason.replace(/"/g, '""')}"`,
      `"${e.recommendedAction.replace(/"/g, '""')}"`,
      `"${e.status}"`,
      `"${e.acknowledged ? 'YES' : 'NO'}"`,
      `"${e.resolvedAt || 'N/A'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `motor_fault_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/50">
            <AlertOctagon className="w-3 h-3 text-red-400" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            HIGH
          </span>
        );
      case 'WARNING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
    }
  };

  return (
    <section className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-5 shadow-xl transition-all">
      {/* Header and Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Fault & Event History Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic event ledger with severity scoring, measured telemetry values, and operator action protocols
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAcknowledgeAll}
            disabled={events.every((e) => e.acknowledged)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Acknowledge all pending alerts"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Acknowledge All
          </button>

          <button
            onClick={onClearResolved}
            disabled={!events.some((e) => e.status === 'RESOLVED')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Clear resolved events from history"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Clear Resolved
          </button>

          <button
            onClick={handleExportCSV}
            disabled={events.length === 0}
            className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 disabled:opacity-40 text-xs font-semibold text-cyan-300 border border-cyan-800 flex items-center gap-1.5 transition-all"
            title="Download CSV report of all events"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fault name, phase, value..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="WARNING">Warning Only</option>
          </select>
        </div>

        {/* Phase Filter */}
        <div>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Components</option>
            <option value="Phase R">Phase R</option>
            <option value="Phase Y">Phase Y</option>
            <option value="Phase B">Phase B</option>
            <option value="Motor">Motor / Frame</option>
            <option value="Supply">Three-Phase Supply</option>
          </select>
        </div>

        {/* Status Filter & Sort Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={`Sort order: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Fault / Event</th>
              <th className="py-3 px-4">Phase / Component</th>
              <th className="py-3 px-4">Measured Value</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Recommended Action</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((ev) => {
                const isResolved = ev.status === 'RESOLVED';
                return (
                  <tr
                    key={ev.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      !isResolved && ev.severity === 'CRITICAL'
                        ? 'bg-red-950/20'
                        : !isResolved && ev.severity === 'HIGH'
                        ? 'bg-orange-950/15'
                        : isResolved
                        ? 'opacity-70'
                        : ''
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {isResolved && ev.resolvedAt && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          Res: {new Date(ev.resolvedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </td>

                    {/* Fault Name */}
                    <td className="py-3 px-4 font-sans font-bold text-white whitespace-nowrap">
                      {ev.faultName}
                      <div className="text-[10px] text-slate-400 font-mono font-normal">
                        {ev.thresholdReason}
                      </div>
                    </td>

                    {/* Affected Phase */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          ev.affectedPhase.includes('Phase R')
                            ? 'bg-red-950/60 text-red-300 border border-red-800'
                            : ev.affectedPhase.includes('Phase Y')
                            ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-800'
                            : ev.affectedPhase.includes('Phase B')
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {ev.affectedPhase}
                      </span>
                    </td>

                    {/* Measured Value */}
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {ev.measuredValue}
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      {getSeverityBadge(ev.severity)}
                    </td>

                    {/* Recommended Action */}
                    <td className="py-3 px-4 text-slate-300 max-w-xs font-sans text-xs">
                      <div className="line-clamp-2" title={ev.recommendedAction}>
                        {ev.recommendedAction}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RESOLVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/70 text-red-300 border border-red-700 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                          ACTIVE
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {!ev.acknowledged && !isResolved ? (
                        <button
                          onClick={() => onAcknowledge(ev.id)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700 transition-colors"
                          title="Acknowledge fault"
                        >
                          Ack
                        </button>
                      ) : ev.acknowledged ? (
                        <span className="text-[10px] text-slate-400 font-sans">Acked</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-sans">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No Events Found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {events.length === 0
                        ? 'System is operating within normal parameters. No faults detected.'
                        : 'No events match the current filter or search criteria.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>
          Showing {filteredEvents.length} of {events.length} logged events
        </span>
        <span className="italic">
          * Fault notifications are software simulated based on configured demonstration thresholds.
        </span>
      </div>
    </section>
  );
};
