export type Phase = 'R' | 'Y' | 'B';

export type Status = 'NORMAL' | 'WARNING' | 'FAULT';

export type Trend = 'rising' | 'falling' | 'stable';

export type Severity = 'WARNING' | 'HIGH' | 'CRITICAL';

export interface RawTelemetryInput {
  vR: number;
  vY: number;
  vB: number;
  iR: number;
  iY: number;
  iB: number;
  frequency: number;
  temperature: number;
  vibration: number;
  powerFactor: number;
}

export interface PhaseReading {
  phase: Phase;
  voltage: number;        // Volts (V)
  current: number;        // Amperes (A)
  power: number;          // Real power (kW)
  apparentPower: number;  // (kVA)
  powerFactor: number;
  status: Status;
  trend: Trend;
  voltageTrend: Trend;
  currentTrend: Trend;
  reason?: string;
}

export interface LineVoltages {
  vRY: number; // Volts (V)
  vYB: number; // Volts (V)
  vBR: number; // Volts (V)
}

export interface MotorMetrics {
  frequency: number;          // Hz
  temperature: number;        // °C
  vibration: number;          // mm/s RMS
  overallPowerFactor: number; // PF (0.00 - 1.00)
  totalRealPower: number;     // kW
  totalApparentPower: number; // kVA
  totalReactivePower: number; // kVAR
  lineVoltages: LineVoltages;
  voltageImbalance: number;   // %
  currentImbalance: number;   // %
  motorStatus: Status;
  healthScore: number;        // 0 - 100
  activeFaultCount: number;
  activeWarningCount: number;
}

export interface TelemetryState {
  timestamp: string;
  timeFormatted: string;
  phases: {
    R: PhaseReading;
    Y: PhaseReading;
    B: PhaseReading;
  };
  motor: MotorMetrics;
}

export interface ThresholdConfig {
  voltage: {
    normalMin: number;      // 207 V
    normalMax: number;      // 253 V
    warningLowMin: number;  // 200 V
    warningHighMax: number; // 260 V
    faultLow: number;       // < 200 V
    faultHigh: number;      // > 260 V
    phaseLossCutoff: number;// < 50 V
  };
  lineVoltage: {
    nominal: number;        // 415 V
    normalMin: number;      // 374 V
    normalMax: number;      // 456 V
    warningLowMin: number;  // 360 V
    warningHighMax: number; // 470 V
  };
  current: {
    nominal: number;        // 5.0 A
    normalMax: number;      // 5.0 A
    warningMax: number;     // 6.0 A
    faultMax: number;       // > 6.0 A
  };
  frequency: {
    nominal: number;        // 50.0 Hz
    normalMin: number;      // 49.5 Hz
    normalMax: number;      // 50.5 Hz
    warningLowMin: number;  // 49.0 Hz
    warningHighMax: number; // 51.0 Hz
  };
  temperature: {
    normalMax: number;      // 60 °C
    warningMax: number;     // 70 °C
  };
  vibration: {
    normalMax: number;      // 2.8 mm/s
    warningMax: number;     // 4.5 mm/s
  };
  voltageImbalance: {
    normalMax: number;      // 2.0 %
    warningMax: number;     // 3.0 %
  };
  currentImbalance: {
    normalMax: number;      // 10.0 %
    warningMax: number;     // 20.0 %
  };
}

export interface FaultEvent {
  id: string;
  timestamp: string;
  faultName: string;
  affectedPhase: string;
  severity: Severity;
  measuredValue: string;
  thresholdReason: string;
  recommendedAction: string;
  status: 'ACTIVE' | 'RESOLVED';
  acknowledged: boolean;
  resolvedAt?: string;
}

export type ScenarioType =
  | 'normal'
  | 'overvoltage'
  | 'undervoltage'
  | 'overcurrent'
  | 'phase_imbalance'
  | 'phase_loss'
  | 'overtemperature'
  | 'excessive_vibration'
  | 'abnormal_frequency'
  | 'multiple_faults'
  | 'custom';

export interface ScenarioDefinition {
  id: ScenarioType;
  name: string;
  description: string;
  badge: string;
  category: 'Normal' | 'Electrical' | 'Mechanical' | 'Complex';
  values: RawTelemetryInput;
}

export interface HistoricalDataPoint {
  timestamp: string;
  timeLabel: string;
  vR: number;
  vY: number;
  vB: number;
  iR: number;
  iY: number;
  iB: number;
  pR: number;
  pY: number;
  pB: number;
  pTotal: number;
  temperature: number;
  vibration: number;
  frequency: number;
  vImbalance: number;
  iImbalance: number;
}

export type TimeFilter = '1H' | '6H' | '12H' | '24H';
