import React, { useState, useEffect } from 'react';
import { WhatIfResponse } from '../types';
import { api } from '../services/api';
import { 
  SlidersHorizontal, 
  Play, 
  BookmarkPlus, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Flame, 
  Cpu, 
  Activity,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Props {
  wellId: string;
}

export const WhatIfPage: React.FC<Props> = ({ wellId }) => {
  // Input Sliders State
  const [steamVolume, setSteamVolume] = useState<number>(2600);
  const [injPressure, setInjPressure] = useState<number>(94);
  const [soakDays, setSoakDays] = useState<number>(5);
  const [cutoffTemp, setCutoffTemp] = useState<number>(68);
  const [strokeIn, setStrokeIn] = useState<number>(144);
  const [spm, setSpm] = useState<number>(6.4);
  const [vfdHz, setVfdHz] = useState<number>(50.0);

  const [response, setResponse] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Auto-tune VFD when SPM changes
  const handleSpmChange = (newSpm: number) => {
    setSpm(newSpm);
    setVfdHz(Math.round(newSpm * 7.8 * 10) / 10);
  };

  const executeWhatIf = async () => {
    setLoading(true);
    setSavedSuccess(null);
    try {
      const res = await api.runWhatIf({
        well_id: wellId,
        steam_volume_tons: steamVolume,
        injection_pressure_bar: injPressure,
        soak_days: soakDays,
        production_cutoff_temp_c: cutoffTemp,
        srp_stroke_in: strokeIn,
        srp_spm: spm,
        srp_vfd_hz: vfdHz
      });
      setResponse(res);
    } catch (err) {
      console.error('What-If simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeWhatIf();
  }, [wellId]);

  const handleSaveScenario = async () => {
    if (!response) return;
    try {
      await api.saveScenario({
        well_id: wellId,
        scenario_name: `Custom What-If (${spm} SPM / ${steamVolume}t Steam)`,
        strategy_type: 'Custom',
        parameters: {
          steam_volume_tons: steamVolume,
          injection_pressure_bar: injPressure,
          soak_days: soakDays,
          production_cutoff_temp_c: cutoffTemp,
          srp_stroke_in: strokeIn,
          srp_spm: spm,
          srp_vfd_hz: vfdHz
        },
        simulated_outputs: response.proposed,
        well_health_score: response.proposed.well_health_score,
        notes: `Simulated by operator via What-If sandbox on ${new Date().toLocaleDateString()}`
      });
      setSavedSuccess('Scenario successfully saved to Scenario Comparison catalog!');
      setTimeout(() => setSavedSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to save scenario:', err);
    }
  };

  // Comparison Bar Chart Data
  const comparisonData = response ? [
    {
      metric: 'Oil Delivery (BPD)',
      Current: response.current.oil_production_bpd,
      Proposed: response.proposed.oil_production_bpd
    },
    {
      metric: 'Power Draw (kW)',
      Current: response.current.power_consumption_kw,
      Proposed: response.proposed.power_consumption_kw
    },
    {
      metric: 'Pump Efficiency (%)',
      Current: response.current.pump_eff_pct,
      Proposed: response.proposed.pump_eff_pct
    },
    {
      metric: 'Health Score (/100)',
      Current: response.current.well_health_score,
      Proposed: response.proposed.well_health_score
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              What-If Simulation Sandbox
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-semibold">
              Interactive Virtual Experimentation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Virtually test coupled CSS thermal parameters & SRP beam pumping speeds without field risk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={executeWhatIf}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating...' : 'Run What-If Simulation'}</span>
          </button>

          {response && (
            <button
              onClick={handleSaveScenario}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save Scenario</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Main Sliders & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sliders Panel */}
        <div className="lg:col-span-5 industrial-panel p-5 space-y-5">
          {/* CSS Thermal Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>CSS Thermal Parameters</span>
            </h3>

            {/* Steam Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Steam Volume:</span>
                <span className="font-bold text-amber-400">{steamVolume} tons</span>
              </div>
              <input
                type="range"
                min={1800}
                max={3400}
                step={50}
                value={steamVolume}
                onChange={(e) => setSteamVolume(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1,800t</span>
                <span>Nominal 2,400t</span>
                <span>3,400t</span>
              </div>
            </div>

            {/* Injection Pressure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Injection Pressure:</span>
                <span className="font-bold text-slate-200">{injPressure} bar</span>
              </div>
              <input
                type="range"
                min={80}
                max={110}
                step={1}
                value={injPressure}
                onChange={(e) => setInjPressure(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>80 bar</span>
                <span>Frac Limit: 112 bar</span>
                <span>110 bar</span>
              </div>
            </div>

            {/* Soak Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Heat Soak Duration:</span>
                <span className="font-bold text-slate-200">{soakDays} days</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={soakDays}
                onChange={(e) => setSoakDays(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2 days</span>
                <span>Optimal: 4-6 days</span>
                <span>10 days</span>
              </div>
            </div>
          </div>

          {/* SRP Mechanical Controls */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>SRP Mechanical Controls</span>
            </h3>

            {/* SPM */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Pumping Speed (SPM):</span>
                <span className="font-bold text-cyan-400">{spm.toFixed(1)} SPM</span>
              </div>
              <input
                type="range"
                min={3.5}
                max={8.5}
                step={0.1}
                value={spm}
                onChange={(e) => handleSpmChange(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>3.5 SPM</span>
                <span>Normal 6.0</span>
                <span>8.5 SPM</span>
              </div>
            </div>

            {/* Stroke Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Stroke Length:</span>
                <span className="font-bold text-slate-200">{strokeIn} in</span>
              </div>
              <select
                value={strokeIn}
                onChange={(e) => setStrokeIn(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
              >
                <option value={120}>120 inches (Short Stroke)</option>
                <option value={144}>144 inches (Standard Heavy Oil)</option>
                <option value={168}>168 inches (Long Stroke High Inflow)</option>
              </select>
            </div>

            {/* VFD Hz */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">VFD Inverter Frequency:</span>
                <span className="font-bold text-slate-200">{vfdHz} Hz</span>
              </div>
              <input
                type="range"
                min={30}
                max={60}
                step={0.5}
                value={vfdHz}
                onChange={(e) => setVfdHz(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Side-by-Side Comparison */}
        <div className="lg:col-span-7 space-y-5">
          {response && (
            <>
              {/* Verdict Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                response.is_safe_to_operate
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}>
                {response.is_safe_to_operate ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">
                    {response.is_safe_to_operate ? 'Simulation Safe & Feasible' : 'Safety Constraint Violation'}
                  </span>
                  <span>{response.summary_verdict}</span>
                  {response.warnings.length > 0 && (
                    <div className="mt-2 space-y-1 pt-2 border-t border-red-500/30 font-mono text-[11px]">
                      {response.warnings.map((w, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Side-by-Side Cards (CURRENT vs PROPOSED) */}
              <div className="grid grid-cols-2 gap-4">
                {/* CURRENT SCENARIO */}
                <div className="industrial-panel p-4 space-y-3 border-slate-700">
                  <div className="pb-2 border-b border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">
                      Current Scenario
                    </span>
                    <h4 className="text-sm font-bold text-white">Baseline Operating State</h4>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Production:</span>
                      <span className="font-bold text-white">{response.current.oil_production_bpd} BPD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Steam Vol:</span>
                      <span className="text-slate-300">{response.current.steam_consumption_tons} t</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Power:</span>
                      <span className="text-slate-300">{response.current.power_consumption_kw} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Viscosity:</span>
                      <span className="text-slate-300">{response.current.oil_viscosity_cp} cP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Rod Load:</span>
                      <span className="text-slate-300">{Math.round(response.current.min_rod_load_lbs)} lbs</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Health Score:</span>
                      <span className="font-bold text-slate-200">{response.current.well_health_score}/100</span>
                    </div>
                  </div>
                </div>

                {/* PROPOSED SCENARIO */}
                <div className="industrial-panel p-4 space-y-3 border-amber-500/40 bg-amber-500/5">
                  <div className="pb-2 border-b border-amber-500/20">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-amber-400 font-bold">
                      Proposed Scenario
                    </span>
                    <h4 className="text-sm font-bold text-white">What-If Simulation Output</h4>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Production:</span>
                      <span className="font-bold text-emerald-400">
                        {response.proposed.oil_production_bpd} BPD ({response.delta_percentage.production_bpd > 0 ? `+${response.delta_percentage.production_bpd}%` : `${response.delta_percentage.production_bpd}%`})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Steam Vol:</span>
                      <span className="text-amber-300">{response.proposed.steam_consumption_tons} t</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Power:</span>
                      <span className="text-slate-200">{response.proposed.power_consumption_kw} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Viscosity:</span>
                      <span className="text-cyan-300">{response.proposed.oil_viscosity_cp} cP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Rod Load:</span>
                      <span className={`font-bold ${response.proposed.min_rod_load_lbs < 2400 ? 'text-red-400' : 'text-slate-200'}`}>
                        {Math.round(response.proposed.min_rod_load_lbs)} lbs
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-amber-500/20">
                      <span className="text-slate-400">Health Score:</span>
                      <span className="font-bold text-amber-400">{response.proposed.well_health_score}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Bar Chart */}
              <div className="industrial-panel p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800">
                  Current vs Proposed Metric Variance
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="metric" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Current" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Proposed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
