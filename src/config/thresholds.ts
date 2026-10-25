import type { ThresholdConfig } from '../types';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  voltage: {
    normalMin: 207,
    normalMax: 253,
    warningLowMin: 200,
    warningHighMax: 260,
    faultLow: 200,
    faultHigh: 260,
    phaseLossCutoff: 50,
  },
  lineVoltage: {
    nominal: 415,
    normalMin: 374,
    normalMax: 456,
    warningLowMin: 360,
    warningHighMax: 470,
  },
  current: {
    nominal: 5.0,
    normalMax: 5.0,
    warningMax: 6.0,
    faultMax: 6.0,
  },
  frequency: {
    nominal: 50.0,
    normalMin: 49.5,
    normalMax: 50.5,
    warningLowMin: 49.0,
    warningHighMax: 51.0,
  },
  temperature: {
    normalMax: 60.0,
    warningMax: 70.0,
  },
  vibration: {
    normalMax: 2.8,
    warningMax: 4.5,
  },
  voltageImbalance: {
    normalMax: 2.0,
    warningMax: 3.0,
  },
  currentImbalance: {
    normalMax: 10.0,
    warningMax: 20.0,
  },
};

export const THRESHOLD_DISCLAIMER =
  'Configurable Demonstration Thresholds: These values are illustrative setpoints designed for software telemetry testing and educational demonstration. Field deployments must adhere to the motor nameplate specifications (IS/IEC 60034), sensor calibration curves, and local electrical standards.';
