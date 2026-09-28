import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  Activity, 
  Flame, 
  Droplet, 
  Cpu, 
  Thermometer, 
  Gauge,
  Sliders
} from 'lucide-react';

interface Props {
  wellId: string;
}

export const ReplayPage: React.FC<Props> = ({ wellId }) => {
  const [windowTime, setWindowTime] = useState<'1h' | '6h' | '24h'>('6h');
  const [replayData, setReplayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setIsPlaying(false);
    setFrameIdx(0);
    api.getReplay(wellId, windowTime).then(res => {
      if (isMounted) {
        setReplayData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Replay load error:', err);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [wellId, windowTime]);

  // Automated playback loop
  useEffect(() => {
    if (!isPlaying || !replayData?.telemetry_frames) return;
    const intervalTime = 1200 / playbackSpeed;
    const timer = setInterval(() => {
      setFrameIdx(prev => {
        if (prev >= replayData.telemetry_frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, replayData, playbackSpeed]);

  if (loading || !replayData) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Buffering Historical Telemetry Stream for Replay...</span>
      </div>
    );
  }

  const frames = replayData.telemetry_frames || [];
  const currentFrame = frames[frameIdx] || frames[0] || {};
  const totalFrames = frames.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Digital Twin Replay — Synchronized Multi-Channel Playback
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-semibold">
              Time-Travel Telemetry Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe interconnected reservoir cooling and sucker rod load dynamics moving together in time
          </p>
        </div>

        {/* Window Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['1h', '6h', '24h'] as const).map(w => (
            <button
              key={w}
              onClick={() => setWindowTime(w)}
              className={`px-3 py-1.5 rounded font-mono font-bold transition-all ${
                windowTime === w
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last {w}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Scrubber & Control Deck */}
      <div className="industrial-panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => setFrameIdx(prev => Math.min(prev + 1, totalFrames - 1))}
              disabled={frameIdx >= totalFrames - 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 border border-slate-700"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Playback Speed Toggles */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              {[1, 2, 5].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    playbackSpeed === spd ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="font-mono text-xs flex items-center gap-3">
            <span className="text-slate-400">TIMESTAMP:</span>
            <span className="text-amber-400 font-bold text-sm bg-slate-950 px-3 py-1 rounded border border-slate-800">
              {currentFrame.timestamp || 'N/A'}
            </span>
            <span className="text-slate-400">
              Frame {frameIdx + 1} of {totalFrames}
            </span>
          </div>
        </div>

        {/* Scrubber Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={frameIdx}
            onChange={(e) => setFrameIdx(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{frames[0]?.timestamp || 'Start'}</span>
            <span>Current Playhead</span>
            <span>{frames[totalFrames - 1]?.timestamp || 'End'}</span>
          </div>
        </div>
      </div>

      {/* Synchronized Telemetry State at Playhead */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Reservoir Temperature */}
        <div className="industrial-panel p-4 space-y-2 border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Thermometer className="w-4 h-4" />
              Reservoir Temp
            </span>
            <span className="font-mono text-[10px] bg-slate-950 px-1 rounded">Heated Plume</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-400">
              {currentFrame.reservoir_temp_c?.toFixed(1) || '85.0'}
            </span>
            <span className="text-xs font-mono text-slate-400">°C</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Viscosity: {currentFrame.oil_viscosity_cp?.toFixed(0) || '120'} cP
          </p>
        </div>

        {/* Heavy Oil Flow */}
        <div className="industrial-panel p-4 space-y-2 border-emerald-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Droplet className="w-4 h-4" />
              Heavy Crude Flow
            </span>
            <span className="font-mono text-[10px] bg-slate-950 px-1 rounded">Discharge</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-emerald-400">
              {currentFrame.oil_production_bpd?.toFixed(1) || '125.0'}
            </span>
            <span className="text-xs font-mono text-slate-400">BPD</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Volumetric Eff: {currentFrame.srp_efficiency_pct?.toFixed(0) || '82'}%
          </p>
        </div>

        {/* SRP Downstroke MPRL */}
        <div className="industrial-panel p-4 space-y-2 border-cyan-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <Cpu className="w-4 h-4" />
              Downstroke Load
            </span>
            <span className="font-mono text-[10px] bg-slate-950 px-1 rounded">MPRL</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-mono font-bold ${
              currentFrame.srp_min_load_lbs < 2400 ? 'text-red-400' : 'text-slate-100'
            }`}>
              {Math.round(currentFrame.srp_min_load_lbs || 3500)}
            </span>
            <span className="text-xs font-mono text-slate-400">lbs</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Peak PPRL: {Math.round(currentFrame.srp_peak_load_lbs || 18500)} lbs
          </p>
        </div>

        {/* Composite Health Score */}
        <div className="industrial-panel p-4 space-y-2 border-purple-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-purple-400 font-medium">
              <Activity className="w-4 h-4" />
              Well Health Score
            </span>
            <span className="font-mono text-[10px] bg-slate-950 px-1 rounded">Composite</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white">
              {currentFrame.health_score?.toFixed(0) || '85'}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Pumping Speed: {currentFrame.srp_spm?.toFixed(1) || '6.0'} SPM
          </p>
        </div>
      </div>

      {/* Physics Insight Callout */}
      <div className="industrial-panel p-4 text-xs text-slate-300 leading-relaxed font-mono flex items-start gap-2.5">
        <span className="text-amber-400 text-sm">💡</span>
        <span>
          <strong>Thermal-Mechanical Replay Coupling: </strong> 
          {replayData.replay_insights?.coupling_summary || 
            "As the reservoir cools over time, crude viscosity rises exponentially, directly decreasing downstroke rod tension."}
        </span>
      </div>
    </div>
  );
};
