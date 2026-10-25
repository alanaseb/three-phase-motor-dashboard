import type {
  HistoricalDataPoint,
  LineVoltages,
  MotorMetrics,
  PhaseReading,
  RawTelemetryInput,
  ScenarioDefinition,
  ScenarioType,
  TelemetryState,
  Trend,
} from '../types';
import { evaluateFaults } from './faultEngine';
import { DEFAULT_THRESHOLDS } from '../config/thresholds';

export const SCENARIO_DEFINITIONS: Record<ScenarioType, ScenarioDefinition> = {
  normal: {
    id: 'normal',
    name: 'Normal Healthy Operation',
    description: 'Balanced nominal 3-phase grid supply and normal motor loading.',
    badge: 'Healthy',
    category: 'Normal',
    values: {
      vR: 231,
      vY: 229,
      vB: 234,
      iR: 4.2,
      iY: 4.0,
      iB: 4.4,
      frequency: 50.0,
      temperature: 42.0,
      vibration: 2.2,
      powerFactor: 0.9,
    },
  },
  overvoltage: {
    id: 'overvoltage',
    name: 'Overvoltage (Phase R Spike)',
    description: 'Grid feeder tap abnormality drives Phase R voltage to 272 V.',
    badge: 'Fault: Overvoltage',
    category: 'Electrical',
    values: {
      vR: 272,
      vY: 258,
      vB: 245,
      iR: 4.8,
      iY: 4.4,
      iB: 4.3,
      frequency: 50.1,
      temperature: 46.0,
      vibration: 2.3,
      powerFactor: 0.9,
    },
  },
  undervoltage: {
    id: 'undervoltage',
    name: 'Undervoltage (Phase Y Sag)',
    description: 'Long agricultural feeder line drop collapses Phase Y down to 186 V.',
    badge: 'Fault: Undervoltage',
    category: 'Electrical',
    values: {
      vR: 226,
      vY: 186,
      vB: 203,
      iR: 4.5,
      iY: 5.7,
      iB: 4.9,
      frequency: 49.6,
      temperature: 53.0,
      vibration: 2.5,
      powerFactor: 0.88,
    },
  },
  overcurrent: {
    id: 'overcurrent',
    name: 'Overcurrent & Overload',
    description: 'Pump discharge restriction forces motor current past 6.8 A.',
    badge: 'Fault: Overcurrent',
    category: 'Electrical',
    values: {
      vR: 223,
      vY: 221,
      vB: 224,
      iR: 6.8,
      iY: 6.3,
      iB: 6.2,
      frequency: 49.8,
      temperature: 63.5,
      vibration: 3.2,
      powerFactor: 0.83,
    },
  },
  phase_imbalance: {
    id: 'phase_imbalance',
    name: 'Phase Unbalance',
    description: 'Unequal rural single-phase taps create >8% voltage & >25% current unbalance.',
    badge: 'Fault: Imbalance',
    category: 'Electrical',
    values: {
      vR: 254,
      vY: 212,
      vB: 232,
      iR: 5.9,
      iY: 3.5,
      iB: 4.3,
      frequency: 50.0,
      temperature: 57.0,
      vibration: 3.0,
      powerFactor: 0.86,
    },
  },
  phase_loss: {
    id: 'phase_loss',
    name: 'Phase Loss (Single-Phasing)',
    description: 'Phase B fuse blows (8 V). Remaining phases pull heavy destructive current.',
    badge: 'Critical: Phase Loss',
    category: 'Electrical',
    values: {
      vR: 224,
      vY: 222,
      vB: 8.5,
      iR: 7.2,
      iY: 7.0,
      iB: 0.1,
      frequency: 49.9,
      temperature: 67.0,
      vibration: 3.9,
      powerFactor: 0.78,
    },
  },
  overtemperature: {
    id: 'overtemperature',
    name: 'Motor Overtemperature',
    description: 'Cooling fins fouled with dust and high ambient heat pushes stator to 78.5°C.',
    badge: 'Fault: Overtemperature',
    category: 'Mechanical',
    values: {
      vR: 228,
      vY: 226,
      vB: 230,
      iR: 4.9,
      iY: 4.8,
      iB: 5.1,
      frequency: 50.0,
      temperature: 78.5,
      vibration: 2.7,
      powerFactor: 0.89,
    },
  },
  excessive_vibration: {
    id: 'excessive_vibration',
    name: 'Excessive Vibration',
    description: 'Drive end bearing defect/shaft misalignment induces 5.4 mm/s RMS vibration.',
    badge: 'Fault: Vibration',
    category: 'Mechanical',
    values: {
      vR: 230,
      vY: 229,
      vB: 232,
      iR: 4.5,
      iY: 4.3,
      iB: 4.6,
      frequency: 50.0,
      temperature: 49.0,
      vibration: 5.4,
      powerFactor: 0.89,
    },
  },
  abnormal_frequency: {
    id: 'abnormal_frequency',
    name: 'Abnormal Grid Frequency',
    description: 'Rural grid sag or generator overload drives supply frequency to 48.3 Hz.',
    badge: 'Fault: Frequency',
    category: 'Electrical',
    values: {
      vR: 222,
      vY: 221,
      vB: 224,
      iR: 4.6,
      iY: 4.4,
      iB: 4.5,
      frequency: 48.3,
      temperature: 45.0,
      vibration: 2.4,
      powerFactor: 0.89,
    },
  },
  multiple_faults: {
    id: 'multiple_faults',
    name: 'Multiple Cascading Faults',
    description: 'Phase loss on B, Severe Overcurrent on R&Y, Overheating (76°C) and Vibration (4.9 mm/s).',
    badge: 'Emergency: Multi-Fault',
    category: 'Complex',
    values: {
      vR: 268,
      vY: 220,
      vB: 12.0,
      iR: 7.5,
      iY: 7.2,
      iB: 0.1,
      frequency: 48.6,
      temperature: 76.5,
      vibration: 4.9,
      powerFactor: 0.75,
    },
  },
  custom: {
    id: 'custom',
    name: 'Custom Parameter Adjustments',
    description: 'Manual operator tuning using control sliders.',
    badge: 'Manual Control',
    category: 'Complex',
    values: {
      vR: 231,
      vY: 229,
      vB: 234,
      iR: 4.2,
      iY: 4.0,
      iB: 4.4,
      frequency: 50.0,
      temperature: 42.0,
      vibration: 2.2,
      powerFactor: 0.9,
    },
  },
};

