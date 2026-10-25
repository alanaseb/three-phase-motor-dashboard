import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Pause,
  Play,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import type { Status, TelemetryState } from '../types';

interface HeaderProps {
  telemetry: TelemetryState;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  activeScenarioName: string;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  isRunning,
  onToggleRun,
  onReset,
  onOpenSettings,
  activeScenarioName,
}) => {
  const { motorStatus, healthScore, activeFaultCount, activeWarningCount } = telemetry.motor;

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'FAULT':
        return {
          bg: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-red-500/20',
          dot: 'bg-red-500',
          icon: <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />,
          label: 'CRITICAL FAULT',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20',
          dot: 'bg-amber-400',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: 'SYSTEM WARNING',
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: 'NORMAL OPERATION',
        };
    }
  };

  const statusInfo = getStatusBadge(motorStatus);

  // Health Score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 stroke-emerald-400';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 stroke-amber-400';
    return 'text-red-400 border-red-500/40 stroke-red-400';
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title and Persistent Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-inner group">
            <Cpu className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span
              className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
              title={isRunning ? 'Simulation Running' : 'Simulation Paused'}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Three-Phase Agricultural Motor Health Monitoring
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Real-time-style monitoring and simulated fault detection</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 hidden sm:inline">Scenario: <strong className="text-slate-300 font-medium">{activeScenarioName}</strong></span>
            </p>
          </div>
        </div>

        {/* Right Section: Time, Health Score, Status, Quick Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 lg:gap-5">
          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono tracking-tight text-slate-300">
              {telemetry.timeFormatted || new Date().toLocaleTimeString()}
            </span>
          </div>

          {/* Overall Health Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold text-xs tracking-wide shadow-sm transition-all ${statusInfo.bg}`}
          >
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>

          {/* Motor Health Score Gauge */}
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border ${getHealthScoreColor(
              healthScore
            )}`}
            title={`Overall Motor Health Index: ${healthScore}/100`}
          >
            <Activity className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Health Score
              </span>
              <div className="flex items-baseline gap-1 font-mono leading-none">
                <span className="text-base font-extrabold">{healthScore}</span>
                <span className="text-[10px] text-slate-400">/100</span>
              </div>
            </div>
          </div>

          {/* Fault & Warning Counters */}
          <div className="flex items-center gap-1.5">
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                activeFaultCount > 0
                  ? 'bg-red-950/50 text-red-300 border-red-800/80'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800'
              }`}
              title="Active Critical/High Faults"
            >
              <span className="font-bold text-red-400">{activeFaultCount}</span> Faults
            </div>
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                activeWarningCount > 0
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/80'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800'
              }`}
              title="Active Warnings"
            >
              <span className="font-bold text-amber-400">{activeWarningCount}</span> Warn
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <button
              onClick={onToggleRun}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
                isRunning
                  ? 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700'
                  : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-950/50'
              }`}
              title={isRunning ? 'Pause Simulation (Freeze telemetry)' : 'Resume Simulation'}
            >
              {isRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={onReset}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Reset Simulation to Normal Healthy Baseline"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Configure Demonstration Thresholds"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
