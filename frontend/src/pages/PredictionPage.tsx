import React, { useState, useEffect } from 'react';
import { PredictionData } from '../types';
import { api } from '../services/api';
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Thermometer, 
  Cpu, 
  BarChart2, 
  HelpCircle 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Props {
  wellId: string;
}

export const PredictionPage: React.FC<Props> = ({ wellId }) => {
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchPrediction = async (days: number) => {
    setLoading(true);
    try {
      const res = await api.runPrediction({
        well_id: wellId,
        horizon_days: days
      });
      setData(res);
    } catch (err) {
      console.error('Failed to run AI prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(horizonDays);
  }, [wellId, horizonDays]);

  const handleRunPrediction = async () => {
    setIsExecuting(true);
    await fetchPrediction(horizonDays);
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Horizon Selector and Run Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              AI Prediction & Explainability Engine
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
              Scikit-Learn Machine Learning Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physical heavy crude forecasting with true test validation metrics (MAE, RMSE, R²)
          </p>
        </div>

        {/* Real Action Controls */}
        <div className="flex items-center gap-2">
          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setHorizonDays(days)}
                className={`px-3 py-1 rounded font-mono font-bold transition-all ${
                  horizonDays === days
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          {/* Run Prediction Button */}
          <button
            onClick={handleRunPrediction}
            disabled={isExecuting || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Executing Models...' : 'Run Prediction'}</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="h-96 flex items-center justify-center text-slate-400">
          <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
          <span>Executing Scikit-Learn Inference Pipeline...</span>
        </div>
      ) : data ? (
        <>
          {/* Validation Metrics Strip (Real Metrics, No Fake 99.9%) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="industrial-panel p-3">
              <span className="text-slate-400 block text-[10px]">MODEL ACCREDITATION</span>
              <span className="font-bold text-slate-100 text-xs truncate block">{data.model_name}</span>
            </div>
            <div className="industrial-panel p-3">
              <span className="text-slate-400 block text-[10px]">TEST MEAN ABSOLUTE ERROR</span>
              <span className="font-bold text-emerald-400 text-sm">{data.mae} BPD (MAE)</span>
            </div>
            <div className="industrial-panel p-3">
              <span className="text-slate-400 block text-[10px]">ROOT MEAN SQUARED ERROR</span>
              <span className="font-bold text-cyan-400 text-sm">{data.rmse} BPD (RMSE)</span>
            </div>
            <div className="industrial-panel p-3">
              <span className="text-slate-400 block text-[10px]">R² COEFFICIENT OF DETERMINATION</span>
              <span className="font-bold text-amber-400 text-sm">R² = {data.r2.toFixed(4)}</span>
            </div>
          </div>

          {/* Forecast Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Production Forecast */}
            <div className="industrial-panel p-4 space-y-2 border-emerald-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-emerald-400">Predicted Heavy Oil Flow</span>
                <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Day +{horizonDays}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-white">{data.predicted_oil_bpd}</span>
                <span className="text-xs font-mono text-slate-400">BPD</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Model confidence: {data.model_confidence_pct}%
              </p>
            </div>

            {/* 2. Temperature & Cooling Trend */}
            <div className="industrial-panel p-4 space-y-2 border-amber-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-amber-400">Reservoir Cooling Trend</span>
                <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Thermal Decay</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-amber-400">{data.predicted_res_temp_c}</span>
                <span className="text-xs font-mono text-slate-400">°C</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cooling rate: ~{data.cooling_rate_c_day} °C/day • Viscosity: {data.predicted_viscosity_cp} cP
              </p>
            </div>

            {/* 3. Sucker Rod Failure Risk */}
            <div className="industrial-panel p-4 space-y-2 border-purple-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-purple-400">Rod Failure & Floating Risk</span>
                <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Kinematic Risk</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-mono font-bold ${data.rod_failure_risk_pct > 40 ? 'text-red-400' : 'text-slate-100'}`}>
                  {data.rod_failure_risk_pct}%
                </span>
                <span className="text-xs font-mono text-slate-400">Risk Index</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Assessed Equipment Risk: <strong className="text-white">{data.predicted_equipment_risk}</strong>
              </p>
            </div>
          </div>

          {/* Explainable AI (XAI) & Forecast Curve Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Forecast Trend Curve */}
            <div className="lg:col-span-7 industrial-panel p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>{horizonDays}-Day Projected Decline Curve</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Thermal vs Oil Delivery</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend_forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} unit="d" label={{ value: 'Forecast Horizon (Days)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 10 }} />
                    <YAxis yAxisId="p" stroke="#10b981" fontSize={11} unit=" BPD" />
                    <YAxis yAxisId="t" orientation="right" stroke="#f59e0b" fontSize={11} unit=" °C" domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line yAxisId="p" type="monotone" dataKey="projected_prod_bpd" name="Oil Delivery (BPD)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="t" type="monotone" dataKey="projected_temp_c" name="Reservoir Temp (°C)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Explainable AI Feature Attribution (Module 13) */}
            <div className="lg:col-span-5 industrial-panel p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Explainable AI (Feature Importance)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Model-derived relative attribution driving production prediction
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {data.top_factors.map((f, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{f.display_name}</span>
                      <span className="font-mono text-amber-400 font-bold">+{f.importance_pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-flame-500 rounded-full"
                        style={{ width: `${Math.min(f.importance_pct * 2.5, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 leading-relaxed font-mono">
                ℹ️ Note: Attributions represent model-derived statistical feature importances from random forest trees, not direct causal proofs.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
