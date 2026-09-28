import React, { useState, useEffect } from 'react';
import { SrpOperationsData } from '../types';
import { api } from '../services/api';
import { DynacardChart } from '../components/DynacardChart';
import { 
  Cpu, 
  Activity, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  BarChart2, 
  CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Props {
  wellId: string;
}

export const SrpPage: React.FC<Props> = ({ wellId }) => {
  const [data, setData] = useState<SrpOperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getSrp(wellId).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load SRP data:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId]);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Sucker Rod Pump (SRP) Telemetry...</span>
      </div>
    );
  }

  const { parameters, dynacards, status, status_message, load_trend_history } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Sucker Rod Pump (SRP) Surveillance & Dynacards
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
              status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Surface Unit: {data.surface_unit} • Type: {data.srp_type}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Card Signature:</span>
          <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-bold">
            {dynacards.card_classification}
          </span>
        </div>
      </div>

      {/* Status Warning Banner if degraded */}
      <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
        status === 'CRITICAL' ? 'bg-red-950/30 border-red-500/40 text-red-200' :
        status === 'WARNING' ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' :
        'bg-slate-900/60 border-slate-800 text-slate-300'
      }`}>
        {status === 'CRITICAL' ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" /> : <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />}
        <div>
          <span className="font-bold uppercase tracking-wider block">Operational Diagnostic Notice:</span>
          <span className="opacity-90">{status_message}</span>
        </div>
      </div>

      {/* Main Dynacard & Mechanical Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Dynamometer Card */}
        <div className="lg:col-span-8">
          <DynacardChart
            surfaceCard={dynacards.surface_card}
            pumpCard={dynacards.pump_card}
            pprl={parameters.peak_polished_rod_load_lbs}
            mprl={parameters.min_polished_rod_load_lbs}
            cardType={dynacards.card_classification}
          />
        </div>

        {/* Right: SRP Mechanical Specs Card */}
        <div className="lg:col-span-4 industrial-panel p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Beam Mechanical Parameters</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Stroke Length:</span>
              <span className="font-mono font-bold text-white">{parameters.stroke_length_in} in</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Pumping Speed (SPM):</span>
              <span className="font-mono font-bold text-amber-400">{parameters.spm.toFixed(1)} SPM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">VFD Motor Speed:</span>
              <span className="font-mono text-slate-200">{parameters.vfd_speed_hz.toFixed(1)} Hz</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Gearbox Torque Rating:</span>
              <span className="font-mono text-slate-200">{parameters.gearbox_torque_pct}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Motor Current:</span>
              <span className="font-mono text-slate-200">{parameters.motor_current_amps} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Pump Fillage:</span>
              <span className="font-mono font-bold text-emerald-400">{parameters.pump_fillage_pct}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Max Rod Stress:</span>
              <span className="font-mono text-slate-200">{Math.round(parameters.rod_stress_psi).toLocaleString()} psi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Load Trend Chart */}
      <div className="industrial-panel p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>24-Hour Polished Rod Load History</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">PPRL vs MPRL vs Pump Fillage</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={load_trend_history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split(' ')[1] || val} />
              <YAxis yAxisId="load" stroke="#64748b" fontSize={10} unit=" lbs" domain={['dataMin - 1000', 'dataMax + 1000']} />
              <YAxis yAxisId="eff" orientation="right" stroke="#10b981" fontSize={10} unit=" %" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="load" type="monotone" dataKey="peak_polished_rod_load_lbs" name="Peak Load (PPRL)" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line yAxisId="load" type="monotone" dataKey="min_polished_rod_load_lbs" name="Min Load (MPRL)" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line yAxisId="eff" type="monotone" dataKey="pump_fillage_pct" name="Pump Fillage %" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
