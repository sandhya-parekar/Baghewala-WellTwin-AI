import React from 'react';
import { DashboardData } from '../types';
import { HealthScoreGauge } from '../components/HealthScoreGauge';
import { 
  Flame, 
  Droplets, 
  Thermometer, 
  Gauge, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  SlidersHorizontal, 
  FileText, 
  SearchCode,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface Props {
  data: DashboardData | null;
  onNavigateTab: (tab: NavTab) => void;
  onOpenRootCause: () => void;
  onOpenReport: () => void;
  onRefreshData: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  data,
  onNavigateTab,
  onOpenRootCause,
  onOpenReport,
  onRefreshData
}) => {
  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Field Surveillance Dashboard...</span>
      </div>
    );
  }

  const { field_status, kpis, health_score, ai_insight, timeline_events } = data;

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-white tracking-tight">
              {data.well_name} ({data.well_id})
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              ACTIVE SURVEILLANCE
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {data.field}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time coupled thermal and beam lifting monitoring • Prototype Simulated Telemetry
          </p>
        </div>

        {/* Action Buttons (Every button is actionable!) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('digital-twin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Twin 2D</span>
          </button>

          <button
            onClick={() => onNavigateTab('what-if')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Run What-If</span>
          </button>

          <button
            onClick={() => onNavigateTab('optimization')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Optimization</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Field-Wide Quick Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Field Wells:</span>
          <span className="font-bold text-white">{field_status.active_wells} / {field_status.monitored_wells} Active</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Total Delivery:</span>
          <span className="font-bold text-emerald-400">{field_status.total_field_production_bpd.toFixed(1)} BPD</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Field Power:</span>
          <span className="font-bold text-cyan-400">{field_status.total_field_power_kw.toFixed(1)} kW</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Field Risk:</span>
          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
            field_status.overall_field_risk === 'LOW' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
          }`}>
            {field_status.overall_field_risk}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Sync Mode:</span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Simulated
          </span>
        </div>
      </div>

      {/* 3. AI Insight of the Day (Module 26) */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        ai_insight.type === 'ALERT'
          ? 'bg-red-950/30 border-red-500/40 text-red-200'
          : ai_insight.type === 'WARNING'
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          : ai_insight.type === 'OPTIMAL'
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-900/80 shrink-0 border border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                {ai_insight.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {ai_insight.generated_at}
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 leading-relaxed text-slate-100">
              {ai_insight.text}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRootCause}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all"
        >
          <SearchCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Root Cause Explorer</span>
        </button>
      </div>

      {/* 4. Well KPI Grid (With Clear Units & Status Badges) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Production Rate */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Droplets className="w-4 h-4 text-emerald-400" />
              Heavy Crude Production
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">
              Flowing
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {kpis.production_rate.value.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.production_rate.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Target delivery envelope: 100 - 160 BPD
          </p>
        </div>

        {/* Reservoir Temperature */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Reservoir Temperature
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              kpis.reservoir_temperature.status === 'WARNING' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
            }`}>
              {kpis.reservoir_temperature.status}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
              {kpis.reservoir_temperature.value.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.reservoir_temperature.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Native baseline: 61.8°C | Cut-off: 68.0°C
          </p>
        </div>

        {/* Dynamic Oil Viscosity */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-cyan-400" />
              Crude Dynamic Viscosity
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300">
              Walther Model
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">
              {kpis.oil_viscosity.value.toFixed(0)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.oil_viscosity.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Native unheated: ~3,200 cP
          </p>
        </div>

        {/* Reservoir Static Pressure */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-4 h-4 text-blue-400" />
              Reservoir Pressure
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              Normal
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {kpis.reservoir_pressure.value.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.reservoir_pressure.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Drainage cell pressure: 90 - 105 bar
          </p>
        </div>

        {/* SRP SPM */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-purple-400" />
              Pumping Speed
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">
              VFD Controlled
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {kpis.srp_spm.value.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.srp_spm.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Tuned to prevent rod floating
          </p>
        </div>

        {/* SRP Volumetric Efficiency */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-emerald-400" />
              SRP Volumetric Eff
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              kpis.srp_efficiency.value > 75 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
            }`}>
              {kpis.srp_efficiency.status}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-100">
              {kpis.srp_efficiency.value.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.srp_efficiency.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Target complete fillage: &gt; 80%
          </p>
        </div>

        {/* Energy Consumption */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-amber-400" />
              Motor Power Usage
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              Electrical
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {kpis.energy_consumption.value.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.energy_consumption.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Specific lifting: ~3.8 kWh/bbl
          </p>
        </div>

        {/* Equipment Health */}
        <div className="industrial-panel p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Equipment Health
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300">
              Composite
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
              {kpis.equipment_health.value.toFixed(0)}
            </span>
            <span className="text-xs font-mono text-slate-400">{kpis.equipment_health.unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Based on mechanical loads & thermal state
          </p>
        </div>
      </div>

      {/* 5. Health Score Breakdown & Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Well Health Score Gauge */}
        <div className="lg:col-span-7">
          <HealthScoreGauge breakdown={health_score} />
        </div>

        {/* Right: Digital Twin Well Health Timeline (Module 8) */}
        <div className="lg:col-span-5 industrial-panel p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Well Health Timeline (Today)</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Events Log</span>
          </div>

          <div className="space-y-3">
            {timeline_events.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-amber-400 text-[11px] font-bold shrink-0 pt-0.5">
                  {ev.time}
                </span>
                <div className="relative pl-3 border-l border-slate-700">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-500"></div>
                  <h5 className="font-semibold text-slate-200">{ev.event}</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{ev.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={() => onNavigateTab('replay')}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
            >
              <span>Launch Synchronized Replay (1h/6h/24h) →</span>
            </button>
            <button
              onClick={onRefreshData}
              className="text-slate-400 hover:text-slate-200 text-[11px]"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
