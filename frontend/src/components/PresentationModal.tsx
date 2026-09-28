import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Flame, 
  Activity, 
  Cpu, 
  SlidersHorizontal, 
  Sparkles, 
  ClipboardCheck, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: NavTab) => void;
}

export const PresentationModal: React.FC<Props> = ({ isOpen, onClose, onNavigateToTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: 1,
      title: "Problem Statement SIH26120: Baghewala Field",
      tab: 'dashboard' as NavTab,
      category: "Oil India Limited Industrial Context",
      icon: Flame,
      summary: "Baghewala crude is characterized by high viscosity (1,500–5,000+ cP) and high asphaltene content in low-temperature reservoirs (~60°C).",
      talkingPoints: [
        "CSS (Cyclic Steam Stimulation) and SRP (Sucker Rod Pumps) are operated separately in practice.",
        "When cold crude enters the pump, fluid friction rises sharply, decelerating the downstroke rod string.",
        "Our Digital Twin bridges the gap: coupling reservoir thermodynamics directly with surface beam pumping mechanics."
      ]
    },
    {
      stepNumber: 2,
      title: "2D Well-to-Surface Physics Twin",
      tab: 'digital-twin' as NavTab,
      category: "Multi-Physics Integration",
      icon: Activity,
      summary: "Explore the live animated 2D cross-section linking reservoir thermal dissipation to rod reciprocation.",
      talkingPoints: [
        "Reservoir heat diffusion models Walther dynamic viscosity response.",
        "Sucker rod string dynacard calculates peak polished rod tension and downstroke floating margin.",
        "Interactive focus tabs allow drilldown into Surface, Wellbore, Pump, and Reservoir subsystems."
      ]
    },
    {
      stepNumber: 3,
      title: "AI Prediction with Real Validation Metrics",
      tab: 'prediction' as NavTab,
      category: "Machine Learning Rigor",
      icon: Sparkles,
      summary: "No fake 99.9% claims. Demonstrates real Random Forest and Gradient Boosting metrics evaluated on physical test splits.",
      talkingPoints: [
        "MAE, RMSE, and R² displayed directly from trained model catalogs.",
        "Predicts future heavy oil delivery, reservoir cooling rates (°C/day), and sucker rod failure risk.",
        "Explainable AI: Displays feature importance attribution rankings (SPM dynamics, dynamic viscosity, reservoir temperature)."
      ]
    },
    {
      stepNumber: 4,
      title: "Predictive Maintenance & Rod Floating Prevention",
      tab: 'maintenance' as NavTab,
      category: "Mechanical Reliability",
      icon: Cpu,
      summary: "Proactively identifies compression buckling and rod floating before costly workovers occur.",
      talkingPoints: [
        "Detects minimum polished rod load drops below 2,400 lbs threshold.",
        "Diagnoses fluid pounding, pump unsetting risk, and tensile fatigue.",
        "Provides actionable engineering inspection steps for field maintenance technicians."
      ]
    },
    {
      stepNumber: 5,
      title: "What-If Simulation Sandbox",
      tab: 'what-if' as NavTab,
      category: "Virtual Scenario Experimentation",
      icon: SlidersHorizontal,
      summary: "Permits operational testing of CSS and SRP parameters without risking physical well equipment.",
      talkingPoints: [
        "Sliders for Steam Volume, Injection Pressure, Soak Days, Stroke Length, SPM, and VFD Hz.",
        "Side-by-side comparison of Current vs Proposed operating state.",
        "Automated Safety Guards reject configurations violating rod stress or formation fracture limits."
      ]
    },
    {
      stepNumber: 6,
      title: "Multi-Objective Constrained Optimization",
      tab: 'optimization' as NavTab,
      category: "AI Decision Suggestion",
      icon: Sparkles,
      summary: "Balances 4 conflicting operational objectives using configurable mathematical weights.",
      talkingPoints: [
        "Production Weight (40%) + Steam Efficiency (20%) + Energy Efficiency (20%) + Reliability (20%).",
        "Generates 'AI-Suggested Operating Scenario' with transparent trade-off rationale.",
        "Ensures rod floating margin and motor torque constraints are strictly satisfied."
      ]
    },
    {
      stepNumber: 7,
      title: "Human-in-the-Loop Operator Decision Center",
      tab: 'decisions' as NavTab,
      category: "Safety & Governance",
      icon: ClipboardCheck,
      summary: "Strict non-autonomous safeguard: recommendations require explicit human operator approval.",
      talkingPoints: [
        "Operator actions: 'Review Recommendation', 'Accept for Planning', 'Reject', 'Run Another Scenario'.",
        "Every decision recorded with timestamp, operator name, role, and engineering rationale.",
        "Direct physical well actuation is disabled by design—guaranteeing operational safety compliance."
      ]
    },
    {
      stepNumber: 8,
      title: "SIH Requirement Mapping & Readiness",
      tab: 'sih-mapping' as NavTab,
      category: "Evaluation Matrix",
      icon: Award,
      summary: "100% compliance with Problem Statement SIH26120 requirements for Oil India Limited.",
      talkingPoints: [
        "Complete well-to-surface digital twin running locally on Windows without cloud dependencies.",
        "Functional backend, sqlite database, ML models, and high-performance React UI.",
        "Every button performs an actual computational action—zero decorative mockups."
      ]
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      onNavigateToTab(steps[nextIdx].tab);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      onNavigateToTab(steps[prevIdx].tab);
    }
  };

  const handleJumpToStep = (idx: number) => {
    setCurrentStep(idx);
    onNavigateToTab(steps[idx].tab);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>SIH 2026 Presentation Tour</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                  Step {current.stepNumber} of {steps.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Problem Statement ID: SIH26120 — Oil India Limited</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="bg-slate-950/60 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
          {steps.map((st, idx) => (
            <button
              key={idx}
              onClick={() => handleJumpToStep(idx)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all shrink-0 ${
                currentStep === idx
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : currentStep > idx
                  ? 'bg-slate-800 text-emerald-400'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {currentStep > idx ? <CheckCircle2 className="w-3 h-3" /> : <span>#{st.stepNumber}</span>}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{current.category}</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {current.title}
          </h2>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed">
            {current.summary}
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Judge Demonstration Points:
            </h4>
            <div className="space-y-2">
              {current.talkingPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              onNavigateToTab(current.tab);
              onClose();
            }}
            className="text-xs font-mono text-cyan-400 hover:underline"
          >
            Go to this page in App →
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
