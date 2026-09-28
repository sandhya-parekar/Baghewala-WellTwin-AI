import React from 'react';
import { DigitalTwinState } from '../types';
import { InteractiveWellDiagram } from '../components/InteractiveWellDiagram';
import { Layers, Flame, Cpu, Droplet, ArrowDown, Activity, ShieldCheck, Thermometer } from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface Props {
  state: DigitalTwinState | null;
  onNavigateTab: (tab: NavTab) => void;
}

export const DigitalTwinPage: React.FC<Props> = ({ state, onNavigateTab }) => {
  if (!state) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Digital Twin Subsystems...</span>
      </div>
    );
  }

  const { reservoir, wellbore, srp, surface } = state;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Dedicated Digital Twin — Well-to-Surface Physics Model</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interconnected physical representation of Baghewala heavy crude recovery ({state.formation})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('what-if')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold transition-all"
          >
            Test Virtual Parameters in What-If →
          </button>
        </div>
      </div>

      {/* 2D Interactive Well Diagram Component */}
      <InteractiveWellDiagram state={state} isSimulating={true} />

      {/* Subsystem Flow Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Reservoir */}
        <div className="industrial-panel p-4 border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">1. Reservoir Matrix</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className="font-mono font-bold text-amber-400">{reservoir.temperature_c.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Crude Viscosity:</span>
              <span className="font-mono font-bold text-cyan-400">{reservoir.viscosity_cp.toFixed(0)} cP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pore Pressure:</span>
              <span className="font-mono text-slate-200">{reservoir.pressure_bar.toFixed(1)} bar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Steam Plume R:</span>
              <span className="font-mono text-slate-200">{reservoir.thermal_plume_radius_m} m</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            High heat reduces fluid resistance exponentially under Walther model.
          </div>
        </div>

        {/* 2. Wellbore & Completion */}
        <div className="industrial-panel p-4 border-blue-500/30 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Activity className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">2. Wellbore & Sandface</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Bottomhole Temp:</span>
              <span className="font-mono text-slate-200">{wellbore.bottomhole_temp_c.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wellhead Temp:</span>
              <span className="font-mono text-slate-200">{wellbore.wellhead_temp_c.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tubing Diameter:</span>
              <span className="font-mono text-slate-200">2-7/8 in</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CSS Phase:</span>
              <span className="font-mono font-bold text-amber-400">{wellbore.steam_injection_status}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            Perforations admit hot crude; uphole cooling creates thermal gradient.
          </div>
        </div>

        {/* 3. Sucker Rod Pump */}
        <div className="industrial-panel p-4 border-purple-500/30 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">3. Sucker Rod Pump</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Stroke Length:</span>
              <span className="font-mono text-slate-200">{srp.stroke_length_in} in</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pumping Speed:</span>
              <span className="font-mono font-bold text-white">{srp.spm.toFixed(1)} SPM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PPRL (Upstroke):</span>
              <span className="font-mono text-slate-200">{srp.peak_polished_rod_load_lbs.toLocaleString()} lbs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MPRL (Downstroke):</span>
              <span className={`font-mono font-bold ${srp.min_polished_rod_load_lbs < 2400 ? 'text-red-400' : 'text-emerald-400'}`}>
                {srp.min_polished_rod_load_lbs.toLocaleString()} lbs
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            Dynacard shape governs traveling and standing valve action.
          </div>
        </div>

        {/* 4. Surface Production */}
        <div className="industrial-panel p-4 border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Droplet className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">4. Surface Flowline</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Production Rate:</span>
              <span className="font-mono font-bold text-emerald-400">{surface.oil_production_bpd} BPD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Water Cut:</span>
              <span className="font-mono text-slate-200">{surface.water_cut_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Power Consumption:</span>
              <span className="font-mono text-slate-200">{surface.power_consumption_kw} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flowline Temp:</span>
              <span className="font-mono text-slate-200">{surface.surface_flowline_temp_c} °C</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
            Surface Coriolis flowmeter measures continuous heavy oil delivery.
          </div>
        </div>
      </div>
    </div>
  );
};
