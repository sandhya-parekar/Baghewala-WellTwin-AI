import React, { useState } from 'react';
import { DigitalTwinState } from '../types';
import { Flame, Activity, Gauge, Zap, AlertTriangle, ShieldCheck, Thermometer, Droplet } from 'lucide-react';

interface Props {
  state: DigitalTwinState | null;
  isSimulating?: boolean;
}

export const InteractiveWellDiagram: React.FC<Props> = ({ state, isSimulating = true }) => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<'all' | 'surface' | 'pump' | 'reservoir'>('all');
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  if (!state) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Digital Twin telemetry...</span>
      </div>
    );
  }

  const { reservoir, srp, wellbore, surface } = state;
  const isRodFloatingRisk = srp.min_polished_rod_load_lbs < 2400;
  const isHighViscosity = reservoir.viscosity_cp > 600;

  // Temperature color mapping
  const heatColor = reservoir.temperature_c > 120 
    ? '#ef4444' 
    : reservoir.temperature_c > 85 
    ? '#f97316' 
    : reservoir.temperature_c > 70 
    ? '#f59e0b' 
    : '#0284c7';

  return (
    <div className="industrial-panel p-5 relative overflow-hidden">
      {/* Header & Subsystem Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              2D Well-to-Surface Physics Twin
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Depth: {state.depth_m}m TVD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Coupled thermo-viscosity and sucker rod mechanical load dynamics
          </p>
        </div>

        {/* Subsystem Focus Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['all', 'surface', 'pump', 'reservoir'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedSubsystem(tab)}
              className={`px-3 py-1 rounded font-medium capitalize transition-all ${
                selectedSubsystem === tab
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? 'Entire System' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive SVG Diagram */}
        <div className="lg:col-span-8 flex justify-center bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 relative">
          <svg viewBox="0 0 520 620" className="w-full max-w-[460px] h-auto drop-shadow-2xl">
            <defs>
              {/* Thermal dissipation gradient */}
              <radialGradient id="steamPlume" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={heatColor} stopOpacity="0.85" />
                <stop offset="45%" stopColor={heatColor} stopOpacity="0.45" />
                <stop offset="85%" stopColor="#1e293b" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>

              {/* Viscous heavy oil gradient */}
              <linearGradient id="heavyOilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#090d16" />
                <stop offset="50%" stopColor="#1a120b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>

              {/* Metal steel tubing */}
              <linearGradient id="metalTubing" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>

            {/* 1. Ground Surface Line */}
            <line x1="20" y1="140" x2="500" y2="140" stroke="#334155" strokeWidth="3" strokeDasharray="6 4" />
            <text x="30" y="132" fill="#64748b" fontSize="10" fontFamily="monospace">SURFACE ELEVATION 0.0m</text>

            {/* 2. SURFACE SRP PUMPING UNIT (LUFKIN BEAM) */}
            <g 
              className="cursor-pointer transition-transform hover:opacity-95"
              onMouseEnter={() => setHoveredComponent('surface_unit')}
              onMouseLeave={() => setHoveredComponent(null)}
              opacity={selectedSubsystem === 'all' || selectedSubsystem === 'surface' ? 1 : 0.25}
            >
              {/* Samson Post */}
              <polygon points="170,140 195,50 205,50 230,140" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              {/* Walking Beam */}
              <polygon points="120,40 280,48 275,58 120,48" fill="#334155" stroke="#64748b" strokeWidth="2" />
              {/* Horsehead Curved Front */}
              <path d="M 120 40 C 95 45, 90 75, 105 105 L 115 102 C 105 78, 108 52, 125 45 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
              {/* Counterweight & Pitman Arm */}
              <circle cx="280" cy="95" r="22" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              <line x1="275" y1="52" x2="280" y2="95" stroke="#94a3b8" strokeWidth="4" />
              <rect x="268" y="85" width="24" height="20" fill="#eab308" rx="2" />
              {/* Motor Unit */}
              <rect x="260" y="125" width="45" height="15" fill="#0284c7" stroke="#0369a1" />
              <text x="264" y="136" fill="#fff" fontSize="8" fontWeight="bold">VFD {srp.vfd_speed_hz}Hz</text>

              {/* Bridle & Polished Rod Wire */}
              <line x1="105" y1="105" x2="105" y2="140" stroke="#f1f5f9" strokeWidth="2.5" />
              <rect x="98" y="135" width="14" height="6" fill="#e2e8f0" stroke="#475569" />
              <text x="125" y="95" fill="#e2e8f0" fontSize="10" fontWeight="bold">PPRL: {srp.peak_polished_rod_load_lbs.toLocaleString()} lbs</text>
              <text x="125" y="110" fill={isRodFloatingRisk ? '#ef4444' : '#10b981'} fontSize="9" fontFamily="monospace">
                MPRL: {srp.min_polished_rod_load_lbs.toLocaleString()} lbs {isRodFloatingRisk && '⚠️'}
              </text>
            </g>

            {/* 3. SURFACE FLOWLINE & WELLHEAD */}
            <g
              onMouseEnter={() => setHoveredComponent('wellhead')}
              onMouseLeave={() => setHoveredComponent(null)}
              opacity={selectedSubsystem === 'all' || selectedSubsystem === 'surface' ? 1 : 0.25}
            >
              {/* Wellhead Casing Flange */}
              <rect x="85" y="140" width="40" height="20" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              {/* Flowline Pipe going to surface tanks */}
              <path d="M 85 148 L 30 148 L 30 175" fill="none" stroke="#f59e0b" strokeWidth="4" />
              <circle cx="30" cy="175" r="4" fill="#10b981" />
              <text x="35" y="180" fill="#38bdf8" fontSize="9" fontWeight="bold">
                {surface.oil_production_bpd} BPD @ {surface.surface_flowline_temp_c}°C
              </text>
            </g>

            {/* 4. WELLBORE CASING & TUBING */}
            {/* 7" Outer Casing */}
            <rect x="82" y="160" width="46" height="380" fill="#090d16" stroke="#334155" strokeWidth="2" />
            {/* Cement Sheath */}
            <line x1="80" y1="160" x2="80" y2="540" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="130" y1="160" x2="130" y2="540" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />

            {/* 2-7/8" Inner Production Tubing */}
            <rect x="95" y="160" width="20" height="360" fill="url(#heavyOilGrad)" stroke="url(#metalTubing)" strokeWidth="1.5" />

            {/* 5. RECIPROCATING SUCKER ROD STRING */}
            <g className={isSimulating ? 'animate-rod' : ''}>
              {/* Steel Rod Shaft */}
              <line x1="105" y1="140" x2="105" y2="480" stroke="#cbd5e1" strokeWidth="3" />
              {/* Rod Guides / Couplings */}
              {[210, 270, 330, 390, 440].map(y => (
                <rect key={y} x="101" y={y} width="8" height="5" fill="#f59e0b" rx="1" />
              ))}
              {/* Plunger */}
              <rect x="98" y="470" width="14" height="35" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
              {/* Traveling Valve Ball */}
              <circle cx="105" cy="485" r="3.5" fill="#f8fafc" />
            </g>

            {/* Standing Valve (Fixed at pump bottom) */}
            <g 
              onMouseEnter={() => setHoveredComponent('standing_valve')}
              onMouseLeave={() => setHoveredComponent(null)}
              opacity={selectedSubsystem === 'all' || selectedSubsystem === 'pump' ? 1 : 0.25}
            >
              <rect x="96" y="515" width="18" height="15" fill="#1e293b" stroke="#64748b" />
              <circle cx="105" cy="522" r="3.5" fill="#e2e8f0" />
              <text x="135" y="522" fill="#94a3b8" fontSize="9">Pump Fillage: {srp.pump_fillage_pct}%</text>
            </g>

            {/* 6. RESERVOIR & THERMAL PLUME ZONE */}
            <g
              onMouseEnter={() => setHoveredComponent('reservoir_zone')}
              onMouseLeave={() => setHoveredComponent(null)}
              opacity={selectedSubsystem === 'all' || selectedSubsystem === 'reservoir' ? 1 : 0.25}
            >
              {/* Thermal Heat Bulb (Plume) */}
              <ellipse 
                cx="105" 
                cy="540" 
                rx={Math.min(reservoir.thermal_plume_radius_m * 9, 130)} 
                ry="55" 
                fill="url(#steamPlume)" 
                className={isSimulating ? 'animate-heat' : ''}
              />

              {/* Perforations (Shots into rock matrix) */}
              {[510, 520, 530, 540, 550, 560].map(py => (
                <g key={py}>
                  <line x1="72" y1={py} x2="82" y2={py} stroke="#f59e0b" strokeWidth="2.5" />
                  <line x1="128" y1={py} x2="138" y2={py} stroke="#f59e0b" strokeWidth="2.5" />
                  {/* Flow arrows */}
                  <polygon points={`84,${py-2} 88,${py} 84,${py+2}`} fill="#38bdf8" />
                  <polygon points={`126,${py-2} 122,${py} 126,${py+2}`} fill="#38bdf8" />
                </g>
              ))}

              {/* Formation Stratigraphy Labels */}
              <text x="240" y="525" fill="#f8fafc" fontSize="11" fontWeight="bold">
                {state.formation}
              </text>
              <text x="240" y="542" fill={heatColor} fontSize="10" fontFamily="monospace">
                Temp: {reservoir.temperature_c.toFixed(1)}°C (Viscosity: {reservoir.viscosity_cp.toFixed(0)} cP)
              </text>
              <text x="240" y="558" fill="#94a3b8" fontSize="9">
                Static Pressure: {reservoir.pressure_bar.toFixed(1)} bar | Plume R: {reservoir.thermal_plume_radius_m}m
              </text>
            </g>

            {/* Depth Milestones */}
            <text x="20" y="240" fill="#475569" fontSize="8" fontFamily="monospace">-250m</text>
            <text x="20" y="360" fill="#475569" fontSize="8" fontFamily="monospace">-600m</text>
            <text x="20" y="480" fill="#475569" fontSize="8" fontFamily="monospace">-900m</text>
            <text x="20" y="545" fill="#f59e0b" fontSize="8" fontFamily="monospace">-1040m</text>
          </svg>
        </div>

        {/* Dynamic Telemetry Sidebar / Explanatory Card */}
        <div className="lg:col-span-4 space-y-3">
          {/* Coupling Alert Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isRodFloatingRisk
              ? 'bg-red-950/40 border-red-500/50 text-red-200'
              : isHighViscosity
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              {isRodFloatingRisk ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>Rod Floating Hazard Alert</span>
                </>
              ) : isHighViscosity ? (
                <>
                  <Thermometer className="w-5 h-5 text-amber-400" />
                  <span>Viscous Flow Resistance</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Optimal Fluid & Rod Balance</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {isRodFloatingRisk
                ? `MPRL (${srp.min_polished_rod_load_lbs} lbs) is below 2400 lbs safety limit. Downstroke rod fall is retarded by viscous drag (${reservoir.viscosity_cp} cP). VFD throttling required.`
                : isHighViscosity
                ? `High dynamic viscosity (${reservoir.viscosity_cp} cP) increases boundary friction drag. Steam thermal energy dissipation active.`
                : `Thermal stimulation maintains fluidity (${reservoir.viscosity_cp} cP). Upstroke & downstroke forces conform to API Grade D envelope.`}
            </p>
          </div>

          {/* Subsystem Telemetry Quick Panels */}
          <div className="industrial-card space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Thermal-Viscosity State
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Reservoir Temp</span>
                <span className="font-mono text-base font-bold text-amber-400">{reservoir.temperature_c.toFixed(1)}°C</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Crude Viscosity</span>
                <span className="font-mono text-base font-bold text-cyan-400">{reservoir.viscosity_cp.toFixed(0)} cP</span>
              </div>
            </div>
          </div>

          <div className="industrial-card space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              SRP Beam Mechanics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pumping Speed</span>
                <span className="font-mono text-base font-bold text-white">{srp.spm.toFixed(1)} SPM</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Motor Power</span>
                <span className="font-mono text-base font-bold text-white">{surface.power_consumption_kw} kW</span>
              </div>
            </div>
          </div>

          <div className="industrial-card space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-emerald-400" />
              Production Deliverability
            </h4>
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Heavy Oil Delivery</span>
                <span className="font-mono text-lg font-bold text-emerald-400">{surface.oil_production_bpd} BPD</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Pump Volumetric Eff</span>
                <span className="font-mono text-base font-bold text-slate-200">{srp.pump_efficiency_pct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
