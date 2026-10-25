import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  BarChart3,
  Clock,
  Layers,
  LineChart as LineChartIcon,
  Thermometer,
  Waves,
  Zap,
} from 'lucide-react';
import type { HistoricalDataPoint, ThresholdConfig, TimeFilter } from '../../types';

interface AnalyticsSectionProps {
  history: HistoricalDataPoint[];
  thresholds: ThresholdConfig;
  timeFilter: TimeFilter;
  onChangeTimeFilter: (filter: TimeFilter) => void;
}

type ChartTab =
  | 'all'
  | 'voltage'
  | 'current'
  | 'power'
  | 'temperature'
  | 'vibration'
  | 'frequency'
  | 'imbalance';

// Custom dark theme tooltip for Recharts
const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono z-50">
        <div className="text-slate-400 font-semibold mb-1.5 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
          <span>Time:</span>
          <span className="text-slate-200">{label}</span>
        </div>
        <div className="space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: item.color }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-bold text-white">
                {typeof item.value === 'number' ? item.value.toFixed(2) : item.value} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  history,
  thresholds,
  timeFilter,
  onChangeTimeFilter,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('all');

  // Phase color constants
  const COLOR_R = '#ef4444'; // Red
  const COLOR_Y = '#eab308'; // Yellow
  const COLOR_B = '#3b82f6'; // Blue
  const COLOR_TEMP = '#f97316'; // Orange
  const COLOR_VIB = '#8b5cf6'; // Violet
  const COLOR_FREQ = '#06b6d4'; // Cyan
  const COLOR_GRID = '#1e293b';

  return (
    <section className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-5 shadow-xl transition-all">
      {/* Analytics Section Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-cyan-400" />
            Live Telemetry Graphs & Time-Series Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive responsive waveforms with operational threshold boundaries ({history.length} continuous telemetry cycles logged)
          </p>
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Buttons (1H, 6H, 12H, 24H) */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Window:
            </span>
            {(['1H', '6H', '12H', '24H'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => onChangeTimeFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === f
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Chart View Selector Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Overview
            </button>
            <button
              onClick={() => setActiveTab('voltage')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'voltage'
                  ? 'bg-slate-800 text-red-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Voltage
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'current'
                  ? 'bg-slate-800 text-yellow-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveTab('power')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'power'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Power
            </button>
            <button
              onClick={() => setActiveTab('temperature')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'temperature'
                  ? 'bg-slate-800 text-orange-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Temp
            </button>
            <button
              onClick={() => setActiveTab('vibration')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'vibration'
                  ? 'bg-slate-800 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vibration
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'frequency'
                  ? 'bg-slate-800 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Frequency
            </button>
            <button
              onClick={() => setActiveTab('imbalance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'imbalance'
                  ? 'bg-slate-800 text-purple-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Imbalance
            </button>
          </div>
        </div>
      </div>

      {/* Charts Display Grid */}
      <div className="space-y-6">
        {/* ROW 1: Phase Voltage & Phase Current */}
        {(activeTab === 'all' || activeTab === 'voltage' || activeTab === 'current') && (
          <div
            className={`grid gap-5 ${
              activeTab === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* Chart 1: Phase Voltage Trend */}
            {(activeTab === 'all' || activeTab === 'voltage') && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      Phase-to-Neutral Voltage Trend (V_LN)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Phase R (Red), Phase Y (Yellow), Phase B (Blue) · Limits: 200–260 V
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> R
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" /> Y
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> B
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis
                        dataKey="timeLabel"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 300]}
                        stroke="#64748b"
                        fontSize={10}
                        unit="V"
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip unit="V" />} />
                      {/* Operational Reference Lines */}
                      <ReferenceLine
                        y={thresholds.voltage.normalMin}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeOpacity={0.6}
                      />
                      <ReferenceLine
                        y={thresholds.voltage.normalMax}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeOpacity={0.6}
                      />
                      <ReferenceLine
                        y={thresholds.voltage.faultLow}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        strokeOpacity={0.8}
                      />
                      <ReferenceLine
                        y={thresholds.voltage.faultHigh}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        strokeOpacity={0.8}
                      />
                      <Line
                        type="monotone"
                        dataKey="vR"
                        name="Phase R"
                        stroke={COLOR_R}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="vY"
                        name="Phase Y"
                        stroke={COLOR_Y}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="vB"
                        name="Phase B"
                        stroke={COLOR_B}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 2: Phase Current Trend */}
            {(activeTab === 'all' || activeTab === 'current') && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-yellow-400" />
                      Phase Current Trend (I_RMS)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Nominal: 5.0 A · Warning: &gt;5.0 A · Critical: &gt;6.0 A
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> R
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" /> Y
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> B
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis
                        dataKey="timeLabel"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 9]}
                        stroke="#64748b"
                        fontSize={10}
                        unit="A"
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip unit="A" />} />
                      {/* Warning & Fault lines */}
                      <ReferenceLine
                        y={thresholds.current.nominal}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeOpacity={0.6}
                      />
                      <ReferenceLine
                        y={thresholds.current.faultMax}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        strokeOpacity={0.8}
                      />
                      <Line
                        type="monotone"
                        dataKey="iR"
                        name="Phase R"
                        stroke={COLOR_R}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="iY"
                        name="Phase Y"
                        stroke={COLOR_Y}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="iB"
                        name="Phase B"
                        stroke={COLOR_B}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ROW 2: Power Comparison & Imbalance Trend */}
        {(activeTab === 'all' || activeTab === 'power' || activeTab === 'imbalance') && (
          <div
            className={`grid gap-5 ${
              activeTab === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* Chart 3: Phase Power Comparison */}
            {(activeTab === 'all' || activeTab === 'power') && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      Estimated Real Power Distribution (kW)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Per-phase real power output and aggregate total
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                    kW per Phase
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotalPower" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} unit="kW" tickLine={false} />
                      <Tooltip content={<CustomTooltip unit="kW" />} />
                      <Area
                        type="monotone"
                        dataKey="pTotal"
                        name="Total 3-Phase Power"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTotalPower)"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pR"
                        name="Phase R Power"
                        stroke={COLOR_R}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pY"
                        name="Phase Y Power"
                        stroke={COLOR_Y}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pB"
                        name="Phase B Power"
                        stroke={COLOR_B}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 7: Voltage & Current Imbalance Trend */}
            {(activeTab === 'all' || activeTab === 'imbalance') && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-400" />
                      Supply Voltage & Current Imbalance (%)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      V-Imbalance (Limit 2–3%) vs. I-Imbalance (Limit 10–20%)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> V-Imbalance
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-400" /> I-Imbalance
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} unit="%" tickLine={false} />
                      <Tooltip content={<CustomTooltip unit="%" />} />
                      <ReferenceLine
                        y={thresholds.voltageImbalance.warningMax}
                        stroke="#06b6d4"
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                        label={{ value: 'V-Fault 3%', fill: '#06b6d4', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={thresholds.currentImbalance.warningMax}
                        stroke="#a855f7"
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                        label={{ value: 'I-Fault 20%', fill: '#a855f7', fontSize: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="vImbalance"
                        name="Voltage Imbalance"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="iImbalance"
                        name="Current Imbalance"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ROW 3: Temperature, Vibration, Frequency (3 columns) */}
        {(activeTab === 'all' ||
          activeTab === 'temperature' ||
          activeTab === 'vibration' ||
          activeTab === 'frequency') && (
          <div
            className={`grid gap-5 ${
              activeTab === 'all'
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {/* Chart 4: Temperature Trend */}
            {(activeTab === 'all' || activeTab === 'temperature') && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      Temperature Trend
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">Limit: 60°C / 70°C</p>
                  </div>
                  <span className="text-[11px] text-orange-400 font-mono">°C Casing</span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis domain={[20, 90]} stroke="#64748b" fontSize={10} unit="°C" tickLine={false} />
                      <Tooltip content={<CustomTooltip unit="°C" />} />
                      <ReferenceLine
                        y={thresholds.temperature.normalMax}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                      />
                      <ReferenceLine
                        y={thresholds.temperature.warningMax}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        name="Motor Temperature"
                        stroke={COLOR_TEMP}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 5: Vibration Trend */}
            {(activeTab === 'all' || activeTab === 'vibration') && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      RMS Vibration Velocity
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">Limit: 2.8 / 4.5 mm/s</p>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-mono">mm/s RMS</span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 7]} stroke="#64748b" fontSize={10} unit="mm/s" tickLine={false} />
                      <Tooltip content={<CustomTooltip unit="mm/s" />} />
                      <ReferenceLine
                        y={thresholds.vibration.normalMax}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                      />
                      <ReferenceLine
                        y={thresholds.vibration.warningMax}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="vibration"
                        name="Vibration Velocity"
                        stroke={COLOR_VIB}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 6: Frequency Trend */}
            {(activeTab === 'all' || activeTab === 'frequency') && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-cyan-400" />
                      Grid Supply Frequency
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">Band: 49.5–50.5 Hz</p>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">50.00 Hz Nom</span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis domain={[47, 53]} stroke="#64748b" fontSize={10} unit="Hz" tickLine={false} />
                      <Tooltip content={<CustomTooltip unit="Hz" />} />
                      <ReferenceLine
                        y={thresholds.frequency.normalMin}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                      />
                      <ReferenceLine
                        y={thresholds.frequency.normalMax}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                      />
                      <ReferenceLine
                        y={thresholds.frequency.warningLowMin}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                      />
                      <ReferenceLine
                        y={thresholds.frequency.warningHighMax}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="frequency"
                        name="Grid Frequency"
                        stroke={COLOR_FREQ}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
