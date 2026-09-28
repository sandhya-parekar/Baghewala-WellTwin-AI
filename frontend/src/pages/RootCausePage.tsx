import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  SearchCode, 
  Activity, 
  HelpCircle, 
  TrendingDown, 
  AlertTriangle, 
  Thermometer, 
  Cpu, 
  ArrowDown, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface Props {
  wellId: string;
}

export const RootCausePage: React.FC<Props> = ({ wellId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getRootCause(wellId).then(res => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Root cause error:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId]);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Evaluating Multi-Physics Root Cause Attributions...</span>
      </div>
    );
  }

  const { factors, primary_driver, production_drop_bpd, physics_explanation, recommended_mitigation, disclaimer } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Root Cause Explorer — Why Did Production Decrease?
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono font-semibold">
              Diagnostic Attribution
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantitative multi-physics breakdown isolating thermal dissipation, pump fillage, and downhole friction
          </p>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Production Drop: </span>
          <span className="text-red-400 font-bold">-{production_drop_bpd} BPD from peak</span>
        </div>
      </div>

      {/* Primary Driver Hero Banner */}
      <div className="industrial-panel p-5 border-amber-500/30 bg-amber-950/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>DOMINANT CONTRIBUTING FACTOR IDENTIFIED</span>
        </div>
        <h3 className="text-xl font-black text-white">
          Primary Driver: {primary_driver}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {physics_explanation}
        </p>
      </div>

      {/* Quantitative Factors Breakdown */}
      <div className="industrial-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>Model-Supported Factor Contribution Breakdown</span>
          <span className="text-[10px] font-mono text-slate-400 font-normal">Sum: 100% Attribution</span>
        </h3>

        <div className="space-y-4">
          {factors.map((f: any, idx: number) => (
            <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px] font-bold">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-100 text-sm">{f.factor_name}</span>
                </div>
                <span className="font-mono text-amber-400 text-sm font-bold">
                  {f.contribution_pct}% Contribution
                </span>
              </div>

              {/* Visual Percentage Bar */}
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                  style={{ width: `${f.contribution_pct}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {f.impact_description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Engineering Mitigation */}
      <div className="industrial-panel p-5 space-y-3 border-emerald-500/30">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Recommended Engineering Mitigation Plan</span>
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          {recommended_mitigation}
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 font-mono text-center">
        ⚠️ {disclaimer}
      </div>
    </div>
  );
};
