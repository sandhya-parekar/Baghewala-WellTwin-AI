import React, { useState, useEffect } from 'react';
import { CssOperationsData } from '../types';
import { api } from '../services/api';
import { 
  Flame, 
  Clock, 
  Layers, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Props {
  wellId: string;
}

export const CssPage: React.FC<Props> = ({ wellId }) => {
  const [data, setData] = useState<CssOperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getCss(wellId).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load CSS data:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId]);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Cyclic Steam Stimulation (CSS) Data...</span>
      </div>
    );
  }

  const { current_cycle, parameters_comparison, cycle_phases, historical_cycles } = data;

  const cycleChartData = historical_cycles.map(c => ({
    cycle: `Cycle #${c.cycle_number}`,
    steamTons: c.steam_volume_tons,
    oilProducedBbl: c.cum_oil_produced_bbl,
    osr: c.oil_steam_ratio
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Cyclic Steam Stimulation (CSS) Surveillance & Optimization
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold">
              Huff & Puff Cycle #{current_cycle.cycle_number || 4}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Thermal recovery surveillance for {data.well_name} • Current Phase: {current_cycle.current_phase || 'PRODUCTION'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">OIL-STEAM RATIO (OSR)</span>
            <span className="font-bold text-emerald-400 text-sm">{(data.oil_steam_ratio || 0.18).toFixed(3)} bbl/ton</span>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">CUM STEAM INJECTED</span>
            <span className="font-bold text-amber-400 text-sm">{Math.round(data.cumulative_steam_tons || 4900)} tons</span>
          </div>
        </div>
      </div>

      {/* CSS Cycle Stepper Visualization */}
      <div className="industrial-panel p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>CSS Cycle Progression Lifecycle</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {cycle_phases.map((ph, idx) => (
            <div
              key={ph.stage_id}
              className={`p-3 rounded-xl border relative transition-all ${
                ph.is_current
                  ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 text-amber-200'
                  : ph.is_completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 opacity-90'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-50'
              }`}
            >
              {ph.is_current && (
                <span className="absolute -top-2 right-2 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold uppercase animate-pulse">
                  Active
                </span>
              )}
              <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                <span>#{idx + 1}</span>
                <span>{ph.name}</span>
              </div>
              <span className="block font-mono text-[10px] text-slate-400 mb-1.5">{ph.duration}</span>
              <p className="text-[11px] leading-snug">{ph.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parameter Comparison Table (Current vs Recommended vs Diff vs Expected Impact) */}
      <div className="industrial-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>CSS Thermal Optimization Parameters</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              AI-calibrated parameters balancing reservoir heat soaking and thermal dissipation
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            Model: Walther Thermal Balance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Current Value</th>
                <th className="py-2.5 px-3">AI Recommended</th>
                <th className="py-2.5 px-3">Difference</th>
                <th className="py-2.5 px-4">Expected Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {parameters_comparison.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {p.parameter_name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {p.current_value} {p.unit}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">
                    {p.recommended_value} {p.unit}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      p.difference > 0 ? 'bg-emerald-950 text-emerald-300' : p.difference < 0 ? 'bg-amber-950 text-amber-300' : 'text-slate-400'
                    }`}>
                      {p.difference > 0 ? `+${p.difference}` : p.difference} {p.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                    {p.expected_impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Cycles Chart */}
      <div className="industrial-panel p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Historical Huff & Puff Cycle Performance</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Steam vs Oil Recovery</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cycleChartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} unit=" tons" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} unit=" bbl" />
              <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="steamTons" name="Steam Injected (tons)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="oilProducedBbl" name="Cum Oil Produced (bbl)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