/**
 * Calculates Line-to-Line voltages from Phase-to-Neutral voltages.
 * Under standard 120° displacement: V_LL = sqrt(V1^2 + V2^2 + V1*V2)
 */
export function calculateLineVoltages(vR: number, vY: number, vB: number): LineVoltages {
  const calcLL = (v1: number, v2: number) => {
    if (v1 < 10 && v2 < 10) return 0;
    if (v1 < 10) return Math.round(v2 * 10) / 10;
    if (v2 < 10) return Math.round(v1 * 10) / 10;
    const vLL = Math.sqrt(v1 * v1 + v2 * v2 + v1 * v2);
    return Math.round(vLL * 10) / 10;
  };

  return {
    vRY: calcLL(vR, vY),
    vYB: calcLL(vY, vB),
    vBR: calcLL(vB, vR),
  };
}

/**
 * Computes trend comparing current to previous value
 */
export function computeTrend(current: number, previous: number, threshold = 0.1): Trend {
  const diff = current - previous;
  if (Math.abs(diff) < threshold) return 'stable';
  return diff > 0 ? 'rising' : 'falling';
}

/**
 * Builds full telemetry state from raw inputs and previous state
 */
export function buildTelemetryState(
  raw: RawTelemetryInput,
  prevRaw: RawTelemetryInput | null,
  timestamp: string,
  timeFormatted: string
): { telemetry: TelemetryState; activeFaults: ReturnType<typeof evaluateFaults> } {
  // Real Power = (V * I * PF) / 1000 kW
  const pR = Math.round(((raw.vR * raw.iR * raw.powerFactor) / 1000) * 100) / 100;
  const pY = Math.round(((raw.vY * raw.iY * raw.powerFactor) / 1000) * 100) / 100;
  const pB = Math.round(((raw.vB * raw.iB * raw.powerFactor) / 1000) * 100) / 100;
  const totalRealPower = Math.round((pR + pY + pB) * 100) / 100;

  // Apparent Power = (V * I) / 1000 kVA
  const kvaR = (raw.vR * raw.iR) / 1000;
  const kvaY = (raw.vY * raw.iY) / 1000;
  const kvaB = (raw.vB * raw.iB) / 1000;
  const totalApparentPower = Math.round((kvaR + kvaY + kvaB) * 100) / 100;

  // Reactive Power = sqrt(S^2 - P^2)
  const kvar = Math.sqrt(Math.max(0, totalApparentPower ** 2 - totalRealPower ** 2));
  const totalReactivePower = Math.round(kvar * 100) / 100;

  // Imbalances
  const vAvg = (raw.vR + raw.vY + raw.vB) / 3;
  const vMaxDev =
    vAvg > 10
      ? Math.max(Math.abs(raw.vR - vAvg), Math.abs(raw.vY - vAvg), Math.abs(raw.vB - vAvg))
      : 0;
  const voltageImbalance = vAvg > 10 ? Math.round((vMaxDev / vAvg) * 1000) / 10 : 0;

  const iAvg = (raw.iR + raw.iY + raw.iB) / 3;
  const iMaxDev =
    iAvg > 0.5
      ? Math.max(Math.abs(raw.iR - iAvg), Math.abs(raw.iY - iAvg), Math.abs(raw.iB - iAvg))
      : 0;
  const currentImbalance = iAvg > 0.5 ? Math.round((iMaxDev / iAvg) * 1000) / 10 : 0;

  // Trends
  const vTrendR = prevRaw ? computeTrend(raw.vR, prevRaw.vR, 0.2) : 'stable';
  const vTrendY = prevRaw ? computeTrend(raw.vY, prevRaw.vY, 0.2) : 'stable';
  const vTrendB = prevRaw ? computeTrend(raw.vB, prevRaw.vB, 0.2) : 'stable';

  const iTrendR = prevRaw ? computeTrend(raw.iR, prevRaw.iR, 0.05) : 'stable';
  const iTrendY = prevRaw ? computeTrend(raw.iY, prevRaw.iY, 0.05) : 'stable';
  const iTrendB = prevRaw ? computeTrend(raw.iB, prevRaw.iB, 0.05) : 'stable';

  // Evaluate Faults
  const evaluated = evaluateFaults(raw, DEFAULT_THRESHOLDS, timestamp);

  const phaseR: PhaseReading = {
    phase: 'R',
    voltage: Math.round(raw.vR * 10) / 10,
    current: Math.round(raw.iR * 100) / 100,
    power: pR,
    apparentPower: Math.round(kvaR * 100) / 100,
    powerFactor: raw.powerFactor,
    status: evaluated.phaseStatuses.R,
    trend: vTrendR,
    voltageTrend: vTrendR,
    currentTrend: iTrendR,
    reason: evaluated.phaseReasons.R,
  };

  const phaseY: PhaseReading = {
    phase: 'Y',
    voltage: Math.round(raw.vY * 10) / 10,
    current: Math.round(raw.iY * 100) / 100,
    power: pY,
    apparentPower: Math.round(kvaY * 100) / 100,
    powerFactor: raw.powerFactor,
    status: evaluated.phaseStatuses.Y,
    trend: vTrendY,
    voltageTrend: vTrendY,
    currentTrend: iTrendY,
    reason: evaluated.phaseReasons.Y,
  };

  const phaseB: PhaseReading = {
    phase: 'B',
    voltage: Math.round(raw.vB * 10) / 10,
    current: Math.round(raw.iB * 100) / 100,
    power: pB,
    apparentPower: Math.round(kvaB * 100) / 100,
    powerFactor: raw.powerFactor,
    status: evaluated.phaseStatuses.B,
    trend: vTrendB,
    voltageTrend: vTrendB,
    currentTrend: iTrendB,
    reason: evaluated.phaseReasons.B,
  };

  const motorMetrics: MotorMetrics = {
    frequency: Math.round(raw.frequency * 100) / 100,
    temperature: Math.round(raw.temperature * 10) / 10,
    vibration: Math.round(raw.vibration * 100) / 100,
    overallPowerFactor: raw.powerFactor,
    totalRealPower,
    totalApparentPower,
    totalReactivePower,
    lineVoltages: calculateLineVoltages(raw.vR, raw.vY, raw.vB),
    voltageImbalance,
    currentImbalance,
    motorStatus: evaluated.overallStatus,
    healthScore: evaluated.healthScore,
    activeFaultCount: evaluated.activeEvents.filter(
      (e) => e.severity === 'HIGH' || e.severity === 'CRITICAL'
    ).length,
    activeWarningCount: evaluated.activeEvents.filter((e) => e.severity === 'WARNING').length,
  };

  const telemetry: TelemetryState = {
    timestamp,
    timeFormatted,
    phases: {
      R: phaseR,
      Y: phaseY,
      B: phaseB,
    },
    motor: motorMetrics,
  };

  return { telemetry, activeFaults: evaluated };
}

