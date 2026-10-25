import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Compass,
  Gauge,
  Info,
  Percent,
  Thermometer,
  Waves,
  Zap,
} from 'lucide-react';
import type { MotorMetrics as IMotorMetrics, ThresholdConfig } from '../types';

interface MotorMetricsProps {
  metrics: IMotorMetrics;
  thresholds: ThresholdConfig;
}

export const MotorMetrics: React.FC<MotorMetricsProps> = ({ metrics, thresholds }) => {
  const {
    frequency,
    temperature,
    vibration,
    overallPowerFactor,
    totalRealPower,
    totalApparentPower,
    totalReactivePower,
    lineVoltages,
    voltageImbalance,
    currentImbalance,
  } = metrics;

  // Temperature status
  const tempStatus =
    temperature > thresholds.temperature.warningMax
      ? 'fault'
      : temperature > thresholds.temperature.normalMax
      ? 'warning'
      : 'normal';

  // Vibration status (ISO 10816 standard)
  const vibStatus =
    vibration > thresholds.vibration.warningMax
      ? 'fault'
      : vibration > thresholds.vibration.normalMax
      ? 'warning'
      : 'normal';

  // Frequency status
  const freqStatus =
    frequency < thresholds.frequency.warningLowMin || frequency > thresholds.frequency.warningHighMax
      ? 'fault'
      : frequency < thresholds.frequency.normalMin || frequency > thresholds.frequency.normalMax
      ? 'warning'
      : 'normal';

  // Voltage Imbalance status
  const vImbStatus =
    voltageImbalance > thresholds.voltageImbalance.warningMax
      ? 'fault'
      : voltageImbalance > thresholds.voltageImbalance.normalMax
      ? 'warning'
      : 'normal';

  // Current Imbalance status
  const iImbStatus =
    currentImbalance > thresholds.currentImbalance.warningMax
      ? 'fault'
      : currentImbalance > thresholds.currentImbalance.normalMax
      ? 'warning'
      : 'normal';

  const getStatusBadge = (status: 'normal' | 'warning' | 'fault') => {
    if (status === 'fault') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800">
          <AlertTriangle className="w-3 h-3" /> FAULT
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
          <AlertTriangle className="w-3 h-3" /> WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
        <CheckCircle2 className="w-3 h-3" /> NORMAL
      </span>
    );
  };

  return (
    <section className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-5 shadow-xl transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            Motor-Level Telemetry & Mechanical Health
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronous measurements from motor frame, bearing housing, and 3-phase aggregate bus
          </p>
        </div>

        {/* Engineering Notice Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Surface & Vibration readings are motor-wide transducers</span>
        </div>
      </div>

      {/* Grid of 6 Core Motor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* 1. Frequency */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Supply Frequency</span>
            </div>
            {getStatusBadge(freqStatus)}
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {frequency.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400">Hz</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
            <span>Nominal: 50.00 Hz</span>
            <span className="text-cyan-400">
              {(frequency - 50.0 >= 0 ? '+' : '') + (frequency - 50.0).toFixed(2)} Hz
            </span>
          </div>
        </div>

        {/* 2. Temperature */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Stator Casing Temp</span>
            </div>
            {getStatusBadge(tempStatus)}
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {temperature.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">°C</span>
          </div>
          {/* Temperature visual bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5 mb-2">
            <div
              className={`h-full transition-all duration-500 ${
                tempStatus === 'fault'
                  ? 'bg-red-500'
                  : tempStatus === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (temperature / 100) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5 font-mono">
            <span>Normal: &lt;60°C</span>
            <span>Warning: 60-70°C</span>
          </div>
        </div>

        {/* 3. Vibration */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">RMS Vibration Velocity</span>
            </div>
            {getStatusBadge(vibStatus)}
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {vibration.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400">mm/s</span>
          </div>
          {/* Vibration mini bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5 mb-2">
            <div
              className={`h-full transition-all duration-500 ${
                vibStatus === 'fault'
                  ? 'bg-red-500'
                  : vibStatus === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (vibration / 7.0) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5 font-mono">
            <span>ISO 10816 Class I</span>
            <span>Limit: 2.8 mm/s</span>
          </div>
        </div>

        {/* 4. Power Factor & Total Power */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Compass className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Overall Power Factor</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/60">
              Lagging (Inductive)
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {overallPowerFactor.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400">cos φ</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
            <span>Target: &ge;0.88</span>
            <span>Eff: ~87.4%</span>
          </div>
        </div>
      </div>

      {/* Second Row: Total Power Aggregation, Line-to-Line Voltages, and Imbalance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total 3-Phase Power */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Total 3-Phase Power
            </span>
            <span className="text-[10px] text-slate-400 font-mono">P_R + P_Y + P_B</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-extrabold font-mono text-white">
              {totalRealPower.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400">kW</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800/70 pt-2 text-slate-400">
            <div>
              <span className="text-slate-400">Apparent: </span>
              <span className="text-slate-200 font-medium">{totalApparentPower.toFixed(2)} kVA</span>
            </div>
            <div>
              <span className="text-slate-400">Reactive: </span>
              <span className="text-slate-200 font-medium">{totalReactivePower.toFixed(2)} kVAR</span>
            </div>
          </div>
        </div>

        {/* Estimated Line-to-Line Voltages */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              Line-to-Line Voltages (V_LL)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Nominal: 415 V</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center my-auto">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] font-semibold text-red-400 mb-0.5">V_RY</div>
              <div className="font-mono text-base font-bold text-white">{lineVoltages.vRY}</div>
              <div className="text-[10px] text-slate-400">V</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] font-semibold text-yellow-400 mb-0.5">V_YB</div>
              <div className="font-mono text-base font-bold text-white">{lineVoltages.vYB}</div>
              <div className="text-[10px] text-slate-400">V</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] font-semibold text-blue-400 mb-0.5">V_BR</div>
              <div className="font-mono text-base font-bold text-white">{lineVoltages.vBR}</div>
              <div className="text-[10px] text-slate-400">V</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800/70 pt-1.5 mt-2 text-center font-mono">
            Derived using 120° vector angle calculation
          </div>
        </div>

        {/* Voltage & Current Imbalance (NEMA standard) */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              NEMA Imbalance Indices
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Max Dev / Avg</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400 font-medium">Voltage Imb</span>
                {getStatusBadge(vImbStatus)}
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {voltageImbalance.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Normal: &lt;2.0%</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400 font-medium">Current Imb</span>
                {getStatusBadge(iImbStatus)}
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {currentImbalance.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Normal: &lt;10.0%</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-800/70 pt-1.5 mt-2 flex justify-between font-mono">
            <span>IEEE 112 Standard</span>
            <span className={vImbStatus === 'fault' || iImbStatus === 'fault' ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {vImbStatus === 'fault' || iImbStatus === 'fault' ? 'Derating Required' : 'Optimal Balance'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
