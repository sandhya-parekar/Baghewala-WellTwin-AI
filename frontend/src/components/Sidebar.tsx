import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Radio, 
  Flame, 
  Cpu, 
  SlidersHorizontal, 
  Sparkles, 
  Wrench, 
  AlertTriangle, 
  GitCompare, 
  BarChart3, 
  RotateCcw, 
  SearchCode, 
  ShieldCheck, 
  ClipboardCheck, 
  FileText, 
  Award,
  ChevronRight
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'digital-twin'
  | 'live-monitoring'
  | 'css'
  | 'srp'
  | 'prediction'
  | 'what-if'
  | 'optimization'
  | 'maintenance'
  | 'alerts'
  | 'scenarios'
  | 'analytics'
  | 'replay'
  | 'root-cause'
  | 'data-quality'
  | 'decisions'
  | 'reports'
  | 'sih-mapping';

interface MenuItem {
  id: NavTab;
  label: string;
  icon: any;
  badge?: number;
  highlight?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCount: number;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onSelectTab, alertCount }) => {
  const menuSections: MenuSection[] = [
    {
      title: 'CORE TWIN & SURVEILLANCE',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
        { id: 'digital-twin', label: 'Digital Twin (2D Schematic)', icon: Layers },
        { id: 'live-monitoring', label: 'Live Simulation Controls', icon: Radio },
      ]
    },
    {
      title: 'OPERATIONAL DOMAINS',
      items: [
        { id: 'css', label: 'CSS Steam Monitoring', icon: Flame },
        { id: 'srp', label: 'SRP & Dynacards', icon: Cpu },
      ]
    },
    {
      title: 'AI & PREDICTIVE ENGINES',
      items: [
        { id: 'prediction', label: 'AI Forecasting (Real Metrics)', icon: Sparkles },
        { id: 'what-if', label: 'What-If Simulator', icon: SlidersHorizontal },
        { id: 'optimization', label: 'Multi-Objective Optimization', icon: Sparkles },
        { id: 'maintenance', label: 'Predictive Maintenance', icon: Wrench },
        { id: 'alerts', label: 'Smart Alert Engine', icon: AlertTriangle, badge: alertCount },
      ]
    },
    {
      title: 'ANALYTICS & DIAGNOSTICS',
      items: [
        { id: 'scenarios', label: 'Scenario Comparison', icon: GitCompare },
        { id: 'analytics', label: 'Historical Analytics', icon: BarChart3 },
        { id: 'replay', label: 'Digital Twin Replay', icon: RotateCcw },
        { id: 'root-cause', label: 'Root Cause Explorer', icon: SearchCode },
        { id: 'data-quality', label: 'Data Quality Monitor', icon: ShieldCheck },
      ]
    },
    {
      title: 'DECISION SUPPORT & SIH',
      items: [
        { id: 'decisions', label: 'Operator Decision Center', icon: ClipboardCheck },
        { id: 'reports', label: 'Report Dossier Generator', icon: FileText },
        { id: 'sih-mapping', label: 'SIH Requirement Mapping', icon: Award, highlight: true },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-[calc(100vh-57px)] sticky top-[57px] select-none overflow-y-auto">
      <div className="p-3 space-y-5">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5 font-mono">
              {sec.title}
            </h4>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-cyan-400 hover:bg-slate-800/80 hover:text-cyan-300'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono font-bold">
                      {item.badge}
                    </span>
                  )}

                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-auto p-3 border-t border-slate-800/80 bg-slate-950/60 text-[10px] text-slate-400 font-mono space-y-1">
        <div className="flex justify-between">
          <span>Field:</span>
          <span className="text-slate-200">Baghewala, RJ</span>
        </div>
        <div className="flex justify-between">
          <span>Engine:</span>
          <span className="text-emerald-400 font-bold">FastAPI + Scikit-Learn</span>
        </div>
        <div className="text-[9px] text-slate-400 pt-1 text-center">
          SIH 2026 Non-Autonomous Prototype
        </div>
      </div>
    </aside>
  );
};
