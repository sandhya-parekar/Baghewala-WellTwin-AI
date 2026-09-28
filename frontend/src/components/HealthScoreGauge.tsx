import React from 'react';
import { HealthScoreBreakdown } from '../types';
import { Shield, PlusCircle, MinusCircle, Info } from 'lucide-react';

interface Props {
  breakdown: HealthScoreBreakdown;
}

export const HealthScoreGauge: React.FC<Props> = ({ breakdown }) => {
  const { total_score, label, positive_factors, negative_factors, category_scores } = breakdown;

  // Determine color theme
  const colorClass = total_score >= 85 
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' 
    : total_score >= 70 
    ? 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20' 
    : total_score >= 50 
    ? 'text-amber-400 border-amber-500/40 bg-amber-950/20' 
    : 'text-red-400 border-red-500/40 bg-red-950/20';

  const strokeColor = total_score >= 85 ? '#10b981' : total_score >= 70 ? '#06b6d4' : total_score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="industrial-panel p-5">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Well Health Score (Prototype Composite)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
          0 – 100 Scale
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Circular Gauge Visualization */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#1e293b"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress arc */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={strokeColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${(total_score / 100) * 264} 264`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-3xl font-extrabold text-white">
                {total_score.toFixed(0)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">/ 100</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${colorClass}`}>
                {label}
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Factor Attribution Breakdown */}
        <div className="md:col-span-8 space-y-3">
          {/* Subsystem Category Micro-Bars */}
          {category_scores && (
            <div className="grid grid-cols-2 gap-2 text-xs mb-2 pb-2 border-b border-slate-800/70">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Production Stability</span>
                  <span className="font-mono text-slate-200">{category_scores.production.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${category_scores.production}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Thermal State</span>
                  <span className="font-mono text-slate-200">{category_scores.thermal.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${category_scores.thermal}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">SRP Volumetric Eff</span>
                  <span className="font-mono text-slate-200">{category_scores.pump_mechanics.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${category_scores.pump_mechanics}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Rod Stress Margin</span>
                  <span className="font-mono text-slate-200">{category_scores.structural_safety.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${category_scores.structural_safety}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Contributing Drivers */}
          <div className="space-y-1.5">
            <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Why did the health score change?
            </h5>

            {positive_factors?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-emerald-300 bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{item.factor}:</strong> {item.detail}</span>
              </div>
            ))}

            {negative_factors?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-red-300 bg-red-950/20 px-2.5 py-1 rounded border border-red-900/30">
                <MinusCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>{item.factor}:</strong> {item.detail}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 italic flex items-center gap-1 mt-1">
            <Info className="w-3 h-3 text-slate-500" />
            Composite prototype score for multi-physics decision triage.
          </p>
        </div>
      </div>
    </div>
  );
};
