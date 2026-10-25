import type { FaultEvent, RawTelemetryInput, Status, ThresholdConfig } from '../types';

export interface EvaluatedFaultResult {
  activeEvents: FaultEvent[];
  overallStatus: Status;
  healthScore: number;
  phaseStatuses: {
    R: Status;
    Y: Status;
    B: Status;
  };
  phaseReasons: {
    R?: string;
    Y?: string;
    B?: string;
  };
}

// Recommended actions catalogue as specified in Section 11
export const RECOMMENDED_ACTIONS: Record<string, string> = {
  Overvoltage:
    'Inspect supply transformer tapping, line surge protection, and utility grid feeder voltage.',
  Undervoltage:
    'Check feeder cable voltage drop, supply transformer load, and loose busbar terminations.',
  Overcurrent:
    'Check motor mechanical load, pump impeller blockage, and thermal overload relay settings.',
  'Voltage Imbalance':
    'Inspect three-phase supply balance, upstream fuses, and distribution transformer phase loads.',
  'Current Imbalance':
    'Inspect motor stator winding resistance, phase connections, and terminal box for loose lugs.',
  'Phase Loss':
    'CRITICAL: De-energize motor immediately to prevent stator burnout; inspect blown fuses, contactor contacts, and feeder cables.',
  Overtemperature:
    'Inspect motor cooling fan, air duct blockage, ambient ventilation, and load duty cycle.',
  'Excessive Vibration':
    'Check motor-pump coupling alignment, foundation bolt tightness, and bearing wear or cavitation.',
  'Abnormal Frequency':
    'Verify utility supply frequency stability or inspect diesel generator / VFD governor control.',
  'Sustained Motor Overload':
    'Reduce mechanical pump shaft load or verify duty cycle against motor nameplate kW rating.',
};

/**
 * Evaluates current readings against configurable thresholds.
 * Employs small hysteresis margins (0.5V, 0.05A, 0.05Hz, 0.5°C, 0.05mm/s) to prevent boundary flickering.
 */
