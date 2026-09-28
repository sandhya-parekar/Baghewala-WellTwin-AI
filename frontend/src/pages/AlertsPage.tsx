import React, { useState, useEffect } from 'react';
import { AlertItem } from '../types';
import { api } from '../services/api';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  PlusCircle, 
  Clock, 
  Activity, 
  Check, 
  ShieldAlert, 
  ShieldCheck 
} from 'lucide-react';

interface Props {
  wellId: string;
}

export const AlertsPage: React.FC<Props> = ({ wellId }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts({
        well_id: wellId === 'ALL' ? undefined : wellId,
        category: categoryFilter,
        status: statusFilter,
        search: searchQuery || undefined
      });
      setAlerts(res);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [wellId, categoryFilter, statusFilter]);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id, 'Field Engineer (Logged in)');
      fetchAlerts();
    } catch (err) {
      console.error('Acknowledge error:', err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.resolveAlert(id, 'Field Engineer (Logged in)');
      fetchAlerts();
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const handleGenerateAlert = async (cat: string) => {
    setIsGenerating(true);
    try {
      await api.generateAlert(wellId, cat);
      await fetchAlerts();
    } catch (err) {
      console.error('Failed to generate alert:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Smart Alert Engine & Alarm Triage
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono font-bold">
              {alerts.filter(a => a.status === 'ACTIVE').length} Active Alarms
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold surveillance: Rod floating, thermal cut-off, and pump fillage anomalies
          </p>
        </div>

        {/* Generate Alert Demo Action */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Simulate Alarm:</span>
          <button
            onClick={() => handleGenerateAlert('WARNING')}
            disabled={isGenerating}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold transition-all"
          >
            + Warn Alert
          </button>
          <button
            onClick={() => handleGenerateAlert('CRITICAL')}
            disabled={isGenerating}
            className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-xs font-semibold transition-all"
          >
            + Critical Alert
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-64 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search parameter, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAlerts()}
            className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <Activity className="w-6 h-6 animate-spin text-amber-500 mr-2" />
          <span>Polling alarm registers...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="industrial-panel p-10 text-center text-slate-400 space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-base font-bold text-white">No Active Alarms Found</h4>
          <p className="text-xs max-w-sm mx-auto">
            All telemetry channels are within normal operational safety envelopes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((al) => {
            const isCrit = al.category === 'CRITICAL';
            const isWarn = al.category === 'WARNING';
            const isResolved = al.status === 'RESOLVED';

            return (
              <div
                key={al.id}
                className={`industrial-panel p-4 border transition-all ${
                  isResolved
                    ? 'border-slate-800 opacity-60 bg-slate-950/40'
                    : isCrit
                    ? 'border-red-500/50 bg-red-950/20 shadow-md shadow-red-500/5'
                    : isWarn
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : 'border-blue-500/40 bg-blue-950/10'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isCrit ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                      isWarn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {al.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {al.well_id}: {al.parameter}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Current: <strong className="text-amber-300">{al.current_value}</strong> (Threshold: {al.threshold})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {al.timestamp}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      al.status === 'ACTIVE' ? 'bg-red-950 text-red-400 border border-red-800' :
                      al.status === 'ACKNOWLEDGED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-emerald-400'
                    }`}>
                      {al.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 items-center">
                  <div className="md:col-span-8 space-y-1 text-xs">
                    <p className="text-slate-200 leading-relaxed">
                      <strong className="text-slate-400">Reason: </strong>
                      {al.reason}
                    </p>
                    <p className="text-amber-300 leading-relaxed">
                      <strong className="text-slate-400">Suggested Action: </strong>
                      {al.suggested_action}
                    </p>
                    {al.acknowledged_by && (
                      <p className="text-[10px] text-slate-400 font-mono pt-1">
                        Acknowledged by: {al.acknowledged_by}
                      </p>
                    )}
                  </div>

                  {/* Triage Action Buttons */}
                  <div className="md:col-span-4 flex items-center justify-end gap-2">
                    {al.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAcknowledge(al.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
                      >
                        Acknowledge
                      </button>
                    )}

                    {al.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolve(al.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
