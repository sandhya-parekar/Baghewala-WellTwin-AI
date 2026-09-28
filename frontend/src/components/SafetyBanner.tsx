import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-y border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold text-amber-300">
          SAFETY PRINCIPLE & HUMAN-IN-THE-LOOP PROTOCOL:
        </span>
        <span className="opacity-90 hidden sm:inline">
          AI provides decision-support recommendations only. Direct autonomous control of physical wellhead equipment is prohibited.
        </span>
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Review required before operational use</span>
      </div>
    </div>
  );
};
