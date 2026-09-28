import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  GitCompare, 
  Activity, 
  CheckCircle2, 
  SlidersHorizontal, 
  BarChart3, 
  Flame, 
  Cpu, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { NavTab } from '../components/Sidebar';

interface Props {
  wellId: string;
  onNavigateTab: (tab: NavTab) => void;
}

export const ScenarioComparisonPage: React.FC<Props> = ({ wellId, onNavigateTab }) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getScenarios(wellId).then(res => {
      if (isMounted) {
        setScenarios(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load scenarios:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Saved Scenarios...</span>
      </div>
    );
  }

  // Chart data comparing scenarios
  const chartData = scenarios.map(s => ({
    name: s.scenario_name.split(' ')[0] || s.strategy_type,
    production: s.simulated_outputs?.oil_production_bpd || 0,
    power: s.simulated_outputs?.power_consumption_kw || 0,
    health: s.well_health_score || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Multi-Scenario Comparative Evaluation
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
              {scenarios.length} Saved Strategies
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Objective side-by-side analysis (Conservative vs Balanced vs Production-Focused) without subjective ranking
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('what-if')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Create New Scenario in What-If</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenarios.map((sc, i) => {
          const params = sc.parameters || {};
          const out = sc.simulated_outputs || {};
          const isBalanced = sc.strategy_type === 'Balanced';

          return (
            <div
              key={sc.id || i}
              className={`industrial-panel p-5 space-y-4 border transition-all ${
                isBalanced
                  ? 'border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-bold uppercase">
                    {sc.strategy_type}
                  </span>
                  <span className="text-slate-400">{sc.created_at ? sc.created_at.split(' ')[0] : 'Saved'}</span>
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  {sc.scenario_name}
                </h4>
              </div>

              {/* Input Parameters */}
              <div className="space-y-1.5 text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">
                  Operating Inputs
                </span>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Steam Injection:</span>
                  <span className="text-amber-400 font-bold">{params.steam_volume_tons || 2400} t</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Pumping Speed:</span>
                  <span className="text-cyan-400 font-bold">{params.spm || params.srp_spm || 6.0} SPM</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Soak Period:</span>
                  <span className="text-slate-300">{params.soak_days || 5} days</span>
                </div>
              </div>

              {/* Simulated Output Metrics */}
              <div className="space-y-1.5 text-xs font-mono pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">
                  Simulated Outputs
                </span>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Heavy Oil Flow:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {out.oil_production_bpd || 125} BPD
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Power Consumption:</span>
                  <span className="text-slate-200">{out.power_consumption_kw || 22} kW</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Fluid Viscosity:</span>
                  <span className="text-cyan-300">{out.viscosity_cp || 120} cP</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Equipment Risk:</span>
                  <span className={`font-bold ${out.equipment_risk === 'HIGH' ? 'text-red-400' : 'text-slate-300'}`}>
                    {out.equipment_risk || 'LOW'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 font-sans font-semibold">Health Score:</span>
                  <span className="font-bold text-amber-400">{sc.well_health_score}/100</span>
                </div>
              </div>

              {sc.notes && (
                <p className="text-[11px] text-slate-400 italic pt-1 leading-snug">
                  "{sc.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparative Multi-Metric Bar Chart */}
      <div className="industrial-panel p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>Cross-Scenario Performance Variance</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="production" name="Oil Delivery (BPD)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="power" name="Power Draw (kW)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="health" name="Health Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
