import React from 'react';
import { Well, UserProfile } from '../types';
import { 
  Flame, 
  Cpu, 
  Presentation, 
  ShieldAlert, 
  Moon, 
  Sun, 
  UserCheck, 
  ChevronDown,
  Activity,
  Layers
} from 'lucide-react';

interface Props {
  wells: Well[];
  selectedWellId: string;
  onSelectWell: (id: string) => void;
  currentUser: UserProfile;
  onChangeRole: (role: 'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER') => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenPresentation: () => void;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  wells,
  selectedWellId,
  onSelectWell,
  currentUser,
  onChangeRole,
  isDemoMode,
  onToggleDemoMode,
  isDarkMode,
  onToggleTheme,
  onOpenPresentation,
  onOpenReportModal,
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md px-4 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Branding & SIH Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-flame-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <Flame className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Baghewala WellTwin AI
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
                SIH26120
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-sans hidden sm:inline-block">
                Oil India Limited
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide hidden md:block">
              AI-Enabled Well-to-Surface Digital Twin for Heavy Oil Optimization
            </p>
          </div>
        </div>

        {/* Center: Well Selector & Prototype Tag */}
        <div className="flex items-center gap-2">
          {/* Well Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedWellId}
              onChange={(e) => onSelectWell(e.target.value)}
              className="bg-slate-950 border border-slate-700 hover:border-amber-500 text-white font-mono text-xs font-bold rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner"
            >
              {wells.map((w) => (
                <option key={w.well_id} value={w.well_id}>
                  {w.well_id} — {w.name} ({w.current_status})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>

          {/* Prototype Badge */}
          <span className="hidden lg:flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded bg-slate-800/80 text-amber-400 border border-slate-700/80 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Prototype / Simulated Data
          </span>
        </div>

        {/* Right: Presentation Mode, Demo Toggle, User Role & Theme */}
        <div className="flex items-center gap-2">
          {/* SIH Presentation Mode Button */}
          <button
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
            title="Start 5-minute guided presentation for judges"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presentation Mode</span>
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              isDemoMode
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="Toggle between Synthetic Streaming Mode and Static Snapshot"
          >
            <Activity className={`w-3.5 h-3.5 ${isDemoMode ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span className="hidden md:inline">{isDemoMode ? 'LIVE SIM' : 'STATIC'}</span>
          </button>

          {/* Role Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px] font-bold text-amber-400">{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
              {(['ADMIN', 'ENGINEER', 'OPERATOR', 'VIEWER'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => onChangeRole(role)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                    currentUser.role === role ? 'text-amber-400 font-bold bg-slate-800/40' : 'text-slate-300'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser.role === role && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
