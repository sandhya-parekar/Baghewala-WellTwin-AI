import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { DynacardPoint } from '../types';

interface Props {
  surfaceCard: DynacardPoint[];
  pumpCard?: DynacardPoint[];
  pprl: number;
  mprl: number;
  cardType: string;
}

export const DynacardChart: React.FC<Props> = ({
  surfaceCard,
  pumpCard = [],
  pprl,
  mprl,
  cardType
}) => {
  // Combine surface and pump points by index
  const data = surfaceCard.map((pt, i) => ({
    pos: pt.pos,
    surfaceLoad: pt.load,
    pumpLoad: pumpCard[i]?.load ?? null
  }));

  const isCriticalFloating = mprl < 2200;

  return (
    <div className="industrial-panel p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>SRP Dynamometer Card (Dynacard)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
              cardType === 'CRITICAL' || isCriticalFloating 
                ? 'bg-red-900/60 text-red-300 border border-red-500/40' 
                : cardType === 'WARNING' || cardType === 'ROD_FRICTION'
                ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
            }`}>
              {cardType}
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Polished Rod Load vs Stroke Position (Kinematic Reciprocation)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Surface Card</span>
          </div>
          {pumpCard.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300">Pump Card</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="pos"
              stroke="#64748b"
              fontSize={11}
              unit=" in"
              label={{ value: 'Stroke Displacement (in)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              unit=" lbs"
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              formatter={(value: any, name: any) => [`${Math.round(value)} lbs`, name === 'surfaceLoad' ? 'Surface Load' : 'Pump Load']}
              labelFormatter={(label) => `Displacement: ${label} in`}
            />

            {/* Critical Floating Threshold */}
            <ReferenceLine y={2400} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Rod Floating Limit (2,400 lbs)', fill: '#ef4444', fontSize: 10, position: 'right' }} />
            {/* Max Tensile Yield Line */}
            <ReferenceLine y={21500} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'Peak Tensile Limit (21,500 lbs)', fill: '#eab308', fontSize: 10, position: 'right' }} />

            <Line
              type="monotone"
              dataKey="surfaceLoad"
              name="surfaceLoad"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#f59e0b' }}
              activeDot={{ r: 5 }}
            />

            {pumpCard.length > 0 && (
              <Line
                type="monotone"
                dataKey="pumpLoad"
                name="pumpLoad"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800 text-xs">
        <div className="bg-slate-950 p-2 rounded">
          <span className="text-slate-400 block text-[10px]">Peak Polished Rod Load</span>
          <span className="font-mono text-sm font-bold text-white">{pprl.toLocaleString()} lbs</span>
        </div>
        <div className="bg-slate-950 p-2 rounded">
          <span className="text-slate-400 block text-[10px]">Min Downstroke Load</span>
          <span className={`font-mono text-sm font-bold ${isCriticalFloating ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            {mprl.toLocaleString()} lbs
          </span>
        </div>
        <div className="bg-slate-950 p-2 rounded">
          <span className="text-slate-400 block text-[10px]">Floating Margin</span>
          <span className={`font-mono text-sm font-bold ${mprl < 2400 ? 'text-red-400' : 'text-slate-200'}`}>
            {Math.max(0, Math.round(mprl - 2400))} lbs
          </span>
        </div>
      </div>
    </div>
  );
};