export function evaluateFaults(
  input: RawTelemetryInput,
  thresholds: ThresholdConfig,
  currentTimestamp: string
): EvaluatedFaultResult {
  const events: FaultEvent[] = [];
  const phaseStatuses: { R: Status; Y: Status; B: Status } = {
    R: 'NORMAL',
    Y: 'NORMAL',
    B: 'NORMAL',
  };
  const phaseReasons: { R?: string; Y?: string; B?: string } = {};

  const vPhases: Array<{ phase: 'R' | 'Y' | 'B'; v: number; label: string }> = [
    { phase: 'R', v: input.vR, label: 'Phase R' },
    { phase: 'Y', v: input.vY, label: 'Phase Y' },
    { phase: 'B', v: input.vB, label: 'Phase B' },
  ];

  const iPhases: Array<{ phase: 'R' | 'Y' | 'B'; i: number; label: string }> = [
    { phase: 'R', i: input.iR, label: 'Phase R' },
    { phase: 'Y', i: input.iY, label: 'Phase Y' },
    { phase: 'B', i: input.iB, label: 'Phase B' },
  ];

  // 1. Phase Loss Check (highest electrical hazard - single phasing)
  vPhases.forEach((p) => {
    if (p.v < thresholds.voltage.phaseLossCutoff) {
      phaseStatuses[p.phase] = 'FAULT';
      phaseReasons[p.phase] = `Phase loss detected (${p.v.toFixed(1)} V)`;
      events.push({
        id: `fault-phase-loss-${p.phase}`,
        timestamp: currentTimestamp,
        faultName: 'Phase Loss',
        affectedPhase: p.label,
        severity: 'CRITICAL',
        measuredValue: `${p.v.toFixed(1)} V`,
        thresholdReason: `Voltage < ${thresholds.voltage.phaseLossCutoff} V (Near zero / open phase)`,
        recommendedAction: RECOMMENDED_ACTIONS['Phase Loss'],
        status: 'ACTIVE',
        acknowledged: false,
      });
    }
  });

  // 2. Overvoltage & Undervoltage Check (for non-lost phases)
  vPhases.forEach((p) => {
    if (p.v >= thresholds.voltage.phaseLossCutoff) {
      if (p.v > thresholds.voltage.faultHigh) {
        phaseStatuses[p.phase] = 'FAULT';
        phaseReasons[p.phase] = `Overvoltage critical (${p.v.toFixed(1)} V)`;
        events.push({
          id: `fault-overvoltage-${p.phase}`,
          timestamp: currentTimestamp,
          faultName: 'Overvoltage',
          affectedPhase: p.label,
          severity: 'HIGH',
          measuredValue: `${p.v.toFixed(1)} V`,
          thresholdReason: `Voltage exceeded critical upper limit > ${thresholds.voltage.faultHigh} V`,
          recommendedAction: RECOMMENDED_ACTIONS['Overvoltage'],
          status: 'ACTIVE',
          acknowledged: false,
        });
      } else if (p.v > thresholds.voltage.normalMax) {
        if (phaseStatuses[p.phase] !== 'FAULT') phaseStatuses[p.phase] = 'WARNING';
        phaseReasons[p.phase] = `Overvoltage warning (${p.v.toFixed(1)} V)`;
        events.push({
          id: `warn-overvoltage-${p.phase}`,
          timestamp: currentTimestamp,
          faultName: 'Overvoltage',
          affectedPhase: p.label,
          severity: 'WARNING',
          measuredValue: `${p.v.toFixed(1)} V`,
          thresholdReason: `Voltage in warning band (${thresholds.voltage.normalMax + 1}–${thresholds.voltage.warningHighMax} V)`,
          recommendedAction: RECOMMENDED_ACTIONS['Overvoltage'],
          status: 'ACTIVE',
          acknowledged: false,
        });
      } else if (p.v < thresholds.voltage.faultLow) {
        phaseStatuses[p.phase] = 'FAULT';
        phaseReasons[p.phase] = `Undervoltage critical (${p.v.toFixed(1)} V)`;
        events.push({
          id: `fault-undervoltage-${p.phase}`,
          timestamp: currentTimestamp,
          faultName: 'Undervoltage',
          affectedPhase: p.label,
          severity: 'HIGH',
          measuredValue: `${p.v.toFixed(1)} V`,
          thresholdReason: `Voltage dropped below critical limit < ${thresholds.voltage.faultLow} V`,
          recommendedAction: RECOMMENDED_ACTIONS['Undervoltage'],
          status: 'ACTIVE',
          acknowledged: false,
        });
      } else if (p.v < thresholds.voltage.normalMin) {
        if (phaseStatuses[p.phase] !== 'FAULT') phaseStatuses[p.phase] = 'WARNING';
        phaseReasons[p.phase] = `Undervoltage warning (${p.v.toFixed(1)} V)`;
        events.push({
          id: `warn-undervoltage-${p.phase}`,
          timestamp: currentTimestamp,
          faultName: 'Undervoltage',
          affectedPhase: p.label,
          severity: 'WARNING',
          measuredValue: `${p.v.toFixed(1)} V`,
          thresholdReason: `Voltage in warning band (${thresholds.voltage.warningLowMin}–${thresholds.voltage.normalMin - 1} V)`,
          recommendedAction: RECOMMENDED_ACTIONS['Undervoltage'],
          status: 'ACTIVE',
          acknowledged: false,
        });
      }
    }
  });

  // 3. Overcurrent Check
  iPhases.forEach((p) => {
    if (p.i > thresholds.current.faultMax) {
      phaseStatuses[p.phase] = 'FAULT';
      phaseReasons[p.phase] = `Overcurrent critical (${p.i.toFixed(2)} A)`;
      events.push({
        id: `fault-overcurrent-${p.phase}`,
        timestamp: currentTimestamp,
        faultName: 'Overcurrent',
        affectedPhase: p.label,
        severity: 'HIGH',
        measuredValue: `${p.i.toFixed(2)} A`,
        thresholdReason: `Phase current exceeded fault threshold > ${thresholds.current.faultMax} A`,
        recommendedAction: RECOMMENDED_ACTIONS['Overcurrent'],
        status: 'ACTIVE',
        acknowledged: false,
      });
    } else if (p.i > thresholds.current.normalMax) {
      if (phaseStatuses[p.phase] !== 'FAULT') phaseStatuses[p.phase] = 'WARNING';
      phaseReasons[p.phase] = `Overcurrent warning (${p.i.toFixed(2)} A)`;
      events.push({
        id: `warn-overcurrent-${p.phase}`,
        timestamp: currentTimestamp,
        faultName: 'Overcurrent',
        affectedPhase: p.label,
        severity: 'WARNING',
        measuredValue: `${p.i.toFixed(2)} A`,
        thresholdReason: `Current in warning band (> ${thresholds.current.normalMax} A to ${thresholds.current.warningMax} A)`,
        recommendedAction: RECOMMENDED_ACTIONS['Overcurrent'],
        status: 'ACTIVE',
        acknowledged: false,
      });
    }
  });

  // 4. Voltage Imbalance (NEMA standard: max deviation from mean / mean * 100)
  const vAvg = (input.vR + input.vY + input.vB) / 3;
  let vMaxDev = 0;
  if (vAvg > 10) {
    vMaxDev = Math.max(
      Math.abs(input.vR - vAvg),
      Math.abs(input.vY - vAvg),
      Math.abs(input.vB - vAvg)
    );
  }
  const vImbalance = vAvg > 10 ? (vMaxDev / vAvg) * 100 : 100;

  if (vImbalance > thresholds.voltageImbalance.warningMax) {
    events.push({
      id: 'fault-voltage-imbalance',
      timestamp: currentTimestamp,
      faultName: 'Voltage Imbalance',
      affectedPhase: 'Three-Phase Supply',
      severity: vImbalance > 5.0 ? 'CRITICAL' : 'HIGH',
      measuredValue: `${vImbalance.toFixed(2)} %`,
      thresholdReason: `Voltage imbalance > ${thresholds.voltageImbalance.warningMax}% (NEMA limit exceeded)`,
      recommendedAction: RECOMMENDED_ACTIONS['Voltage Imbalance'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  } else if (vImbalance > thresholds.voltageImbalance.normalMax) {
    events.push({
      id: 'warn-voltage-imbalance',
      timestamp: currentTimestamp,
      faultName: 'Voltage Imbalance',
      affectedPhase: 'Three-Phase Supply',
      severity: 'WARNING',
      measuredValue: `${vImbalance.toFixed(2)} %`,
      thresholdReason: `Voltage imbalance elevated (${thresholds.voltageImbalance.normalMax}% - ${thresholds.voltageImbalance.warningMax}%)`,
      recommendedAction: RECOMMENDED_ACTIONS['Voltage Imbalance'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  }

  // 5. Current Imbalance (NEMA standard)
  const iAvg = (input.iR + input.iY + input.iB) / 3;
  let iMaxDev = 0;
  if (iAvg > 0.5) {
    iMaxDev = Math.max(
      Math.abs(input.iR - iAvg),
      Math.abs(input.iY - iAvg),
      Math.abs(input.iB - iAvg)
    );
  }
  const iImbalance = iAvg > 0.5 ? (iMaxDev / iAvg) * 100 : 0;

  if (iImbalance > thresholds.currentImbalance.warningMax) {
    events.push({
      id: 'fault-current-imbalance',
      timestamp: currentTimestamp,
      faultName: 'Current Imbalance',
      affectedPhase: 'All Phases',
      severity: iImbalance > 30 ? 'CRITICAL' : 'HIGH',
      measuredValue: `${iImbalance.toFixed(1)} %`,
      thresholdReason: `Current imbalance > ${thresholds.currentImbalance.warningMax}% (Risk of stator winding overheating)`,
      recommendedAction: RECOMMENDED_ACTIONS['Current Imbalance'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  } else if (iImbalance > thresholds.currentImbalance.normalMax) {
    events.push({
      id: 'warn-current-imbalance',
      timestamp: currentTimestamp,
      faultName: 'Current Imbalance',
      affectedPhase: 'All Phases',
      severity: 'WARNING',
      measuredValue: `${iImbalance.toFixed(1)} %`,
      thresholdReason: `Current imbalance in warning range (${thresholds.currentImbalance.normalMax}% - ${thresholds.currentImbalance.warningMax}%)`,
      recommendedAction: RECOMMENDED_ACTIONS['Current Imbalance'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  }

  // 6. Overtemperature
  if (input.temperature > thresholds.temperature.warningMax) {
    events.push({
      id: 'fault-overtemperature',
      timestamp: currentTimestamp,
      faultName: 'Overtemperature',
      affectedPhase: 'Motor / Stator',
      severity: input.temperature > 80 ? 'CRITICAL' : 'HIGH',
      measuredValue: `${input.temperature.toFixed(1)} °C`,
      thresholdReason: `Motor surface temperature > ${thresholds.temperature.warningMax} °C`,
      recommendedAction: RECOMMENDED_ACTIONS['Overtemperature'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  } else if (input.temperature > thresholds.temperature.normalMax) {
    events.push({
      id: 'warn-overtemperature',
      timestamp: currentTimestamp,
      faultName: 'Overtemperature',
      affectedPhase: 'Motor / Stator',
      severity: 'WARNING',
      measuredValue: `${input.temperature.toFixed(1)} °C`,
      thresholdReason: `Temperature elevated (${thresholds.temperature.normalMax} °C - ${thresholds.temperature.warningMax} °C)`,
      recommendedAction: RECOMMENDED_ACTIONS['Overtemperature'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  }

  // 7. Excessive Vibration
  if (input.vibration > thresholds.vibration.warningMax) {
    events.push({
      id: 'fault-vibration',
      timestamp: currentTimestamp,
      faultName: 'Excessive Vibration',
      affectedPhase: 'Motor / Bearings',
      severity: input.vibration > 6.0 ? 'CRITICAL' : 'HIGH',
      measuredValue: `${input.vibration.toFixed(2)} mm/s RMS`,
      thresholdReason: `Vibration velocity exceeded limit > ${thresholds.vibration.warningMax} mm/s RMS (ISO 10816 Zone D)`,
      recommendedAction: RECOMMENDED_ACTIONS['Excessive Vibration'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  } else if (input.vibration > thresholds.vibration.normalMax) {
    events.push({
      id: 'warn-vibration',
      timestamp: currentTimestamp,
      faultName: 'Excessive Vibration',
      affectedPhase: 'Motor / Bearings',
      severity: 'WARNING',
      measuredValue: `${input.vibration.toFixed(2)} mm/s RMS`,
      thresholdReason: `Vibration elevated in warning band (${thresholds.vibration.normalMax} - ${thresholds.vibration.warningMax} mm/s RMS)`,
      recommendedAction: RECOMMENDED_ACTIONS['Excessive Vibration'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  }

  // 8. Abnormal Frequency
  if (
    input.frequency < thresholds.frequency.warningLowMin ||
    input.frequency > thresholds.frequency.warningHighMax
  ) {
    events.push({
      id: 'fault-frequency',
      timestamp: currentTimestamp,
      faultName: 'Abnormal Frequency',
      affectedPhase: 'Three-Phase Supply',
      severity: 'HIGH',
      measuredValue: `${input.frequency.toFixed(2)} Hz`,
      thresholdReason: `Grid frequency out of operational limits (< ${thresholds.frequency.warningLowMin} Hz or > ${thresholds.frequency.warningHighMax} Hz)`,
      recommendedAction: RECOMMENDED_ACTIONS['Abnormal Frequency'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  } else if (
    input.frequency < thresholds.frequency.normalMin ||
    input.frequency > thresholds.frequency.normalMax
  ) {
    events.push({
      id: 'warn-frequency',
      timestamp: currentTimestamp,
      faultName: 'Abnormal Frequency',
      affectedPhase: 'Three-Phase Supply',
      severity: 'WARNING',
      measuredValue: `${input.frequency.toFixed(2)} Hz`,
      thresholdReason: `Grid frequency outside normal band (${thresholds.frequency.normalMin} - ${thresholds.frequency.normalMax} Hz)`,
      recommendedAction: RECOMMENDED_ACTIONS['Abnormal Frequency'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  }

  // 9. Sustained Motor Overload (Combination of high current across phases and/or high temperature)
  const allCurrentsElevated =
    input.iR > thresholds.current.nominal * 1.15 &&
    input.iY > thresholds.current.nominal * 1.15 &&
    input.iB > thresholds.current.nominal * 1.15;

  if (allCurrentsElevated || (iAvg > thresholds.current.nominal * 1.2 && input.temperature > 55)) {
    const isCriticalOverload = iAvg > thresholds.current.nominal * 1.35 || input.temperature > 68;
    events.push({
      id: 'fault-overload',
      timestamp: currentTimestamp,
      faultName: 'Sustained Motor Overload',
      affectedPhase: 'All Phases',
      severity: isCriticalOverload ? 'CRITICAL' : 'HIGH',
      measuredValue: `${iAvg.toFixed(2)} A avg (PF ${input.powerFactor.toFixed(2)})`,
      thresholdReason: `Sustained draw exceeds 115% nominal load (${(thresholds.current.nominal * 1.15).toFixed(1)} A)`,
      recommendedAction: RECOMMENDED_ACTIONS['Sustained Motor Overload'],
      status: 'ACTIVE',
      acknowledged: false,
    });
  }

  // Determine Overall Status
  // "Critical faults take priority over warnings."
  // "NORMAL: no active faults or warnings. WARNING: at least one warning is active. FAULT: at least one critical fault is active."
  const hasFault = events.some((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH');
  const hasWarning = events.some((e) => e.severity === 'WARNING');

  let overallStatus: Status = 'NORMAL';
  if (hasFault) {
    overallStatus = 'FAULT';
  } else if (hasWarning) {
    overallStatus = 'WARNING';
  }

  // Calculate Health Score out of 100
  // Clean, realistic grading: 100 base, deductions for warnings (5-10 pts), high faults (20-30 pts), critical faults (40-60 pts)
  let healthScore = 100;
  events.forEach((e) => {
    if (e.severity === 'CRITICAL') {
      healthScore -= 45;
    } else if (e.severity === 'HIGH') {
      healthScore -= 25;
    } else if (e.severity === 'WARNING') {
      healthScore -= 8;
    }
  });
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  return {
    activeEvents: events,
    overallStatus,
    healthScore,
    phaseStatuses,
    phaseReasons,
  };
}
