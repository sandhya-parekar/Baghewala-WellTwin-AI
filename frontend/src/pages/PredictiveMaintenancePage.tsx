import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Wrench, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Clock, 
  CheckCircle2,
  Calendar,
  AlertOctagon
} from 'lucide-react';

interface Props {
  wellId: string;
}

export const PredictiveMaintenancePage: React.FC<Props> = ({ wellId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getMaintenance(wellId).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Maintenance fetch error:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId]);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Predictive Maintenance Diagnostics...</span>
      </div>
    );
  }

  const { active_diagnostics, maintenance_history, disclaimer } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Predictive Maintenance & Rod Floating Diagnostics
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
              Mechanical Health Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Early detection of compressive buckling, rod floating, and pump shock signatures for {data.well_name}
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          API Grade D Rod String Integrity
        </span>
      </div>

      {/* Active Diagnostics Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <span>Active Diagnostic Patterns & Anomaly Signatures</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active_diagnostics.map((diag: any, idx: number) => {
            const isCrit = diag.risk_level === 'CRITICAL';
            const isWarn = diag.risk_level === 'WARNING';
            return (
              <div
                key={idx}
                className={`industrial-panel p-5 space-y-3 border transition-all ${
                  isCrit ? 'border-red-500/50 bg-red-950/20' :
                  isWarn ? 'border-amber-500/50 bg-amber-950/20' :
                  'border-emerald-500/40 bg-emerald-950/10'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCrit ? 'bg-red-500/20 text-red-300' :
                    isWarn ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {diag.risk_level} RISK
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Urgency: {diag.action_urgency || 'ROUTINE'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">
                  {diag.pattern_name}
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Affected Component: </span>
                    <span className="font-semibold text-slate-200">{diag.affected_component}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Diagnostic Reason: </span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{diag.diagnostic_reason}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Recommended Field Inspection:
                  </span>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {diag.recommended_inspection}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Maintenance Events Log */}
      <div className="industrial-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Logged Equipment Events History</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Past Interventions & Observations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Pattern Detected</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Component</th>
                <th className="py-2.5 px-4">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {maintenance_history.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400">{m.timestamp}</td>
                  <td className="py-3 px-3 font-semibold text-white">{m.pattern_name}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      m.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-300' :
                      m.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-300' :
                      m.risk_level === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {m.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{m.affected_component}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] leading-relaxed">
                    {m.recommended_inspection}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 font-mono text-center">
        🛡️ {disclaimer}
      </div>
    </div>
  );
};
