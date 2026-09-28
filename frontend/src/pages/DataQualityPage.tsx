import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Database, 
  FileSpreadsheet, 
  Sparkles 
} from 'lucide-react';

interface Props {
  wellId: string;
}

export const DataQualityPage: React.FC<Props> = ({ wellId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getDataQuality(wellId).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Data quality load error:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId]);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Auditing Telemetry Records and Sensor Anomaly Registers...</span>
      </div>
    );
  }

  const { quality_score, total_records_analyzed, missing_values_count, outliers_detected_count, sensor_gaps_count, sensor_health_breakdown, recommendations } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Data Quality & Telemetry Sanity Monitor
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              Sensor Validation Guardrails
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects sensor spikes, stuck channels, telemetry gaps, and out-of-range physical values before AI ingestion
          </p>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Records Audited: </span>
          <span className="text-slate-200 font-bold">{total_records_analyzed} rows</span>
        </div>
      </div>

      {/* Top Score & Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Composite Quality Score */}
        <div className="industrial-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-xs font-mono text-slate-400 block">DATA QUALITY SCORE</span>
            <span className="text-3xl font-mono font-extrabold text-emerald-400">
              {quality_score}
            </span>
            <span className="text-xs font-mono text-slate-400"> / 100</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Missing Values */}
        <div className="industrial-panel p-4">
          <span className="text-xs font-mono text-slate-400 block">MISSING / NULL ENTRIES</span>
          <span className="text-2xl font-mono font-bold text-slate-100">{missing_values_count}</span>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Forward-fill imputation active</p>
        </div>

        {/* Outliers Detected */}
        <div className="industrial-panel p-4">
          <span className="text-xs font-mono text-slate-400 block">OUTLIERS DETECTED</span>
          <span className={`text-2xl font-mono font-bold ${outliers_detected_count > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
            {outliers_detected_count}
          </span>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Threshold envelope filtered</p>
        </div>

        {/* Telemetry Latency Gaps */}
        <div className="industrial-panel p-4">
          <span className="text-xs font-mono text-slate-400 block">SENSOR LATENCY GAPS</span>
          <span className="text-2xl font-mono font-bold text-slate-100">{sensor_gaps_count}</span>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">&gt; 2 hour transmission step</p>
        </div>
      </div>

      {/* Sensor Health Channel Breakdown Table */}
      <div className="industrial-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
          Instrument Channel Health Audit
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Telemetry Channel</th>
                <th className="py-2.5 px-3">Instrument Status</th>
                <th className="py-2.5 px-3">Missing</th>
                <th className="py-2.5 px-3">Outliers</th>
                <th className="py-2.5 px-3">Mean Telemetry</th>
                <th className="py-2.5 px-3">Signal Noise (Std)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {Object.entries(sensor_health_breakdown).map(([col, s]: any) => (
                <tr key={col} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{s.display_name}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      s.status === 'HEALTHY' ? 'bg-emerald-950 text-emerald-300' :
                      s.status === 'STUCK_SENSOR' ? 'bg-red-950 text-red-300' :
                      'bg-amber-950 text-amber-300'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{s.missing}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{s.outliers}</td>
                  <td className="py-3 px-3 font-mono text-amber-400 font-bold">{s.mean_val}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{s.noise_std}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="industrial-panel p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Automated Data Cleaning Recommendations</span>
        </h4>
        <div className="space-y-2">
          {recommendations.map((rec: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
