import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FileText, 
  Download, 
  Printer, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';

interface Props {
  wellId: string;
}

export const ReportsPage: React.FC<Props> = ({ wellId }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getReport(wellId).then(res => {
      if (isMounted) {
        setReport(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load report:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Baghewala_WellTwin_Dossier_${wellId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !report) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Compiling Well Technical Dossier...</span>
      </div>
    );
  }

  const { well_profile, current_operating_condition, css_status, srp_status, active_alerts, operator_decisions } = report;

  return (
    <div className="space-y-6">
      {/* Header & Download Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Well-to-Surface Technical Dossier & Audit Report
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
              {report.report_id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generated at {report.generated_at} • SIH Problem Statement ID: SIH26120
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6 font-sans print:bg-white print:text-black print:p-0 print:border-none">
        {/* Document Letterhead */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:border-black">
          <div>
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">
              OIL INDIA LIMITED • HEAVY OIL ASSET
            </span>
            <h1 className="text-2xl font-black text-white print:text-black">
              Baghewala WellTwin AI Operational Review
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
              Problem Statement ID: SIH26120 • Digital Twin Decision Support Protocol
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 print:text-slate-600 block">REPORT ID:</span>
            <span className="font-bold text-amber-400 print:text-black">{report.report_id}</span>
            <span className="text-[10px] text-slate-400 print:text-slate-600 block">{report.generated_at}</span>
          </div>
        </div>

        {/* Section 1: Well Profile Master Metadata */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            1. Well & Reservoir Geological Profile
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 print:bg-slate-100 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">WELL IDENTIFIER</span>
              <span className="font-bold text-white print:text-black">{well_profile.well_id}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">FORMATION</span>
              <span className="font-bold text-white print:text-black">{well_profile.formation}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">DEPTH / API GRAVITY</span>
              <span className="font-bold text-white print:text-black">{well_profile.depth_m}m TVD / {well_profile.api_gravity}° API</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">ASPHALTENE FRACTION</span>
              <span className="font-bold text-white print:text-black">{well_profile.asphaltene_pct}%</span>
            </div>
          </div>
        </div>

        {/* Section 2: Current Operating State */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            2. Integrated Telemetry & Well-to-Surface Condition
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/50 print:bg-slate-100 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">OIL PRODUCTION RATE</span>
              <span className="text-base font-bold text-emerald-400 print:text-emerald-700">{current_operating_condition.oil_production_bpd} BPD</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">RESERVOIR TEMPERATURE</span>
              <span className="text-base font-bold text-amber-400 print:text-amber-700">{current_operating_condition.reservoir_temp_c} °C</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">DYNAMIC VISCOSITY</span>
              <span className="text-base font-bold text-cyan-400 print:text-cyan-700">{current_operating_condition.oil_viscosity_cp} cP</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">ELECTRICAL POWER</span>
              <span className="font-bold text-white print:text-black">{current_operating_condition.power_consumption_kw} kW</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">COMPOSITE HEALTH SCORE</span>
              <span className="font-bold text-white print:text-black">{current_operating_condition.health_score} / 100</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">DOWNSTROKE TENSION</span>
              <span className="font-bold text-white print:text-black">{srp_status.min_load_lbs} lbs (Safe)</span>
            </div>
          </div>
        </div>

        {/* Section 3: CSS & SRP Operational Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 print:bg-slate-50 space-y-2 text-xs">
            <h4 className="font-bold text-white print:text-black flex items-center gap-1.5 uppercase font-mono text-[11px]">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>CSS Thermal Parameters</span>
            </h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between"><span>Current Cycle:</span><span className="font-bold">#{css_status.cycle_number} ({css_status.current_phase})</span></div>
              <div className="flex justify-between"><span>Steam Volume:</span><span>{css_status.steam_volume_tons} tons</span></div>
              <div className="flex justify-between"><span>Injection Pressure:</span><span>{css_status.injection_pressure_bar} bar</span></div>
              <div className="flex justify-between"><span>Soak Period:</span><span>{css_status.soak_days} days</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 print:bg-slate-50 space-y-2 text-xs">
            <h4 className="font-bold text-white print:text-black flex items-center gap-1.5 uppercase font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>SRP Mechanical Lifting Parameters</span>
            </h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between"><span>Stroke Length:</span><span>{srp_status.stroke_length_in} in</span></div>
              <div className="flex justify-between"><span>Pumping Speed:</span><span className="font-bold">{srp_status.spm} SPM</span></div>
              <div className="flex justify-between"><span>Peak Rod Load (PPRL):</span><span>{srp_status.peak_load_lbs} lbs</span></div>
              <div className="flex justify-between"><span>Pump Fillage %:</span><span>{srp_status.pump_fillage_pct}%</span></div>
            </div>
          </div>
        </div>

        {/* Section 4: Operator Governance Audit Trail */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            3. Operator Decision Sign-off Trail
          </h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-900 print:bg-slate-200 text-slate-400 print:text-slate-800 text-[10px]">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Operator</th>
                  <th className="p-2">Audit Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {operator_decisions.map((d: any) => (
                  <tr key={d.id}>
                    <td className="p-2 text-slate-400">{d.timestamp}</td>
                    <td className="p-2 font-bold text-emerald-400 print:text-emerald-800">{d.action}</td>
                    <td className="p-2">{d.operator_name}</td>
                    <td className="p-2 text-slate-300 print:text-black">{d.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Disclaimer Footer */}
        <div className="pt-4 border-t border-slate-800 print:border-black text-[10px] text-slate-400 print:text-slate-600 font-mono text-center leading-relaxed">
          🔒 {report.safety_disclaimer}
        </div>
      </div>
    </div>
  );
};
