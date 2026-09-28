import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Radio, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Flame, 
  Gauge, 
  Zap, 
  Droplet,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  wellId: string;
}

interface TelemetryPoint {
  time: string;
  temperature: number;
  viscosity: number;
  production: number;
  pprl: number;
  mprl: number;
  spm: number;
  power: number;
}

export const LiveMonitoringPage: React.FC<Props> = ({ wellId }) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [dataPoints, setDataPoints] = useState<TelemetryPoint[]>([]);
  const [currentReading, setCurrentReading] = useState<any>(null);
  const [tickSpeed, setTickSpeed] = useState<number>(3000); // 3 seconds
  const [tickCount, setTickCount] = useState<number>(0);

  // Fetch initial telemetry
  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const replay = await api.getReplay(wellId, '1h');
        if (replay && replay.telemetry_frames && isMounted) {
          const formatted = replay.telemetry_frames.slice(-15).map((f: any) => ({
            time: f.timestamp.split(' ')[1] || f.timestamp,
            temperature: f.reservoir_temp_c,
            viscosity: f.oil_viscosity_cp,
            production: f.oil_production_bpd,
            pprl: f.srp_peak_load_lbs,
            mprl: f.srp_min_load_lbs,
            spm: f.srp_spm,
            power: f.power_consumption_kw
          }));
          setDataPoints(formatted);
          if (formatted.length > 0) {
            setCurrentReading(replay.telemetry_frames[replay.telemetry_frames.length - 1]);
          }
        }
      } catch (err) {
        console.error('Failed to load initial live frames:', err);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [wellId]);

  // Real-time ticking interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const tickRes = await api.tickSimulation(wellId);
        if (tickRes) {
          setCurrentReading(tickRes);
          setTickCount(c => c + 1);
          const newPt: TelemetryPoint = {
            time: tickRes.timestamp.split(' ')[1] || tickRes.timestamp,
            temperature: tickRes.reservoir_temp_c,
            viscosity: tickRes.oil_viscosity_cp,
            production: tickRes.oil_production_bpd,
            pprl: tickRes.srp_peak_load_lbs,
            mprl: tickRes.srp_min_load_lbs,
            spm: tickRes.srp_spm,
            power: tickRes.power_consumption_kw
          };

          setDataPoints(prev => {
            const next = [...prev, newPt];
            return next.length > 20 ? next.slice(-20) : next;
          });
        }
      } catch (err) {
        console.error('Tick simulation error:', err);
      }
    }, tickSpeed);

    return () => clearInterval(interval);
  }, [isRunning, wellId, tickSpeed]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = async () => {
    try {
      await api.resetSimulation(wellId);
      setDataPoints([]);
      setTickCount(0);
      setIsRunning(true);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Real-Time Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Live Telemetry & Digital Twin Simulation Stream</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              LIVE SIMULATED DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generating continuous physical perturbations every {tickSpeed / 1000}s • Total Ticks: {tickCount}
          </p>
        </div>

        {/* Real Action Controls */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Simulation</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Simulation</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Live Parameter Telemetry Strip */}
      {currentReading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="industrial-panel p-3">
            <span className="text-slate-400 block text-[10px] font-mono">RESERVOIR TEMP</span>
            <span className="font-mono text-lg font-bold text-amber-400">
              {currentReading.reservoir_temp_c?.toFixed(1) || '85.0'} °C
            </span>
          </div>
          <div className="industrial-panel p-3">
            <span className="text-slate-400 block text-[10px] font-mono">DYNAMIC VISCOSITY</span>
            <span className="font-mono text-lg font-bold text-cyan-400">
              {currentReading.oil_viscosity_cp?.toFixed(0) || '120'} cP
            </span>
          </div>
          <div className="industrial-panel p-3">
            <span className="text-slate-400 block text-[10px] font-mono">HEAVY OIL PRODUCTION</span>
            <span className="font-mono text-lg font-bold text-emerald-400">
              {currentReading.oil_production_bpd?.toFixed(1) || '125.0'} BPD
            </span>
          </div>
          <div className="industrial-panel p-3">
            <span className="text-slate-400 block text-[10px] font-mono">SRP SPM / VFD</span>
            <span className="font-mono text-lg font-bold text-white">
              {currentReading.srp_spm?.toFixed(1) || '6.0'} SPM
            </span>
          </div>
          <div className="industrial-panel p-3">
            <span className="text-slate-400 block text-[10px] font-mono">DOWNSTROKE MPRL</span>
            <span className={`font-mono text-lg font-bold ${currentReading.srp_min_load_lbs < 2400 ? 'text-red-400' : 'text-slate-200'}`}>
              {Math.round(currentReading.srp_min_load_lbs || 3500)} lbs
            </span>
          </div>
          <div className="industrial-panel p-3">
            <span className="text-slate-400 block text-[10px] font-mono">PUMP VOL EFFICIENCY</span>
            <span className="font-mono text-lg font-bold text-slate-100">
              {currentReading.srp_efficiency_pct?.toFixed(1) || '82.0'}%
            </span>
          </div>
        </div>
      )}

      {/* Synchronized Real-Time Live Multi-Channel Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Production vs Reservoir Temperature */}
        <div className="industrial-panel p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Droplet className="w-4 h-4 text-emerald-400" />
              <span>Production & Reservoir Heat Conduction Stream</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Last 20 Samples</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={10} unit=" BPD" />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} unit=" °C" domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="production" name="Oil Delivery (BPD)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="temperature" name="Reservoir Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sucker Rod Peak & Min Load Dynamics */}
        <div className="industrial-panel p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Rod String Kinematic Tension (PPRL vs MPRL)</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">API Grade D Limits</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} unit=" lbs" domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="pprl" name="Peak Upstroke Load (PPRL)" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="mprl" name="Min Downstroke Load (MPRL)" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
