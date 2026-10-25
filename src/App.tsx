import { useEffect, useRef, useState } from 'react';
import type {
  FaultEvent,
  HistoricalDataPoint,
  RawTelemetryInput,
  ScenarioType,
  ThresholdConfig,
  TimeFilter,
} from './types';
import { DEFAULT_THRESHOLDS } from './config/thresholds';
import {
  applySensorNoise,
  buildTelemetryState,
  generateInitialHistory,
  SCENARIO_DEFINITIONS,
} from './services/simulationEngine';
import { Header } from './components/Header';
import { PhaseCard } from './components/PhaseCard';
import { MotorMetrics } from './components/MotorMetrics';
import { AnalyticsSection } from './components/Charts/AnalyticsSection';
import { SimulationControls } from './components/SimulationControls';
import { EventLog } from './components/EventLog';
import { ThresholdSettingsModal } from './components/ThresholdSettingsModal';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  // 1. Simulation States
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simulationIntervalMs, setSimulationIntervalMs] = useState<number>(2000);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('normal');
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1H');

  // Raw inputs target based on scenario
  const [rawTarget, setRawTarget] = useState<RawTelemetryInput>(
    SCENARIO_DEFINITIONS.normal.values
  );

  // Current active raw readings (with sensor noise)
  const [currentRaw, setCurrentRaw] = useState<RawTelemetryInput>(
    SCENARIO_DEFINITIONS.normal.values
  );
  const prevRawRef = useRef<RawTelemetryInput | null>(null);

  // 2. Telemetry and Fault History
  const [history, setHistory] = useState<HistoricalDataPoint[]>(() =>
    generateInitialHistory('normal')
  );
  const [events, setEvents] = useState<FaultEvent[]>([]);

  // Telemetry computation
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const currentTimestamp = now.toISOString();

  const { telemetry, activeFaults } = buildTelemetryState(
    currentRaw,
    prevRawRef.current,
    currentTimestamp,
    timeFormatted
  );

  // Sync active evaluated faults into event ledger
  useEffect(() => {
    setEvents((prevEvents) => {
      const nowIso = new Date().toISOString();
      const newActive = activeFaults.activeEvents;
      let updated = [...prevEvents];

      // Mark previously active events that are no longer in active list as RESOLVED
      updated = updated.map((ev) => {
        if (ev.status === 'ACTIVE' && !newActive.some((na) => na.id === ev.id)) {
          return {
            ...ev,
            status: 'RESOLVED',
            resolvedAt: nowIso,
          };
        }
        return ev;
      });

      // Add or update active events
      newActive.forEach((na) => {
        const existingIdx = updated.findIndex((e) => e.id === na.id);
        if (existingIdx >= 0) {
          // If already in ledger, update measured value and preserve acknowledgment
          updated[existingIdx] = {
            ...updated[existingIdx],
            measuredValue: na.measuredValue,
            thresholdReason: na.thresholdReason,
            status: 'ACTIVE',
            resolvedAt: undefined,
          };
        } else {
          // New event detected!
          updated.unshift({
            ...na,
            timestamp: nowIso,
          });
        }
      });

      return updated;
    });
  }, [activeFaults.activeEvents]);

  // Simulation tick loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentRaw((prev: RawTelemetryInput) => {
        prevRawRef.current = prev;
        const noisy = applySensorNoise(rawTarget);

        // Append to history
        const nowTick = new Date();
        const timeLabel = nowTick.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const pR = Math.round(((noisy.vR * noisy.iR * noisy.powerFactor) / 1000) * 100) / 100;
        const pY = Math.round(((noisy.vY * noisy.iY * noisy.powerFactor) / 1000) * 100) / 100;
        const pB = Math.round(((noisy.vB * noisy.iB * noisy.powerFactor) / 1000) * 100) / 100;
        const pTotal = Math.round((pR + pY + pB) * 100) / 100;

        const vAvg = (noisy.vR + noisy.vY + noisy.vB) / 3;
        const vMaxDev =
          vAvg > 10
            ? Math.max(
                Math.abs(noisy.vR - vAvg),
                Math.abs(noisy.vY - vAvg),
                Math.abs(noisy.vB - vAvg)
              )
            : 0;
        const vImbalance = vAvg > 10 ? Math.round((vMaxDev / vAvg) * 1000) / 10 : 0;

        const iAvg = (noisy.iR + noisy.iY + noisy.iB) / 3;
        const iMaxDev =
          iAvg > 0.5
            ? Math.max(
                Math.abs(noisy.iR - iAvg),
                Math.abs(noisy.iY - iAvg),
                Math.abs(noisy.iB - iAvg)
              )
            : 0;
        const iImbalance = iAvg > 0.5 ? Math.round((iMaxDev / iAvg) * 1000) / 10 : 0;

        setHistory((prevHist) => {
          const newPoint: HistoricalDataPoint = {
            timestamp: nowTick.toISOString(),
            timeLabel,
            vR: Math.round(noisy.vR * 10) / 10,
            vY: Math.round(noisy.vY * 10) / 10,
            vB: Math.round(noisy.vB * 10) / 10,
            iR: Math.round(noisy.iR * 100) / 100,
            iY: Math.round(noisy.iY * 100) / 100,
            iB: Math.round(noisy.iB * 100) / 100,
            pR,
            pY,
            pB,
            pTotal,
            temperature: Math.round(noisy.temperature * 10) / 10,
            vibration: Math.round(noisy.vibration * 100) / 100,
            frequency: Math.round(noisy.frequency * 100) / 100,
            vImbalance,
            iImbalance,
          };
          // Keep up to 60 historical points for rich curves
          const updatedHist = [...prevHist, newPoint];
          return updatedHist.slice(-60);
        });

        return noisy;
      });
    }, simulationIntervalMs);

    return () => clearInterval(interval);
  }, [isRunning, simulationIntervalMs, rawTarget]);

  // Scenario selection handler
  const handleSelectScenario = (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    const newValues = SCENARIO_DEFINITIONS[scenario].values;
    setRawTarget(newValues);
    setCurrentRaw(newValues);
  };

  // Reset baseline handler
  const handleReset = () => {
    setCurrentScenario('normal');
    const normalValues = SCENARIO_DEFINITIONS.normal.values;
    setRawTarget(normalValues);
    setCurrentRaw(normalValues);
    setIsRunning(true);
  };

  // Manual input slider updates
  const handleUpdateManualInputs = (inputs: Partial<RawTelemetryInput>) => {
    setCurrentScenario('custom');
    setRawTarget((prev: RawTelemetryInput) => ({ ...prev, ...inputs }));
    setCurrentRaw((prev: RawTelemetryInput) => ({ ...prev, ...inputs }));
  };

  // Event handlers
  const handleAcknowledge = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, acknowledged: true } : e))
    );
  };

  const handleAcknowledgeAll = () => {
    setEvents((prev) => prev.map((e) => ({ ...e, acknowledged: true })));
  };

  const handleClearResolved = () => {
    setEvents((prev) => prev.filter((e) => e.status !== 'RESOLVED'));
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Top Fixed Header with Persistent Badge and Status */}
      <Header
        telemetry={telemetry}
        isRunning={isRunning}
        onToggleRun={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeScenarioName={SCENARIO_DEFINITIONS[currentScenario]?.name || 'Custom'}
      />

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-7">
        {/* Persistent Industrial Notice & Simulation Status Banner */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-200">
                Independent Three-Phase Demonstration Telemetry Engine
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Simulated 3-phase induction pump motor (5.0 A / 415 V nominal). Operates completely locally without hardware coupling or external cloud dependencies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800">
              Tick: {simulationIntervalMs / 1000}s
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800">
              Phase Mode: 3Ø 4-Wire (R-Y-B-N)
            </span>
          </div>
        </div>

        {/* SECTION 1: Three-Phase Monitoring Cards (Red, Yellow, Blue accents) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Three-Phase Synchronous Telemetry (R-Y-B)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Formulas: P = (V × I × PF) / 1000 kW
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <PhaseCard reading={telemetry.phases.R} />
            <PhaseCard reading={telemetry.phases.Y} />
            <PhaseCard reading={telemetry.phases.B} />
          </div>
        </div>

        {/* SECTION 2: Motor-Level Monitoring Metrics */}
        <MotorMetrics metrics={telemetry.motor} thresholds={thresholds} />

        {/* SECTION 3: Simulation Control Deck & Scenarios */}
        <SimulationControls
          currentScenario={currentScenario}
          onSelectScenario={handleSelectScenario}
          isRunning={isRunning}
          onToggleRun={() => setIsRunning(!isRunning)}
          onReset={handleReset}
          simulationIntervalMs={simulationIntervalMs}
          onChangeInterval={setSimulationIntervalMs}
          rawInputs={currentRaw}
          onUpdateManualInputs={handleUpdateManualInputs}
        />

        {/* SECTION 4: Live Responsive Charts & Analytics */}
        <AnalyticsSection
          history={history}
          thresholds={thresholds}
          timeFilter={timeFilter}
          onChangeTimeFilter={setTimeFilter}
        />

        {/* SECTION 5: Fault & Event History Log Table */}
        <EventLog
          events={events}
          onAcknowledge={handleAcknowledge}
          onAcknowledgeAll={handleAcknowledgeAll}
          onClearResolved={handleClearResolved}
        />
      </main>

      {/* Threshold Configuration Modal */}
      <ThresholdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        thresholds={thresholds}
        onSave={(newThresh) => setThresholds(newThresh)}
        onResetDefaults={() => setThresholds(DEFAULT_THRESHOLDS)}
      />

      {/* Industrial Engineering Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">
              Three-Phase Agricultural Motor Health Monitoring Dashboard
            </span>
            <span>—</span>
            <span>Educational & Laboratory Demonstration Version</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <span>IEEE 112 / NEMA MG-1 Standard References</span>
            <span>•</span>
            <span>ISO 10816 Mechanical Vibration Limits</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">Status: 100% Client-Side Simulation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
