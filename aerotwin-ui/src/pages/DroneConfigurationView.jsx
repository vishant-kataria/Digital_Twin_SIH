import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Shield,
  Radio,
  Activity,
  AlertTriangle,
  Cpu,
  Thermometer,
  Droplets,
  Zap,
  Gauge,
  Sliders,
  TrendingUp,
  RotateCcw,
  Terminal,
  MapPin,
  Play,
  RotateCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import LinearProgressBar from '../components/ui/LinearProgressBar';
import CircularGauge from '../components/ui/CircularGauge';
import Engine3DView from '../Engine3DView';

const FLEET_LIST = [
  { id: 'TAPAS-01', model: 'Rotax 914 Turbo', mission: 'ISR Patrol', initialHealth: 'nominal', alt: '18,500 ft' },
  { id: 'TAPAS-02', model: 'AE-3007 Piston', mission: 'Border Recon', initialHealth: 'warning', alt: '22,100 ft' },
  { id: 'TAPAS-03', model: 'Rotax 914 Turbo', mission: 'High Altitude Test', initialHealth: 'critical', alt: '12,000 ft' },
  { id: 'TAPAS-04', model: 'AE-3007 Piston', mission: 'Standby - Base', initialHealth: 'nominal', alt: '0 ft' },
];
export default function DroneConfigurationView({ drone, onBack }) {
  const tabParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
  const [selectedDroneId, setSelectedDroneId] = useState(drone?.id || 'TAPAS-01');
  const [activeTab, setActiveTab] = useState(tabParam || '3d'); // '3d', 'trends', 'params', 'config'
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));
  const [selectedTrendMetric, setSelectedTrendMetric] = useState('rpm');
  const [trendTimeRange, setTrendTimeRange] = useState('1h');
  const [wsConnected, setWsConnected] = useState(false);

  // Configuration controls state
  const [throttle, setThrottle] = useState(78);
  const [cruiseAltitude, setCruiseAltitude] = useState(18500);
  const [activeFault, setActiveFault] = useState(0); // 0=None, 1=Misfire, 2=Injector, 3=Cooling, 4=Lubrication, 5=Sensor Drift, 6=Instability

  // Real-time telemetry state
  const [telemetry, setTelemetry] = useState({
    rpm: 2840,
    cht: 162.0,
    egt: 718.0,
    oilPress: 3.8,
    oilTemp: 78.0,
    fuelFlow: 18.4,
    vibration: 2.1,
    batteryVoltage: 27.6,
    injectionTiming: 12.4,
    altitude: 18500,
    fault_label: 0,
  });

  const [aiAnalytics, setAiAnalytics] = useState({
    rulHours: 125.5,
    confidence: 87.4,
    healthOverall: 92,
    combustionStability: 96,
    lubricationScore: 94,
    coolingScore: 91,
    electricalScore: 97,
    anomalyMessage: 'Cyl 4 Temp Delta exceeds baseline. Probable partial coolant blockage.',
    severity: 'warning',
  });

  const [telemetryHistory, setTelemetryHistory] = useState(() => {
    // Pre-populate with realistic initial history
    const initial = [];
    const baseTime = Date.now() - 30 * 1000;
    for (let i = 0; i < 30; i++) {
      const t = new Date(baseTime + i * 1000).toLocaleTimeString('en-GB', { hour12: false });
      initial.push({
        time: t,
        rpm: 2820 + Math.sin(i * 0.3) * 40,
        cht: 160 + Math.sin(i * 0.2) * 4,
        egt: 715 + Math.cos(i * 0.25) * 8,
        oilPress: 3.8 + (Math.random() - 0.5) * 0.1,
        oilTemp: 78 + Math.sin(i * 0.1) * 1.5,
        fuelFlow: 18.4 + (Math.random() - 0.5) * 0.4,
        vibration: 2.1 + (Math.random() - 0.5) * 0.1,
      });
    }
    return initial;
  });

  const [eventLogs, setEventLogs] = useState([
    { id: 1, time: '15:16:20', text: 'SYS: Ground Control link established with TAPAS-01', type: 'info' },
    { id: 2, time: '15:16:23', text: 'SEC: End-to-end AES-256 telemetry encryption verified', type: 'info' },
    { id: 3, time: '15:16:25', text: 'DT: Digital twin synchronization baseline nominal', type: 'success' },
    { id: 4, time: '15:16:27', text: 'AI: Degradation trend registered on Cyl 4 CHT sensor', type: 'warning' },
  ]);

  const wsRef = useRef(null);

  // 1. Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. WebSocket & Client Simulation fallback
  useEffect(() => {
    let fallbackInterval = null;

    // Try opening WebSocket to python backend
    try {
      const ws = new WebSocket('ws://localhost:8000');
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setEventLogs((prev) => [
          { id: Date.now(), time: new Date().toLocaleTimeString('en-GB', { hour12: false }), text: 'NET: Connected to Python AI Digital Twin server (ws://localhost:8000)', type: 'success' },
          ...prev.slice(0, 8),
        ]);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
          if (payload.telemetry) {
            setTelemetry((prev) => ({
              ...prev,
              rpm: payload.telemetry.rpm ?? prev.rpm,
              cht: payload.telemetry.cht ?? prev.cht,
              egt: payload.telemetry.egt ?? prev.egt,
              oilPress: payload.telemetry.oilPress ?? prev.oilPress,
              fuelFlow: payload.telemetry.fuelFlow ?? prev.fuelFlow,
              altitude: payload.telemetry.altitude ?? prev.altitude,
              fault_label: payload.ai_analytics?.fault_label ?? prev.fault_label,
            }));

            setTelemetryHistory((prev) => {
              const next = [...prev, { time: timeStr, ...payload.telemetry }];
              return next.slice(-40);
            });
          }

          if (payload.ai_analytics) {
            setAiAnalytics((prev) => ({
              ...prev,
              rulHours: payload.ai_analytics.rul_hours ?? prev.rulHours,
              severity: (payload.ai_analytics.rul_hours < 30 || payload.ai_analytics.fault_label > 0) ? 'critical' : 'warning',
            }));
          }
        } catch (err) {
          console.error('Error parsing telemetry payload', err);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }

    // High-fidelity fallback client simulation when Python server is not streaming
    fallbackInterval = setInterval(() => {
      const nowTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

      setTelemetry((prev) => {
        // Apply degradation physics according to active fault
        let noiseRpm = (Math.random() - 0.5) * 15;
        let noiseCht = (Math.random() - 0.5) * 0.8;
        let noiseEgt = (Math.random() - 0.5) * 3;
        let noiseOilP = (Math.random() - 0.5) * 0.05;
        let noiseOilT = (Math.random() - 0.5) * 0.3;
        let noiseFuel = (Math.random() - 0.5) * 0.15;
        let noiseVib = (Math.random() - 0.5) * 0.05;

        let baseRpm = throttle * 36;
        let baseCht = 130 + throttle * 0.45;
        let baseEgt = 650 + throttle * 0.9;
        let baseOilP = 3.2 + (throttle / 100) * 0.8;
        let baseOilT = 72 + throttle * 0.12;
        let baseFuel = throttle * 0.24;
        let baseVib = 1.8 + throttle * 0.005;

        // Fault injections
        if (activeFault === 1) {
          // Misfire
          baseRpm -= 250;
          baseVib += 1.6;
          baseEgt -= 45;
        } else if (activeFault === 2) {
          // Injector
          baseFuel += 3.2;
          baseEgt += 35;
        } else if (activeFault === 3) {
          // Cooling degradation / Overheating
          baseCht += 48;
          baseOilT += 18;
        } else if (activeFault === 4) {
          // Lubrication issue
          baseOilP = Math.max(1.2, baseOilP - 1.8);
          baseOilT += 22;
          baseVib += 1.4;
        } else if (activeFault === 5) {
          // Sensor drift
          baseCht += 35;
        } else if (activeFault === 6) {
          // Combustion instability
          noiseRpm += (Math.random() > 0.5 ? 120 : -120);
          noiseEgt += (Math.random() > 0.5 ? 35 : -35);
        }

        const newPoint = {
          rpm: Math.max(1500, Math.min(5200, Math.round(baseRpm + noiseRpm))),
          cht: Math.round((baseCht + noiseCht) * 10) / 10,
          egt: Math.round(baseEgt + noiseEgt),
          oilPress: Math.round((baseOilP + noiseOilP) * 100) / 100,
          oilTemp: Math.round((baseOilT + noiseOilT) * 10) / 10,
          fuelFlow: Math.round((baseFuel + noiseFuel) * 10) / 10,
          vibration: Math.round((baseVib + noiseVib) * 10) / 10,
          batteryVoltage: 27.6 + (Math.random() - 0.5) * 0.1,
          injectionTiming: 12.4 + (Math.random() - 0.5) * 0.2,
          altitude: cruiseAltitude,
          fault_label: activeFault,
        };

        setTelemetryHistory((hist) => {
          const updated = [...hist, { time: nowTime, ...newPoint }];
          return updated.slice(-35);
        });

        return newPoint;
      });

      // Update AI analytics dynamically based on fault state
      setAiAnalytics((prev) => {
        if (activeFault === 0) {
          return {
            rulHours: 412.0,
            confidence: 91.2,
            healthOverall: 94,
            combustionStability: 98,
            lubricationScore: 96,
            coolingScore: 95,
            electricalScore: 97,
            anomalyMessage: 'All systems nominal. Digital twin baseline verified within 0.02% variance.',
            severity: 'nominal',
          };
        } else if (activeFault === 3) {
          return {
            rulHours: 125.5,
            confidence: 87.4,
            healthOverall: 72,
            combustionStability: 96,
            lubricationScore: 94,
            coolingScore: 68,
            electricalScore: 97,
            anomalyMessage: 'WARNING: DEGRADATION DETECTED - Cyl 4 Temp Delta exceeds baseline. Probable partial coolant blockage.',
            severity: 'warning',
          };
        } else if (activeFault === 4) {
          return {
            rulHours: 28.4,
            confidence: 93.8,
            healthOverall: 48,
            combustionStability: 90,
            lubricationScore: 42,
            coolingScore: 74,
            electricalScore: 95,
            anomalyMessage: 'CRITICAL: RAPID LUBRICATION DEGRADATION. Oil pressure below minimum flight threshold. Land immediately.',
            severity: 'critical',
          };
        } else {
          return {
            rulHours: 185.0,
            confidence: 84.6,
            healthOverall: 79,
            combustionStability: 75,
            lubricationScore: 88,
            coolingScore: 84,
            electricalScore: 92,
            anomalyMessage: `AI ALERT: Sensor anomaly detected (Fault Type #${activeFault}). Predictive LSTM model evaluating degradation trend.`,
            severity: 'warning',
          };
        }
      });
    }, 1000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [throttle, cruiseAltitude, activeFault]);

  // Handle manual fault injection test
  const triggerFaultInjection = (faultCode) => {
    setActiveFault(faultCode);
    const faultNames = [
      'Cleared to Normal Baseline',
      'Cylinder Misfire Injected',
      'Injector Abnormality Injected',
      'Cooling Degradation Injected (Overheating)',
      'Lubrication Pressure Loss Injected',
      'Sensor Drift Injected',
      'Combustion Instability Injected',
    ];
    setEventLogs((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        text: `TEST: Operator injected fault: ${faultNames[faultCode]}`,
        type: faultCode === 0 ? 'success' : faultCode === 4 ? 'critical' : 'warning',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const currentDroneObj = FLEET_LIST.find((d) => d.id === selectedDroneId) || FLEET_LIST[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#070b14',
        color: '#e2e8f0',
        overflow: 'hidden',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* 1. TOP CONTEXT BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: 'rgba(11, 17, 32, 0.95)',
          borderBottom: '1px solid rgba(30, 58, 102, 0.5)',
          backdropFilter: 'blur(10px)',
          zIndex: 20,
        }}
      >
        {/* Left: Back button & Drone Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            title="Return to Fleet Command Radar"
          >
            <ChevronLeft size={18} /> Back to Fleet
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
              }}
            >
              <Shield size={22} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '1px', margin: 0, color: '#ffffff' }}>
                  {currentDroneObj.id}
                </h1>
                <StatusBadge
                  status={aiAnalytics.severity === 'critical' ? 'critical' : aiAnalytics.severity === 'warning' ? 'warning' : 'nominal'}
                  label={aiAnalytics.severity === 'critical' ? 'CRITICAL' : aiAnalytics.severity === 'warning' ? 'WARNING' : 'OPERATIONAL'}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                <span>Model: <strong style={{ color: '#cbd5e1' }}>{currentDroneObj.model}</strong></span>
                <span>Squadron: <strong style={{ color: '#cbd5e1' }}>DRDO MALE UAV</strong></span>
                <span>Mission: <strong style={{ color: '#38bdf8' }}>{currentDroneObj.mission}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Drone Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Select Asset:</span>
          <select
            value={selectedDroneId}
            onChange={(e) => setSelectedDroneId(e.target.value)}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#f8fafc',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {FLEET_LIST.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} - {d.mission}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Telemetry & Mission Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.5px' }}>MISSION TIME (IST)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8', fontFamily: '"JetBrains Mono", monospace' }}>
              {currentTime}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', letterSpacing: '0.5px' }}>
                DATA LINK: SECURE
              </div>
              <div style={{ fontSize: '0.65rem', color: wsConnected ? '#38bdf8' : '#94a3b8' }}>
                {wsConnected ? 'WebSocket 10Hz (Python AI Active)' : '10Hz Real-Time Simulation Engine'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUB-TABS NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 20px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid rgba(30, 58, 102, 0.3)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: '3d', label: 'Engine 3D Twin & Schematic', icon: RotateCw },
            { id: 'trends', label: 'Parameter Trends & Analytics', icon: TrendingUp },
            { id: 'params', label: 'Full Sensor Matrix', icon: Gauge },
            { id: 'config', label: 'Drone Config & AI Fault Injection', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Alert Banner on Tab Bar */}
        {aiAnalytics.severity !== 'nominal' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '6px',
              background: aiAnalytics.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${aiAnalytics.severity === 'critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              fontSize: '0.72rem',
              color: aiAnalytics.severity === 'critical' ? '#f87171' : '#fbbf24',
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={14} />
            <span>{aiAnalytics.anomalyMessage}</span>
          </div>
        )}
      </div>

      {/* 3. MAIN DASHBOARD CONTENT (3-Column Layout) */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '260px 1fr 310px',
          gap: '12px',
          padding: '12px 20px',
          overflow: 'hidden',
        }}
      >
        {/* LEFT COLUMN: KEY PARAMETERS PANEL */}
        <Card
          title="Key Parameters"
          subtitle="Real-time Engine Sensors"
          icon={Activity}
          style={{ height: '100%', overflowY: 'auto' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* RPM */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>RPM</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                    {telemetry.rpm}
                  </span>
                  <StatusBadge status={telemetry.rpm > 4500 ? 'warning' : 'nominal'} label={telemetry.rpm > 4500 ? 'High' : 'Normal'} />
                </div>
              </div>
              <LinearProgressBar value={telemetry.rpm} max={5500} showLabel={false} showValue={false} height={5} />
            </div>

            {/* Oil Pressure */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Oil Pressure</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Nominal: 3.5 - 5.0 bar</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {telemetry.oilPress.toFixed(2)} bar
                </span>
                <StatusBadge status={telemetry.oilPress < 2.5 ? 'critical' : 'nominal'} />
              </div>
            </div>

            {/* Oil Temp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Oil Temperature</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Nominal: 70 - 95 °C</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {telemetry.oilTemp.toFixed(1)} °C
                </span>
                <StatusBadge status={telemetry.oilTemp > 100 ? 'warning' : 'nominal'} />
              </div>
            </div>

            {/* CHT (Avg) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>CHT (Avg)</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Limit: &lt; 180 °C</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600, color: telemetry.cht > 180 ? '#ef4444' : '#f8fafc' }}>
                  {telemetry.cht.toFixed(1)} °C
                </span>
                <StatusBadge status={telemetry.cht > 190 ? 'critical' : telemetry.cht > 170 ? 'warning' : 'nominal'} />
              </div>
            </div>

            {/* EGT (Avg) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>EGT (Avg)</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Nominal: 650 - 800 °C</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {telemetry.egt.toFixed(0)} °C
                </span>
                <StatusBadge status="nominal" />
              </div>
            </div>

            {/* Fuel Flow */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Fuel Flow</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Nominal: 14 - 24 L/h</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {telemetry.fuelFlow.toFixed(1)} L/h
                </span>
                <StatusBadge status="nominal" />
              </div>
            </div>

            {/* Vibration */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Vibration</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Limit: &lt; 3.0 mm/s</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {telemetry.vibration.toFixed(1)} mm/s
                </span>
                <StatusBadge status={telemetry.vibration > 3.0 ? 'warning' : 'nominal'} />
              </div>
            </div>

            {/* Battery Voltage */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Battery Voltage</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Nominal: 28.0 V</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {telemetry.batteryVoltage.toFixed(1)} V
                </span>
                <StatusBadge status="nominal" />
              </div>
            </div>

            {/* Injection Timing */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Injection Timing</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Nominal: 12.0° BTDC</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {telemetry.injectionTiming.toFixed(1)}° BTDC
                </span>
                <StatusBadge status="nominal" />
              </div>
            </div>
          </div>
        </Card>

        {/* CENTER COLUMN: ACTIVE SUB-TAB VIEWPORT */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* TAB 1: 3D DIGITAL TWIN VIEW */}
          {activeTab === '3d' && (
            <div style={{ flex: 1, position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
              <Engine3DView telemetry={telemetry} />
            </div>
          )}

          {/* TAB 2: PARAMETER TRENDS & RECHARTS */}
          {activeTab === 'trends' && (
            <Card
              title="Parameter Trends"
              subtitle="Historical telemetry streaming & baseline thresholds"
              icon={TrendingUp}
              style={{ flex: 1 }}
              action={
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={selectedTrendMetric}
                    onChange={(e) => setSelectedTrendMetric(e.target.value)}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#f8fafc',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <option value="rpm">RPM (Rotations per Minute)</option>
                    <option value="cht">CHT (°C - Cylinder Head Temp)</option>
                    <option value="egt">EGT (°C - Exhaust Gas Temp)</option>
                    <option value="oilPress">Oil Pressure (bar)</option>
                    <option value="oilTemp">Oil Temperature (°C)</option>
                    <option value="fuelFlow">Fuel Flow (L/h)</option>
                    <option value="vibration">Vibration (mm/s)</option>
                  </select>

                  <div style={{ display: 'flex', background: '#0f172a', borderRadius: '4px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {['Live 10Hz', '1h', '6h', '24h'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTrendTimeRange(range)}
                        style={{
                          background: trendTimeRange === range ? '#0284c7' : 'transparent',
                          color: trendTimeRange === range ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              }
            >
              <div style={{ flex: 1, minHeight: '320px', width: '100%', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0b1120',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedTrendMetric}
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#metricGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* TAB 3: FULL SENSOR MATRIX TABLE */}
          {activeTab === 'params' && (
            <Card title="Sensor Parameters Matrix" subtitle="Complete physical sensor array readings" icon={Gauge} style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>SENSOR</th>
                    <th style={{ padding: '8px' }}>READING</th>
                    <th style={{ padding: '8px' }}>NOMINAL BAND</th>
                    <th style={{ padding: '8px' }}>DEVIATION</th>
                    <th style={{ padding: '8px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Engine RPM', val: `${telemetry.rpm} rpm`, range: '2200 - 4500 rpm', dev: '+0.4%', status: 'nominal' },
                    { name: 'Cylinder Head Temp (Avg)', val: `${telemetry.cht.toFixed(1)} °C`, range: '130 - 170 °C', dev: telemetry.cht > 170 ? '+14.2%' : '+1.1%', status: telemetry.cht > 170 ? 'warning' : 'nominal' },
                    { name: 'Exhaust Gas Temp (Avg)', val: `${telemetry.egt.toFixed(0)} °C`, range: '650 - 780 °C', dev: '+0.8%', status: 'nominal' },
                    { name: 'Oil Pressure', val: `${telemetry.oilPress.toFixed(2)} bar`, range: '3.0 - 5.0 bar', dev: '-2.1%', status: telemetry.oilPress < 2.5 ? 'critical' : 'nominal' },
                    { name: 'Oil Temperature', val: `${telemetry.oilTemp.toFixed(1)} °C`, range: '70 - 95 °C', dev: '+1.5%', status: 'nominal' },
                    { name: 'Fuel Consumption Rate', val: `${telemetry.fuelFlow.toFixed(1)} L/h`, range: '14 - 22 L/h', dev: '+0.0%', status: 'nominal' },
                    { name: 'Engine Vibration Amplitude', val: `${telemetry.vibration.toFixed(1)} mm/s`, range: '1.0 - 2.8 mm/s', dev: '+4.2%', status: telemetry.vibration > 3.0 ? 'warning' : 'nominal' },
                    { name: 'Bus Battery Voltage', val: `${telemetry.batteryVoltage.toFixed(1)} VDC`, range: '27.0 - 29.0 VDC', dev: '-0.1%', status: 'nominal' },
                    { name: 'Fuel Injection Timing', val: `${telemetry.injectionTiming.toFixed(1)}° BTDC`, range: '11.5 - 13.0° BTDC', dev: '+0.2%', status: 'nominal' },
                    { name: 'Flight Altitude', val: `${telemetry.altitude} ft`, range: '10,000 - 25,000 ft', dev: 'Cruise', status: 'nominal' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '8px', fontWeight: 600, color: '#f8fafc' }}>{row.name}</td>
                      <td style={{ padding: '8px', fontFamily: '"JetBrains Mono", monospace', color: '#38bdf8' }}>{row.val}</td>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>{row.range}</td>
                      <td style={{ padding: '8px', fontFamily: '"JetBrains Mono", monospace', color: row.dev.startsWith('-') ? '#f59e0b' : '#34d399' }}>{row.dev}</td>
                      <td style={{ padding: '8px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* TAB 4: DRONE CONFIGURATION & AI FAULT INJECTION */}
          {activeTab === 'config' && (
            <Card title="Drone Configuration & AI Diagnostic Testing" subtitle="Operational settings and SIH thermodynamic fault injection" icon={Sliders} style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Flight Operating Controls */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Flight Operational Envelope
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                        <span>Throttle Position:</span>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', color: '#38bdf8', fontWeight: 700 }}>{throttle}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={throttle}
                        onChange={(e) => setThrottle(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#38bdf8' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                        <span>Cruise Altitude:</span>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', color: '#38bdf8', fontWeight: 700 }}>{cruiseAltitude} ft</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="26000"
                        step="500"
                        value={cruiseAltitude}
                        onChange={(e) => setCruiseAltitude(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#38bdf8' }}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Fault Injection Tool */}
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '0.82rem', color: '#f87171', margin: 0, textTransform: 'uppercase' }}>
                        AI Fault Injection & Verification Sandbox
                      </h4>
                      <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                        Inject real SIH thermodynamic failure profiles to test AI model degradation detection & RUL countdown
                      </p>
                    </div>
                    <button
                      onClick={() => triggerFaultInjection(0)}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Clear All / Reset Baseline
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { code: 1, title: 'Cylinder Misfire', desc: 'Vibration spike & RPM drop' },
                      { code: 2, title: 'Injector Abnormality', desc: 'Fuel flow surge & EGT rise' },
                      { code: 3, title: 'Cooling Degradation', desc: 'CHT & Oil Temp overheat' },
                      { code: 4, title: 'Lubrication Failure', desc: 'Rapid oil press drop' },
                      { code: 5, title: 'Sensor Drift', desc: 'CHT false calibration drift' },
                      { code: 6, title: 'Combustion Instability', desc: 'Harmonic oscillation' },
                    ].map((fault) => (
                      <button
                        key={fault.code}
                        onClick={() => triggerFaultInjection(fault.code)}
                        style={{
                          background: activeFault === fault.code ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                          border: `1px solid ${activeFault === fault.code ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: '6px',
                          padding: '10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: activeFault === fault.code ? '#fca5a5' : '#f8fafc' }}>
                          #{fault.code} {fault.title}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                          {fault.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: AI PREDICTIVE ANALYTICS & HEALTH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowY: 'auto' }}>
          {/* AI Alert Card */}
          <Card
            title="AI Predictive Diagnostics"
            icon={Cpu}
            status={aiAnalytics.severity}
          >
            <div
              style={{
                background: aiAnalytics.severity === 'critical'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : aiAnalytics.severity === 'warning'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${aiAnalytics.severity === 'critical' ? 'rgba(239, 68, 68, 0.4)' : aiAnalytics.severity === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  color: aiAnalytics.severity === 'critical' ? '#ef4444' : aiAnalytics.severity === 'warning' ? '#f59e0b' : '#10b981',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={14} />
                {aiAnalytics.severity === 'critical' ? 'CRITICAL: IMMINENT FAILURE' : aiAnalytics.severity === 'warning' ? 'WARNING: DEGRADATION DETECTED' : 'SYSTEMS NOMINAL'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {aiAnalytics.anomalyMessage}
              </div>
            </div>

            {/* RUL Display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Remaining Useful Life</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: aiAnalytics.rulHours < 50 ? '#ef4444' : '#f59e0b', fontFamily: '"JetBrains Mono", monospace' }}>
                  {aiAnalytics.rulHours.toFixed(1)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>H</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>AI Confidence: {aiAnalytics.confidence}%</div>
              </div>
              <CircularGauge value={aiAnalytics.rulHours} max={500} size={76} strokeWidth={6} showStatusDot={false} label="" unit="h" />
            </div>

            {/* System Health Scores */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                Subsystem Health Indicators
              </div>
              <LinearProgressBar label="Combustion Stability" value={aiAnalytics.combustionStability} color={aiAnalytics.combustionStability > 85 ? 'green' : 'amber'} />
              <LinearProgressBar label="Lubrication System" value={aiAnalytics.lubricationScore} color={aiAnalytics.lubricationScore > 80 ? 'cyan' : 'red'} />
              <LinearProgressBar label="Cooling System" value={aiAnalytics.coolingScore} color={aiAnalytics.coolingScore > 80 ? 'green' : 'amber'} />
              <LinearProgressBar label="Electrical System" value={aiAnalytics.electricalScore} color="cyan" />
            </div>
          </Card>

          {/* Mini Real-Time Diagnostic Sparkline */}
          <Card title="Live Diagnostic Stream" subtitle="CHT & EGT thermal correlation" icon={TrendingUp} style={{ minHeight: '140px' }}>
            <div style={{ width: '100%', height: '80px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory.slice(-20)}>
                  <Line type="monotone" dataKey="cht" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="egt" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
              <span style={{ color: '#38bdf8' }}>● CHT: {telemetry.cht.toFixed(1)}°C</span>
              <span style={{ color: '#f59e0b' }}>● EGT: {telemetry.egt.toFixed(0)}°C</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. BOTTOM TACTICAL OVERLAY & SECURE AI EVENT LOG */}
      <footer
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(11, 17, 32, 0.95)',
          borderTop: '1px solid rgba(30, 58, 102, 0.5)',
          maxHeight: '110px',
          padding: '8px 20px',
          gap: '16px',
          zIndex: 10,
        }}
      >
        {/* Tactical Mission Overlay */}
        <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <MapPin size={13} color="#38bdf8" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase' }}>
              Mission Tactical Overlay
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.7rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '4px 6px', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8', display: 'block' }}>ALTITUDE</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#38bdf8' }}>
                {telemetry.altitude.toLocaleString()} FT
              </span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '4px 6px', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8', display: 'block' }}>AIRSPEED</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#f8fafc' }}>
                142 KTS
              </span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '4px 6px', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8', display: 'block' }}>FUEL REMAINING</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#34d399' }}>
                68%
              </span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '4px 6px', borderRadius: '4px' }}>
              <span style={{ color: '#94a3b8', display: 'block' }}>COORDINATES</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: '#cbd5e1' }}>
                23.41°N, 72.56°E
              </span>
            </div>
          </div>
        </div>

        {/* Secure AI Event Log */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Terminal size={13} color="#10b981" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase' }}>
              Secure AI Event Log
            </span>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.65rem',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {eventLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: '#38bdf8' }}>[{log.time}]</span>
                <span
                  style={{
                    color: log.type === 'critical' ? '#ef4444' : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#34d399' : '#cbd5e1',
                  }}
                >
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