/**
 * Injects gentle realistic micro-jitter for live feel
 */
export function applySensorNoise(target: RawTelemetryInput): RawTelemetryInput {
  const noise = (amplitude: number) => (Math.random() - 0.5) * 2 * amplitude;

  // Don't inject noise on dead phase (<15V)
  const vRNoise = target.vR < 15 ? 0 : noise(0.4);
  const vYNoise = target.vY < 15 ? 0 : noise(0.4);
  const vBNoise = target.vB < 15 ? 0 : noise(0.4);

  const iRNoise = target.iR < 0.2 ? 0 : noise(0.04);
  const iYNoise = target.iY < 0.2 ? 0 : noise(0.04);
  const iBNoise = target.iB < 0.2 ? 0 : noise(0.04);

  return {
    vR: Math.max(0, target.vR + vRNoise),
    vY: Math.max(0, target.vY + vYNoise),
    vB: Math.max(0, target.vB + vBNoise),
    iR: Math.max(0, target.iR + iRNoise),
    iY: Math.max(0, target.iY + iYNoise),
    iB: Math.max(0, target.iB + iBNoise),
    frequency: Math.max(45, Math.min(55, target.frequency + noise(0.02))),
    temperature: Math.max(20, target.temperature + noise(0.1)),
    vibration: Math.max(0.5, target.vibration + noise(0.03)),
    powerFactor: Math.max(0.5, Math.min(1.0, target.powerFactor + noise(0.005))),
  };
}

