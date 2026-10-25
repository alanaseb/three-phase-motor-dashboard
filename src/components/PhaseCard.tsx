import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { PhaseReading, Status, Trend } from '../types';

interface PhaseCardProps {
  reading: PhaseReading;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ reading }) => {
  const { phase, voltage, current, power, apparentPower, powerFactor, status, reason } =
    reading;

  // Phase color theme configurations
  const config = {
    R: {
      name: 'Phase R (Red)',
      sub: 'Phase 1 · 0° Displacement',
      accentColor: 'text-red-400',
      badgeBg: 'bg-red-500/15 text-red-300 border-red-500/40',
      borderGlow: 'hover:border-red-500/50 hover:shadow-red-950/30',
      cardBorder: 'border-red-900/30',
      barColor: 'bg-red-500',
      glow: 'shadow-red-500/10',
      dotColor: 'bg-red-500',
    },
    Y: {
      name: 'Phase Y (Yellow)',
      sub: 'Phase 2 · 120° Displacement',
      accentColor: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
      borderGlow: 'hover:border-yellow-500/50 hover:shadow-yellow-950/30',
      cardBorder: 'border-yellow-900/30',
      barColor: 'bg-yellow-500',
      glow: 'shadow-yellow-500/10',
      dotColor: 'bg-yellow-500',
    },
    B: {
      name: 'Phase B (Blue)',
      sub: 'Phase 3 · 240° Displacement',
      accentColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      borderGlow: 'hover:border-blue-500/50 hover:shadow-blue-950/30',
      cardBorder: 'border-blue-900/30',
      barColor: 'bg-blue-500',
      glow: 'shadow-blue-500/10',
      dotColor: 'bg-blue-500',
    },
  }[phase];

  // Status Styling
  const getStatusBadge = (st: Status) => {
    switch (st) {
      case 'FAULT':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-red-400" />,
          label: 'FAULT',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'WARNING',
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'NORMAL',
        };
    }
  };

  const statusBadge = getStatusBadge(status);

  // Compact Trend pill that cleanly stays inside card boundaries
  const renderTrend = (t: Trend) => {
    if (t === 'rising') {
      return (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 whitespace-nowrap"
          title="Trend: Rising"
        >
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>Rise</span>
        </span>
      );
    }
    if (t === 'falling') {
      return (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0 whitespace-nowrap"
          title="Trend: Falling"
        >
          <TrendingDown className="w-3 h-3 shrink-0" />
          <span>Fall</span>
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 text-slate-400 border border-slate-800 shrink-0 whitespace-nowrap"
        title="Trend: Stable"
      >
        <Minus className="w-3 h-3 shrink-0" />
        <span>Stable</span>
      </span>
    );
  };

  // Percentage calculations against nominal (230 V, 5.0 A)
  const vNominal = 230;
  const iNominal = 5.0;
  const vPercent = Math.min(100, Math.max(0, (voltage / 300) * 100));
  const iPercent = Math.min(100, Math.max(0, (current / 8.0) * 100));

  return (
    <div
      className={`relative bg-slate-900/90 rounded-2xl border ${config.cardBorder} p-5 shadow-xl transition-all duration-300 ${config.borderGlow} flex flex-col justify-between`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3.5 h-3.5 rounded-full ${config.dotColor} shadow-md ${config.glow}`}
            />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                {config.name}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">{config.sub}</p>
            </div>
          </div>

          {/* Phase Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>
        </div>

        {/* Reason pill if abnormal */}
        {reason && (
          <div className="mb-4 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 font-medium flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{reason}</span>
          </div>
        )}

        {/* 3 Main Metrics Cards (Voltage, Current, Power) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* 1. Voltage */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between overflow-hidden">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate mb-1">
              Voltage (L-N)
            </div>

            <div className="flex items-baseline justify-between gap-1 my-1">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-2xl font-black tracking-tight text-white">
                  {voltage.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-400">V</span>
              </div>
              {renderTrend(reading.voltageTrend)}
            </div>

            {/* Gauge mini bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${
                  voltage < 200 || voltage > 260
                    ? 'bg-red-500'
                    : voltage < 207 || voltage > 253
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${vPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
              <span>Nom: {vNominal}V</span>
              <span>{(voltage - vNominal >= 0 ? '+' : '') + (voltage - vNominal).toFixed(1)}V</span>
            </div>
          </div>

          {/* 2. Current */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between overflow-hidden">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate mb-1">
              Current
            </div>

            <div className="flex items-baseline justify-between gap-1 my-1">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-2xl font-black tracking-tight text-white">
                  {current.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-slate-400">A</span>
              </div>
              {renderTrend(reading.currentTrend)}
            </div>

            {/* Gauge mini bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${
                  current > 6.0
                    ? 'bg-red-500'
                    : current > 5.0
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${iPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
              <span>Rated: {iNominal}A</span>
              <span>{((current / iNominal) * 100).toFixed(0)}% Load</span>
            </div>
          </div>

          {/* 3. Estimated Real Power */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider truncate">Real Power</span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">PF {powerFactor.toFixed(2)}</span>
            </div>

            <div className="flex items-baseline gap-1 my-1 font-mono">
              <span className="text-2xl font-black tracking-tight text-white">
                {power.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-slate-400">kW</span>
            </div>

            {/* Sub metric: Apparent Power */}
            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 mt-auto font-mono">
              <span className="text-slate-500">Apparent:</span>
              <span className="text-slate-200 font-semibold whitespace-nowrap">{apparentPower.toFixed(2)} kVA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono">P = (V × I × PF) / 1000</span>
        <span className="text-slate-400 font-medium">Phase Telemetry Node</span>
      </div>
    </div>
  );
};
