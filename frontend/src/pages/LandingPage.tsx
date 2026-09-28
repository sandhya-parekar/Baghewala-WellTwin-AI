import React from 'react';
import { 
  Flame, 
  Cpu, 
  Layers, 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  BarChart2, 
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface Props {
  onEnterDashboard: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenPresentation: () => void;
}

export const LandingPage: React.FC<Props> = ({ onEnterDashboard, onNavigateTab, onOpenPresentation }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-flame-500 to-amber-700 py-1.5 px-4 text-center text-xs font-bold text-slate-950 uppercase tracking-widest font-mono">
        Smart India Hackathon 2026 — Problem Statement ID: SIH26120 — Oil India Limited
      </div>

      {/* Hero Header */}
      <header className="px-6 py-16 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          Industrial Decision-Support Prototype | Heavy Oil Asset Optimization
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Baghewala WellTwin AI
        </h1>
        <p className="text-xl sm:text-2xl text-amber-400 font-semibold max-w-3xl mx-auto">
          AI-Enabled Well-to-Surface Digital Twin for Cyclic Steam Stimulation (CSS) & Sucker Rod Pump (SRP) Operations
        </p>

        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Integrated multi-physics optimization platform connecting thermal reservoir heat diffusion, 
          extreme heavy crude viscosity dynamics, and downhole sucker rod pump mechanical reliability 
          for the challenging heavy oil wells of Baghewala Field, Rajasthan.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <span>Launch Operator Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPresentation}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition-all"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>SIH 2026 Presentation Tour</span>
          </button>
        </div>

        {/* Disclaimer Callout */}
        <div className="bg-slate-900/60 border border-slate-800 max-w-2xl mx-auto p-3 rounded-lg text-xs text-slate-400 font-mono">
          ⚡ Prototype utilizing physics-calibrated synthetic data based on Baghewala field literature. 
          Enforces Human-in-the-Loop non-autonomous operator approval.
        </div>
      </header>

      {/* Core Pillars / Problem vs Solution */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Problem Card */}
          <div className="industrial-panel p-6 border-red-500/30 bg-red-950/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">The Industrial Challenge</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Extreme Heavy Crude Viscosity:</strong> 1,500 to 5,000+ cP at native reservoir temperatures (~60°C) with 14% asphaltene content severely restricts fluid mobility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Disconnected Operations:</strong> CSS steam cycles and SRP beam pumps are tuned separately by field teams, leading to premature pump unsetting and thermal inefficiency.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Severe Rod Floating Risk:</strong> As heated oil cools, viscous fluid drag retards downstroke rod fall velocity, risking rod compression, buckling, and parted rod strings.</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="industrial-panel p-6 border-emerald-500/30 bg-emerald-950/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">The WellTwin AI Solution</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Physics Digital Twin:</strong> Seamlessly couples Arrhenius-Walther thermal viscosity decline with sucker rod dynacards and surface inflow performance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Explainable AI & True Validation:</strong> Rigorous Random Forest & Gradient Boosting models with actual MAE/RMSE/R² metrics predicting production and cooling rates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Pareto Constrained Optimization:</strong> Balances heavy oil delivery, steam utility consumption, electrical energy, and sucker rod reliability with human review.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Grid */}
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Complete Well-to-Surface Functional Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "2D Interactive Digital Twin", icon: Layers, desc: "Real-time schematic of reservoir thermal plume, casing, reciprocating rod string, and surface beam unit.", tab: 'digital-twin' },
            { title: "Live Sensor Simulation", icon: Activity, desc: "Synchronized telemetry streaming with live start/pause/reset controls across 14 process parameters.", tab: 'live-monitoring' },
            { title: "CSS Cycle Monitoring", icon: Flame, desc: "Huff-and-Puff phase tracking: Steam Injection, Soak, Production, and Cooling cut-off optimization.", tab: 'css' },
            { title: "SRP Dynacards & Loads", icon: Cpu, desc: "Continuous surveillance of Peak and Minimum Polished Rod Loads, fluid pound, and downhole pump cards.", tab: 'srp' },
            { title: "AI Forecasting & Explainability", icon: Sparkles, desc: "Multivariate regression for production and cooling decay with feature importance attribution rankings.", tab: 'prediction' },
            { title: "What-If Simulator", icon: SlidersHorizontal, desc: "Virtual sandbox testing proposed steam volume, soak days, SPM, and stroke length against safety limits.", tab: 'what-if' },
            { title: "Multi-Objective Optimization", icon: Zap, desc: "Configurable weighted Pareto optimization generating AI-Suggested Operating Scenarios.", tab: 'optimization' },
            { title: "Predictive Maintenance", icon: ShieldCheck, desc: "Early detection of rod floating margins, tensile overloads, and traveling valve wear signatures.", tab: 'maintenance' },
            { title: "Operator Decision Center", icon: Award, desc: "Human-in-the-loop review workflow recording operator rationale, audits, and planning acceptance.", tab: 'decisions' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i}
                onClick={() => {
                  onNavigateTab(f.tab as NavTab);
                  onEnterDashboard();
                }}
                className="industrial-card hover:border-amber-500/50 cursor-pointer group space-y-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  {f.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technology Stack Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 py-8 px-6 text-center text-xs text-slate-400 space-y-3 font-mono">
        <div className="flex flex-wrap justify-center gap-6 text-slate-300">
          <span>React 19 + TypeScript + Vite</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>Python FastAPI REST API</span>
          <span>•</span>
          <span>SQLite Embedded Database</span>
          <span>•</span>
          <span>Scikit-Learn + NumPy + Pandas</span>
          <span>•</span>
          <span>Recharts & Lucide React</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Developed for Smart India Hackathon 2026 | Baghewala WellTwin AI | Problem Statement SIH26120
        </p>
      </footer>
    </div>
  );
};
