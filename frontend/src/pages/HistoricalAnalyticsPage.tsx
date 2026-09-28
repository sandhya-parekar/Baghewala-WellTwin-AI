import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, 
  Activity, 
  Droplet, 
  Flame, 
  Zap, 
  Thermometer, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface Props {
  wellId: string;
}

export const HistoricalAnalyticsPage: React.FC<Props> = ({ wellId }) => {
  const [windowDays, setWindowDays] = useState<number>(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getAnalytics(wellId, windowDays).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Analytics load error:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId, windowDays]);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Historical Analytics Series...</span>
      </div>
    );
  }

  const { summary, timeseries } = data;

  return (
    <div className="space-y-6">
      {/* Header & Window Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Historical Operational Analytics
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
              {windowDays}-Day Trend Window
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Longitudinal decline curve and thermal stimulation performance for {data.well_name}
          </p>
        </div>

        {/* Time Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setWindowDays(days)}
              className={`px-3 py-1.5 rounded font-mono font-bold transition-all ${
                windowDays === days
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="industrial-panel p-3">
          <span className="text-slate-400 block text-[10px] font-mono">AVG PRODUCTION</span>
          <span className="font-mono text-base font-bold text-emerald-400">{summary.average_oil_bpd} BPD</span>
        </div>
        <div className="industrial-panel p-3">
          <span className="text-slate-400 block text-[10px] font-mono">CUMULATIVE OIL</span>
          <span className="font-mono text-base font-bold text-white">{Math.round(summary.total_oil_produced_bbl).toLocaleString()} bbl</span>
        </div>
        <div className="industrial-panel p-3">
          <span className="text-slate-400 block text-[10px] font-mono">STEAM INJECTED</span>
          <span className="font-mono text-base font-bold text-amber-400">{Math.round(summary.total_steam_injected_tons)} tons</span>
        </div>
        <div className="industrial-panel p-3">
          <span className="text-slate-400 block text-[10px] font-mono">AVG RESERVOIR TEMP</span>
          <span className="font-mono text-base font-bold text-slate-200">{summary.average_reservoir_temp_c} °C</span>
        </div>
        <div className="industrial-panel p-3">
          <span className="text-slate-400 block text-[10px] font-mono">SRP UPTIME</span>
          <span className="font-mono text-base font-bold text-cyan-400">{summary.average_srp_uptime_pct}%</span>
        </div>
        <div className="industrial-panel p-3">
          <span className="text-slate-400 block text-[10px] font-mono">OIL-STEAM RATIO</span>
          <span className="font-mono text-base font-bold text-purple-400">{summary.oil_steam_ratio} bbl/t</span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Production Decline & Steam Injections */}
        <div className="industrial-panel p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <Droplet className="w-4 h-4 text-emerald-400" />
            <span>Heavy Oil Production & Steam Injection History</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseries}>
                <defs>
                  <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis yAxisId="oil" stroke="#10b981" fontSize={10} unit=" BPD" />
                <YAxis yAxisId="steam" orientation="right" stroke="#f59e0b" fontSize={10} unit=" t" />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area yAxisId="oil" type="monotone" dataKey="oil_bpd" name="Oil Delivery (BPD)" stroke="#10b981" fillOpacity={1} fill="url(#oilGrad)" strokeWidth={2} />
                <Line yAxisId="steam" type="monotone" dataKey="steam_injected_tons" name="Steam Injected (t)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Thermal Dissipation & Energy Consumption */}
        <div className="industrial-panel p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>Thermal Dissipation vs Pumping Energy</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis yAxisId="temp" stroke="#f59e0b" fontSize={10} unit=" °C" domain={['dataMin - 5', 'dataMax + 5']} />
                <YAxis yAxisId="energy" orientation="right" stroke="#06b6d4" fontSize={10} unit=" kWh" />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="temp" type="monotone" dataKey="avg_temp_c" name="Reservoir Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="energy" type="monotone" dataKey="energy_kwh" name="Energy Draw (kWh)" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
