# Three-Phase Agricultural Motor Health Monitoring Dashboard

A responsive frontend application and telemetry simulation suite for **Three-Phase Agricultural Induction Motor Health Monitoring**. 

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Recharts**.

> **Note:** This system operates completely client-side in **DEMO MODE with SIMULATED DATA**. It does not require any external backend or API keys, nor does it interface directly with the single-phase hardware prototype.

---

## ⚡ Key Features

1. **Top Navigation & Overall Health Score**
   - Title: **Three-Phase Agricultural Motor Health Monitoring**
   - Subtitle: *Real-time-style monitoring and simulated fault detection*
   - Persistent Badge: `SIMULATED DATA · DEMO MODE`
   - Dynamic Motor Health Index (0–100 score) with real-time health grading.
   - Overall Motor Status (`NORMAL`, `WARNING`, or `FAULT`).
   - Active critical fault and warning counters.
   - Live system clock and simulation heartbeat indicator.

2. **Three-Phase Telemetry Cards (R, Y, B)**
   - **Phase R:** Red accent (`#ef4444`)
   - **Phase Y:** Yellow accent (`#eab308`)
   - **Phase B:** Blue accent (`#3b82f6`)
   - Displays Phase-to-Neutral Voltage ($V$), Phase Current ($A$), Estimated Real Power ($kW = \frac{V \times I \times PF}{1000}$), Apparent Power ($kVA$), and dynamic trend indicators (Rising, Falling, Stable).

3. **Shared Motor-Level Health Metrics**
   - **Supply Frequency:** 50.0 Hz nominal with deviation monitor.
   - **Stator Casing Temperature:** Motor-wide surface measurement with thermal gauge ($<60^\circ\text{C}$ normal, $60\text{--}70^\circ\text{C}$ warning, $>70^\circ\text{C}$ fault).
   - **RMS Vibration Velocity:** ISO 10816 mechanical severity indicator ($<2.8\text{ mm/s}$ normal, $2.8\text{--}4.5\text{ mm/s}$ warning, $>4.5\text{ mm/s}$ fault).
   - **Overall Power Factor:** $\cos \varphi$ with inductive lagging state.
   - **Total 3-Phase Power:** Real ($kW$), Apparent ($kVA$), and Reactive ($kVAR$).
   - **Line-to-Line Voltages:** $V_{RY}$, $V_{YB}$, $V_{BR}$ calculated using standard $120^\circ$ vector displacement ($415\text{ V}$ nominal).
   - **NEMA Imbalance Indices:** IEEE 112 / NEMA standard calculation ($\frac{\max |X - X_{avg}|}{X_{avg}} \times 100\%$) for both Voltage Imbalance ($<2\%$ normal) and Current Imbalance ($<10\%$ normal).

4. **Live Interactive Charts (Recharts)**
   - Phase Voltage Trend (R, Y, B lines with threshold limits).
   - Phase Current Trend (R, Y, B lines with $5\text{ A}$ and $6\text{ A}$ limit lines).
   - Real Power Distribution ($kW$ per phase and total $kW$ area fill).
   - Voltage & Current Imbalance Trend (NEMA bounds).
   - Stator Temperature Trend ($60^\circ\text{C}$ warning, $70^\circ\text{C}$ fault lines).
   - RMS Vibration Velocity Trend ($2.8\text{ mm/s}$ and $4.5\text{ mm/s}$ lines).
   - Grid Frequency Trend ($49.5\text{--}50.5\text{ Hz}$ normal band).
   - Time window filters: `1H`, `6H`, `12H`, `24H`.

5. **10 Deterministic Fault Injection Scenarios**
   - `Normal Healthy Operation` (Baseline 230 V, 4.2 A, 50 Hz, 42 °C, 2.2 mm/s)
   - `Overvoltage` (Phase R voltage spike to 272 V)
   - `Undervoltage` (Phase Y sag to 186 V)
   - `Overcurrent & Overload` (Mechanical load forces current to 6.8 A)
   - `Phase Unbalance` (Unequal single-phase tapping causes $>8\%$ V-imbalance & $>25\%$ I-imbalance)
   - `Phase Loss (Single-Phasing)` (Phase B fuse blow at 8.5 V, heavy current pull on R & Y)
   - `Motor Overtemperature` (Stator casing rises to 78.5 °C)
   - `Excessive Vibration` (Bearing degradation / misalignment induces 5.4 mm/s RMS)
   - `Abnormal Grid Frequency` (Supply frequency sags to 48.3 Hz)
   - `Multiple Cascading Faults` (Emergency multi-fault injection)
   - `Interactive Manual Sliders` (Drag-and-drop tuning of all parameters)

6. **Diagnostic Event Ledger & Fault Log**
   - Timestamp, Fault Name, Affected Phase/Component, Measured Value, Severity (`CRITICAL`, `HIGH`, `WARNING`), Operator Action Protocol, and Live Status (`ACTIVE` or `RESOLVED`).
   - Search by keyword or fault type.
   - Filter by Severity, Component/Phase, and Status.
   - Sort by timestamp (newest/oldest).
   - `Acknowledge All` and `Clear Resolved` actions.
   - `Export CSV` report generation.

7. **Configurable Demonstration Thresholds Modal**
   - Editable setpoints across all parameters.
   - Demonstration disclaimer and `Reset Demonstration Defaults` option.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; developed and tested on Node v24)
- npm (v9 or higher)

### Installation
Dependencies are already installed. If running on a fresh environment:
```bash
npm install
```

### Running Locally
To start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### Production Build
To validate TypeScript types and generate the production bundle:
```bash
npm run build
```

---

## 📁 Project Architecture

```
dashboard/
├── index.html                   # HTML entry point with Inter & JetBrains Mono fonts
├── vite.config.ts               # Vite configuration with React & Tailwind CSS v4
├── package.json                 # Project dependencies & scripts
├── src/
│   ├── main.tsx                 # React DOM root entry
│   ├── App.tsx                  # Main application state and simulation loop
│   ├── index.css                # Dark theme tokens and Tailwind CSS v4 directives
│   ├── types/
│   │   └── index.ts             # TypeScript definitions (Telemetry, Thresholds, Faults, History)
│   ├── config/
│   │   └── thresholds.ts        # Demonstration threshold configurations & disclaimers
│   ├── services/
│   │   ├── faultEngine.ts       # 10-fault detection engine with persistence and health scoring
│   │   └── simulationEngine.ts  # Scenario presets, noise injector, and line voltage calculations
│   └── components/
│       ├── Header.tsx           # Navigation bar, persistent badge, health score, status badge
│       ├── PhaseCard.tsx        # Phase R, Y, B telemetry cards (red, yellow, blue accents)
│       ├── MotorMetrics.tsx     # Frequency, temperature, vibration, total kW, line voltages
│       ├── SimulationControls.tsx # 10 Scenario triggers, cycle rate, reset, and manual sliders
│       ├── EventLog.tsx         # Searchable, filterable event ledger with CSV export
│       ├── ThresholdSettingsModal.tsx # Configurable threshold editor modal
│       └── Charts/
│           └── AnalyticsSection.tsx   # 7 interactive Recharts waveforms with threshold lines
```
