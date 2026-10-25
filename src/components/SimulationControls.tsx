import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Gauge,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Waves,
  Zap,
} from 'lucide-react';
import type { RawTelemetryInput, ScenarioType } from '../types';
import { SCENARIO_DEFINITIONS } from '../services/simulationEngine';

interface SimulationControlsProps {
  currentScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  simulationIntervalMs: number;
  onChangeInterval: (ms: number) => void;
  rawInputs: RawTelemetryInput;
  onUpdateManualInputs: (inputs: Partial<RawTelemetryInput>) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  currentScenario,
  onSelectScenario,
  isRunning,
  onToggleRun,
  onReset,
  simulationIntervalMs,
  onChangeInterval,
  rawInputs,
  onUpdateManualInputs,
}) => {
  const [showManualTuning, setShowManualTuning] = useState(false);

  // Group scenarios
  const scenariosList = Object.values(SCENARIO_DEFINITIONS);

  const getScenarioIcon = (id: ScenarioType) => {
    switch (id) {
      case 'normal':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'overvoltage':
        return <Zap className="w-4 h-4 text-red-400" />;
      case 'undervoltage':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'overcurrent':
        return <Activity className="w-4 h-4 text-orange-400" />;
      case 'phase_imbalance':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'phase_loss':
        return <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'overtemperature':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'excessive_vibration':
        return <Gauge className="w-4 h-4 text-indigo-400" />;
      case 'abnormal_frequency':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'multiple_faults':
        return <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />;
      default:
        return <Sliders className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <section className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-5 shadow-xl transition-all">
      {/* Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Simulation Control Deck & Fault Injection Scenarios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Trigger deterministic physical fault scenarios to demonstrate automatic threshold detection and operator recommendations
          </p>
        </div>

        {/* Global Play, Pause, Speed, Reset Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Speed Selector */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2">Cycle Rate:</span>
            {[
              { label: '1s', ms: 1000 },
              { label: '2s', ms: 2000 },
              { label: '3s', ms: 3000 },
            ].map((rate) => (
              <button
                key={rate.ms}
                onClick={() => onChangeInterval(rate.ms)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  simulationIntervalMs === rate.ms
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate.label}
              </button>
            ))}
          </div>

          {/* Start / Pause */}
          <button
            onClick={onToggleRun}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Simulation
              </>
            )}
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            title="Reset to Normal Healthy baseline"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* 10 Demonstration Scenarios Grid */}
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Demonstration Fault Presets (Click to Inject)</span>
          <span className="text-slate-500 font-mono text-[11px]">
            Active: <strong className="text-cyan-400">{SCENARIO_DEFINITIONS[currentScenario]?.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {scenariosList
            .filter((s) => s.id !== 'custom')
            .map((s) => {
              const isSelected = currentScenario === s.id;
              const isNormal = s.id === 'normal';
              const isEmergency = s.id === 'multiple_faults' || s.id === 'phase_loss';

              return (
                <button
                  key={s.id}
                  onClick={() => onSelectScenario(s.id)}
                  className={`text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${
                    isSelected
                      ? isNormal
                        ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
                        : isEmergency
                        ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500/30'
                        : 'bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1 rounded-lg bg-slate-900/80 border border-slate-800">
                      {getScenarioIcon(s.id)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isNormal
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isEmergency
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {s.category}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {s.description}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500">Inject Fault</span>
                    <ArrowRight
                      className={`w-3 h-3 transition-transform ${
                        isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Manual Slider Adjustments Drawer / Accordion */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => setShowManualTuning(!showManualTuning)}
          className="w-full px-4 py-3 bg-slate-950/80 hover:bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Interactive Manual Telemetry Sliders (Custom Setpoint Tuning)</span>
            <span className="text-[10px] text-slate-500 font-mono">
              (Drag to test arbitrary threshold boundaries)
            </span>
          </div>
          {showManualTuning ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showManualTuning && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Voltage Sliders */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Phase Voltages (V)
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-red-400">
                    <span>Phase R Voltage:</span>
                    <span>{rawInputs.vR.toFixed(1)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="1"
                    value={rawInputs.vR}
                    onChange={(e) => onUpdateManualInputs({ vR: parseFloat(e.target.value) })}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-yellow-400">
                    <span>Phase Y Voltage:</span>
                    <span>{rawInputs.vY.toFixed(1)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="1"
                    value={rawInputs.vY}
                    onChange={(e) => onUpdateManualInputs({ vY: parseFloat(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-blue-400">
                    <span>Phase B Voltage:</span>
                    <span>{rawInputs.vB.toFixed(1)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="1"
                    value={rawInputs.vB}
                    onChange={(e) => onUpdateManualInputs({ vB: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Current Sliders */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-yellow-400" /> Phase Currents (A)
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-red-400">
                    <span>Phase R Current:</span>
                    <span>{rawInputs.iR.toFixed(2)} A</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rawInputs.iR}
                    onChange={(e) => onUpdateManualInputs({ iR: parseFloat(e.target.value) })}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-yellow-400">
                    <span>Phase Y Current:</span>
                    <span>{rawInputs.iY.toFixed(2)} A</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rawInputs.iY}
                    onChange={(e) => onUpdateManualInputs({ iY: parseFloat(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-blue-400">
                    <span>Phase B Current:</span>
                    <span>{rawInputs.iB.toFixed(2)} A</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rawInputs.iB}
                    onChange={(e) => onUpdateManualInputs({ iB: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Mechanical & Grid Sliders */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Temperature, Vibration & Frequency
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-orange-400">
                    <span>Motor Temperature:</span>
                    <span>{rawInputs.temperature.toFixed(1)} °C</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="0.5"
                    value={rawInputs.temperature}
                    onChange={(e) =>
                      onUpdateManualInputs({ temperature: parseFloat(e.target.value) })
                    }
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-indigo-400">
                    <span>RMS Vibration:</span>
                    <span>{rawInputs.vibration.toFixed(2)} mm/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8.0"
                    step="0.1"
                    value={rawInputs.vibration}
                    onChange={(e) =>
                      onUpdateManualInputs({ vibration: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-cyan-400">
                    <span>Supply Frequency:</span>
                    <span>{rawInputs.frequency.toFixed(2)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="55"
                    step="0.1"
                    value={rawInputs.frequency}
                    onChange={(e) =>
                      onUpdateManualInputs({ frequency: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
