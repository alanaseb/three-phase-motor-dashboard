import React, { useState } from 'react';
import { Check, Info, RotateCcw, Sliders, X } from 'lucide-react';
import type { ThresholdConfig } from '../types';
import { DEFAULT_THRESHOLDS, THRESHOLD_DISCLAIMER } from '../config/thresholds';

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: ThresholdConfig;
  onSave: (newThresholds: ThresholdConfig) => void;
  onResetDefaults: () => void;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSave,
  onResetDefaults,
}) => {
  const [formValues, setFormValues] = useState<ThresholdConfig>(thresholds);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formValues);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setFormValues(DEFAULT_THRESHOLDS);
    onResetDefaults();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Configurable Demonstration Thresholds
              </h3>
              <p className="text-xs text-slate-400">
                Tune operational setpoints for simulated alert triggers & fault detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
          {/* Engineering Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{THRESHOLD_DISCLAIMER}</span>
          </div>

          {/* Section 1: Phase Voltage & Line Voltage */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1">
              1. Voltage Thresholds (Phase-to-Neutral & Line-to-Line)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Normal Low (V):</label>
                <input
                  type="number"
                  value={formValues.voltage.normalMin}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      voltage: { ...formValues.voltage, normalMin: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Normal High (V):</label>
                <input
                  type="number"
                  value={formValues.voltage.normalMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      voltage: { ...formValues.voltage, normalMax: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Critical Low Fault (V):</label>
                <input
                  type="number"
                  value={formValues.voltage.faultLow}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      voltage: { ...formValues.voltage, faultLow: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Critical High Fault (V):</label>
                <input
                  type="number"
                  value={formValues.voltage.faultHigh}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      voltage: { ...formValues.voltage, faultHigh: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Phase Loss cutoff: &lt; {formValues.voltage.phaseLossCutoff} V (flags single-phasing condition immediately).
            </div>
          </div>

          {/* Section 2: Phase Current */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-yellow-400 border-b border-slate-800 pb-1">
              2. Current Thresholds (Nominal 5.0 A Basis)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Normal Max Current (A):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formValues.current.normalMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      current: { ...formValues.current, normalMax: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Warning Max (A):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formValues.current.warningMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      current: { ...formValues.current, warningMax: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Critical Fault Cutoff (A):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formValues.current.faultMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      current: { ...formValues.current, faultMax: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Temperature & Vibration */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-1">
              3. Thermal & Vibration Setpoints
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Temp Warning (°C):</label>
                <input
                  type="number"
                  value={formValues.temperature.normalMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      temperature: {
                        ...formValues.temperature,
                        normalMax: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Temp Critical Fault (°C):</label>
                <input
                  type="number"
                  value={formValues.temperature.warningMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      temperature: {
                        ...formValues.temperature,
                        warningMax: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Vibration Warn (mm/s):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formValues.vibration.normalMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      vibration: {
                        ...formValues.vibration,
                        normalMax: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Vibration Fault (mm/s):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formValues.vibration.warningMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      vibration: {
                        ...formValues.vibration,
                        warningMax: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Grid Frequency & Imbalance */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-1">
              4. Grid Frequency & Imbalance Thresholds
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Freq Normal Range (Hz):</label>
                <div className="flex gap-1 items-center">
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.frequency.normalMin}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        frequency: {
                          ...formValues.frequency,
                          normalMin: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.frequency.normalMax}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        frequency: {
                          ...formValues.frequency,
                          normalMax: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Freq Critical Fault (Hz):</label>
                <div className="flex gap-1 items-center">
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.frequency.warningLowMin}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        frequency: {
                          ...formValues.frequency,
                          warningLowMin: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono"
                  />
                  <span className="text-slate-500">/</span>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.frequency.warningHighMax}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        frequency: {
                          ...formValues.frequency,
                          warningHighMax: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-red-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Voltage Imb Fault (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={formValues.voltageImbalance.warningMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      voltageImbalance: {
                        ...formValues.voltageImbalance,
                        warningMax: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Current Imb Fault (%):</label>
                <input
                  type="number"
                  step="1"
                  value={formValues.currentImbalance.warningMax}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      currentImbalance: {
                        ...formValues.currentImbalance,
                        warningMax: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              Reset Demonstration Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Saved!
                  </>
                ) : (
                  'Apply Thresholds'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
