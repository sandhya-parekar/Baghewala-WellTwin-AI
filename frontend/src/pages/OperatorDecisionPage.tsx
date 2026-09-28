import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal, 
  RotateCcw, 
  Activity, 
  Clock, 
  UserCheck,
  FileCheck2
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface Props {
  wellId: string;
  onNavigateTab: (tab: NavTab) => void;
}

export const OperatorDecisionPage: React.FC<Props> = ({ wellId, onNavigateTab }) => {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('Anil Kumar Meena');
  const [operatorRole, setOperatorRole] = useState<string>('Field Operations Lead - Baghewala');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const res = await api.getDecisions(wellId);
      setDecisions(res);
    } catch (err) {
      console.error('Failed to load decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, [wellId]);

  const handleSubmitDecision = async (action: string) => {
    if (!rationale.trim()) {
      alert('Please provide an operational rationale for the audit log.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await api.recordDecision({
        well_id: wellId,
        scenario_or_rec_id: `OPT-REC-2026-${Math.floor(100 + Math.random() * 900)}`,
        action: action,
        operator_name: operatorName,
        operator_role: operatorRole,
        rationale: rationale,
        parameters: { spm: 6.4, steam_tons: 2500, soak_days: 5 },
        notes: "Decision recorded during operational planning meeting."
      });

      setStatusMessage(res.message);
      setRationale('');
      fetchDecisions();
    } catch (err) {
      console.error('Decision error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Safety Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Operator Decision Support Center
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              Human-in-the-Loop Protocol Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory engineering verification gateway. AI suggests operating scenarios; certified human operators authorize planning execution.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Direct well control disabled by safety protocol</span>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 p-3.5 rounded-xl text-xs text-emerald-200 flex items-center gap-2.5 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Decision Cockpit: Current Suggestion vs Operator Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: AI-Suggested Scenario Summary Card */}
        <div className="lg:col-span-7 industrial-panel p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Pending Technical Review
              </span>
              <h3 className="text-base font-bold text-white">
                AI-Suggested Operating Scenario #2026-B
              </h3>
            </div>
            <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded text-slate-300 border border-slate-800">
              Balanced Objective (Score: 91.5)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PROPOSED SRP SPM</span>
              <span className="text-base font-bold text-cyan-400">6.4 SPM (+0.4)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">STEAM VOLUME</span>
              <span className="text-base font-bold text-amber-400">2,500 Tons (+50t)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PROJECTED PRODUCTION</span>
              <span className="text-base font-bold text-emerald-400">136 BPD (+8.8%)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MIN ROD TENSION</span>
              <span className="text-base font-bold text-slate-200">2,850 lbs (Safe)</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Key Reasons for Recommendation:
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Viscosity suppressed to 88 cP through 5-day heat soak diffusion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Downstroke rod tension margin remains well above the 2,400 lbs compressive buckling threshold.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Power consumption increases by only 1.2 kW, preserving overall lifting energy efficiency.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Operator Action & Sign-off Panel */}
        <div className="lg:col-span-5 industrial-panel p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Operator Authorization Gate</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review required before operational use
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Operator Name:</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-medium text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Operational Role:</label>
              <input
                type="text"
                value={operatorRole}
                onChange={(e) => setOperatorRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-medium text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Engineering Rationale / Audit Notes:
              </label>
              <textarea
                rows={3}
                placeholder="Enter justification for planning acceptance, rejection, or parameter modification..."
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Operator Decision Action Buttons (Real buttons!) */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleSubmitDecision('ACCEPTED_FOR_PLANNING')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept for Planning</span>
              </button>

              <button
                onClick={() => handleSubmitDecision('REJECTED')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Suggestion</span>
              </button>
            </div>

            <button
              onClick={() => onNavigateTab('what-if')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Run Another Virtual Scenario in What-If</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Audit Trail of Operator Decisions */}
      <div className="industrial-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <span>Audited Decision Log & Human Approvals</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Compliance Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Decision Action</th>
                <th className="py-2.5 px-3">Authorized By</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-4">Operator Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {decisions.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400">{d.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      d.action === 'ACCEPTED_FOR_PLANNING' ? 'bg-emerald-950 text-emerald-300' :
                      d.action === 'REJECTED' ? 'bg-red-950 text-red-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {d.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{d.operator_name}</td>
                  <td className="py-3 px-3 text-slate-400">{d.operator_role}</td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                    {d.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