/**
 * Generates initial 25 historical data points leading up to the current time.
 */
export function generateInitialHistory(targetScenario: ScenarioType = 'normal'): HistoricalDataPoint[] {
  const base = SCENARIO_DEFINITIONS[targetScenario].values;
  const points: HistoricalDataPoint[] = [];
  const now = Date.now();
  const pointCount = 25;
  const stepMs = 3000; // 3 seconds per point

  for (let i = pointCount - 1; i >= 0; i--) {
    const pointTime = new Date(now - i * stepMs);
    const timeLabel = pointTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Slight drift for realistic history curves
    const drift = Math.sin(i * 0.4) * 0.8;
    const vR = Math.round((base.vR + drift + (Math.random() - 0.5) * 0.6) * 10) / 10;
    const vY = Math.round((base.vY - drift * 0.5 + (Math.random() - 0.5) * 0.6) * 10) / 10;
    const vB = Math.round((base.vB + drift * 0.3 + (Math.random() - 0.5) * 0.6) * 10) / 10;

    const iR = Math.round((base.iR + (Math.random() - 0.5) * 0.08) * 100) / 100;
    const iY = Math.round((base.iY + (Math.random() - 0.5) * 0.08) * 100) / 100;
    const iB = Math.round((base.iB + (Math.random() - 0.5) * 0.08) * 100) / 100;

    const pR = Math.round(((vR * iR * base.powerFactor) / 1000) * 100) / 100;
    const pY = Math.round(((vY * iY * base.powerFactor) / 1000) * 100) / 100;
    const pB = Math.round(((vB * iB * base.powerFactor) / 1000) * 100) / 100;
    const pTotal = Math.round((pR + pY + pB) * 100) / 100;

    const vAvg = (vR + vY + vB) / 3;
    const vMaxDev =
      vAvg > 10 ? Math.max(Math.abs(vR - vAvg), Math.abs(vY - vAvg), Math.abs(vB - vAvg)) : 0;
    const vImbalance = vAvg > 10 ? Math.round((vMaxDev / vAvg) * 1000) / 10 : 0;

    const iAvg = (iR + iY + iB) / 3;
    const iMaxDev =
      iAvg > 0.5 ? Math.max(Math.abs(iR - iAvg), Math.abs(iY - iAvg), Math.abs(iB - iAvg)) : 0;
    const iImbalance = iAvg > 0.5 ? Math.round((iMaxDev / iAvg) * 1000) / 10 : 0;

    points.push({
      timestamp: pointTime.toISOString(),
      timeLabel,
      vR,
      vY,
      vB,
      iR,
      iY,
      iB,
      pR,
      pY,
      pB,
      pTotal,
      temperature: Math.round((base.temperature + Math.sin(i * 0.2) * 0.5) * 10) / 10,
      vibration: Math.round((base.vibration + (Math.random() - 0.5) * 0.1) * 100) / 100,
      frequency: Math.round((base.frequency + (Math.random() - 0.5) * 0.05) * 100) / 100,
      vImbalance,
      iImbalance,
    });
  }

  return points;
}
