import React, { useState, useEffect } from 'react';
import { OptimizationResponse } from '../types';
import { api } from '../services/api';
import { 
  Sparkles, 
  Play, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Cpu, 
  ArrowRight, 
  Zap, 
  ShieldCheck,
  ClipboardCheck
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface Props {
  wellId: string;
  onNavigateTab: (tab: NavTab) => void;
}

export const OptimizationPage: React.FC<Props> = ({ wellId, onNavigateTab }) => {
  // Configurable Weights
  const [prodWeight, setProdWeight] = useState<number>(40);
  const [steamWeight, setSteamWeight] = useState<number>(20);
  const [energyWeight, setEnergyWeight] = useState<number>(20);
  const [equipWeight, setEquipWeight] = useState<number>(20);

  const [response, setResponse] = useState<OptimizationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const totalWeight = prodWeight + steamWeight + energyWeight + equipWeight;

  const handleRunOptimization = async () => {
    setIsExecuting(true);
    setLoading(true);
    try {
      const res = await api.runOptimization({
        well_id: wellId,
        weights: {
          production_weight: prodWeight / 100.0,
          steam_efficiency_weight: steamWeight / 100.0,
          energy_efficiency_weight: energyWeight / 100.0,
          equipment_reliability_weight: equipWeight / 100.0
        }
      });
      setResponse(res);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsExecuting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunOptimization();
  }, [wellId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Multi-Objective Constrained Optimization
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
              Pareto Well-to-Surface Solver
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Balances heavy oil delivery against thermal steam cost, electrical kilowatt draw, and sucker rod string longevity
          </p>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={isExecuting || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Solving Constrained Pareto Front...' : 'Run Optimization'}</span>
        </button>
      </div>

      {/* Objective Weight Configuration Sliders */}
      <div className="industrial-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Configurable Multi-Objective Function Weights</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust objective priorities based on field seasonal strategy (Total sum: {totalWeight}%)
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
            J = w₁·Q + w₂·η_steam + w₃·η_energy + w₄·Reliability
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Production Weight */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Heavy Crude Delivery:</span>
              <span className="font-bold text-emerald-400">{prodWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={70}
              value={prodWeight}
              onChange={(e) => setProdWeight(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Maximizes sandface inflow volume</span>
          </div>

          {/* Steam Efficiency Weight */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Steam Injection Efficiency:</span>
              <span className="font-bold text-amber-400">{steamWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={steamWeight}
              onChange={(e) => setSteamWeight(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Minimizes steam fuel & utility cost</span>
          </div>

          {/* Energy Efficiency Weight */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Electrical Lifting Energy:</span>
              <span className="font-bold text-cyan-400">{energyWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={energyWeight}
              onChange={(e) => setEnergyWeight(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Reduces motor kilowatt-hour draw</span>
          </div>

          {/* Equipment Reliability Weight */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Equipment Reliability:</span>
              <span className="font-bold text-purple-400">{equipWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={equipWeight}
              onChange={(e) => setEquipWeight(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Guarantees downstroke floating margin</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Output Card */}
      {response && (
        <div className="space-y-5">
          {/* Label Banner */}
          <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  {response.label}
                </h4>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  Algorithm identified optimal balance under API Grade D fatigue constraints and Walther thermal limits
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('decisions')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Forward to Operator Decision Center</span>
            </button>
          </div>

          {/* Parameters Comparison: Current vs AI Recommended */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CSS Recommended Parameters */}
            <div className="industrial-panel p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recommended CSS Thermal Parameters
                </h4>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Target Steam Volume:</span>
                  <span className="font-bold text-amber-400">{response.recommended_params.steam_volume_tons} tons</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Steam Injection Pressure:</span>
                  <span className="font-bold text-slate-200">{response.recommended_params.injection_pressure_bar} bar</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Optimal Soak Duration:</span>
                  <span className="font-bold text-slate-200">{response.recommended_params.soak_days} days</span>
                </div>
                <div className="flex justify-between py-1 pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Projected Dynamic Viscosity:</span>
                  <span className="font-bold text-cyan-400">{response.expected_impact.projected_viscosity_cp} cP</span>
                </div>
              </div>
            </div>

            {/* SRP Recommended Parameters */}
            <div className="industrial-panel p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recommended SRP Mechanical Controls
                </h4>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Optimal Pumping Speed:</span>
                  <span className="font-bold text-cyan-400">{response.recommended_params.srp_spm} SPM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">VFD Inverter Frequency:</span>
                  <span className="font-bold text-slate-200">{response.recommended_params.srp_vfd_hz} Hz</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Stroke Length:</span>
                  <span className="font-bold text-slate-200">{response.recommended_params.srp_stroke_in} in</span>
                </div>
                <div className="flex justify-between py-1 pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Downstroke Floating Margin:</span>
                  <span className="font-bold text-emerald-400">{Math.round(response.expected_impact.rod_floating_margin_lbs)} lbs (&gt; 2400 lbs limit)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Reasoning (WHY was this recommendation selected?) */}
          <div className="industrial-panel p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              Why was this recommendation selected? (Optimization Rationale)
            </h4>
            <div className="space-y-2">
              {response.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
