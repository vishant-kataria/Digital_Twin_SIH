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
  { id: 'TAPAS-01', model: 'Rotax 914 Turbo', mission: 'ISR Patrol Bravo', initialHealth: 'nominal', alt: '18,500 ft' },
  { id: 'TAPAS-04', model: 'Rotax 914 Turbo', mission: 'Tactical Recon', initialHealth: 'nominal', alt: '19,200 ft' },
  { id: 'TAPAS-05', model: 'AE-3007 Piston', mission: 'Western Sector', initialHealth: 'nominal', alt: '17,800 ft' },
  { id: 'TAPAS-06', model: 'Rotax 914 Turbo', mission: 'Coastal Watch', initialHealth: 'nominal', alt: '16,500 ft' },
  { id: 'TAPAS-02', model: 'Rotax 914 Turbo', mission: 'Border Recon', initialHealth: 'warning', alt: '22,100 ft' },
  { id: 'TAPAS-07', model: 'AE-3007 Piston', mission: 'Northern Ridge', initialHealth: 'warning', alt: '21,500 ft' },
  { id: 'TAPAS-03', model: 'Rotax 914 Turbo', mission: 'Emergency Recovery Vector', initialHealth: 'critical', alt: '12,000 ft' },
  { id: 'TAPAS-08', model: 'Rotax 914 Turbo', mission: 'Tarmac Standby Alpha', initialHealth: 'nominal', alt: '0 ft' },
  { id: 'TAPAS-09', model: 'Rotax 914 Turbo', mission: 'Tarmac Standby Bravo', initialHealth: 'nominal', alt: '0 ft' },
  { id: 'TAPAS-10', model: 'AE-3007 Piston', mission: 'Tarmac Standby Charlie', initialHealth: 'nominal', alt: '0 ft' },
  { id: 'TAPAS-11', model: 'Rotax 914 Turbo', mission: 'Tarmac Standby Delta', initialHealth: 'nominal', alt: '0 ft' },
];

export const getDroneProfile = (droneId) => {
  const id = (droneId || '').toUpperCase().trim();
  if (id.includes('03')) {
    // 1 RED DRONE - VERY UNSTABLE / CRITICAL ENGINE DEGRADATION
    return {
      category: 'red',
      severity: 'critical',
      statusLabel: 'CRITICAL',
      mission: 'Emergency Recovery Vector',
      model: 'Rotax 914 Turbo',
      naturalFaultCode: 4, // Lubrication & Thermal Runaway
      altitude: 12000,
      airspeed: 185,
      fuelRemaining: '24%',
      coordinates: '23.41°N, 72.56°E',
      base: {
        rpm: 2420,
        rpmJitter: 120, // Erratic hunting / surging
        cht: 218.4,    // Overheating (> 190°C critical limit)
        chtJitter: 4.5,
        egt: 842.0,    // Critical hot (> 820°C)
        egtJitter: 12.0,
        oilPress: 2.15,// Critical low (< 2.5 bar, nominal 3.5 - 5.0)
        oilPressJitter: 0.12,
        oilTemp: 116.5,// Boiling oil (> 105°C critical)
        oilTempJitter: 2.0,
        fuelFlow: 26.8,// High flow
        fuelFlowJitter: 0.8,
        vibration: 3.85,// Critical mechanical knock (> 3.4 mm/s)
        vibrationJitter: 0.35,
        batteryVoltage: 25.4,
        batteryJitter: 0.15,
        injectionTiming: 14.6,
        timingJitter: 0.3,
      },
      ai: {
        rulHours: 22.4, // Rapid countdown under 30h
        confidence: 93.8,
        healthOverall: 38,
        combustionStability: 58,
        lubricationScore: 24,
        coolingScore: 36,
        electricalScore: 84,
        anomalyMessage: 'CRITICAL ALERT: SEVERE LUBRICATION FAILURE & RUNAWAY CHT. Oil pressure (2.15 bar) below emergency threshold. Bearing knock detected. ADVISORY: LAND IMMEDIATELY.',
      }
    };
  } else if (id.includes('02') || id.includes('07')) {
    // 2 YELLOW DRONES - NORMAL UNSTABLE / WARNING DEGRADATION
    const is07 = id.includes('07');
    return {
      category: 'yellow',
      severity: 'warning',
      statusLabel: 'WARNING',
      mission: is07 ? 'Northern Ridge Surveillance' : 'High Altitude Boundary Test',
      model: is07 ? 'AE-3007 Piston' : 'Rotax 914 Turbo',
      naturalFaultCode: 3, // Cooling / Atmospheric Strain
      altitude: is07 ? 21500 : 22100,
      airspeed: 138,
      fuelRemaining: '62%',
      coordinates: is07 ? '24.12°N, 71.85°E' : '23.95°N, 71.72°E',
      base: {
        rpm: 3040,
        rpmJitter: 45, // Atmospheric draft jitter
        cht: 187.5,    // Elevated (> 180°C limit, warning)
        chtJitter: 2.5,
        egt: 778.0,    // Elevated (760 - 800°C)
        egtJitter: 8.0,
        oilPress: 3.42,// Slightly low / caution
        oilPressJitter: 0.08,
        oilTemp: 96.5, // Warm (95 - 100°C)
        oilTempJitter: 1.2,
        fuelFlow: 21.8,
        fuelFlowJitter: 0.5,
        vibration: 2.85,// Elevated vibration (> 2.7 mm/s)
        vibrationJitter: 0.15,
        batteryVoltage: 27.1,
        batteryJitter: 0.08,
        injectionTiming: 13.2,
        timingJitter: 0.15,
      },
      ai: {
        rulHours: 124.5,
        confidence: 87.4,
        healthOverall: 72,
        combustionStability: 86,
        lubricationScore: 80,
        coolingScore: 65,
        electricalScore: 94,
        anomalyMessage: 'WARNING: Elevated thermal stress at high altitude. Cyl 4 Temp Delta exceeds baseline (+28°C). Partial coolant restriction suspected. Maintain surveillance.',
      }
    };
  } else {
    // GREEN DRONES - STABLE / NOMINAL CRUISE (01, 04, 05, 06, 08, 09, 10, 11)
    const is04 = id.includes('04');
    const is05 = id.includes('05');
    const is06 = id.includes('06');
    const isTarmac = id.includes('08') || id.includes('09') || id.includes('10') || id.includes('11');
    const alt = is04 ? 19200 : is05 ? 17800 : is06 ? 16500 : isTarmac ? 0 : 18500;
    return {
      category: 'green',
      severity: 'nominal',
      statusLabel: 'OPERATIONAL',
      mission: is04 ? 'Tactical Recon' : is05 ? 'Western Sector' : is06 ? 'Coastal Watch' : isTarmac ? 'Airbase Alpha Standby' : 'ISR Patrol Bravo',
      model: is05 || id.includes('10') ? 'AE-3007 Piston' : 'Rotax 914 Turbo',
      naturalFaultCode: 0,
      altitude: alt,
      airspeed: isTarmac ? 0 : 142,
      fuelRemaining: isTarmac ? '100%' : '78%',
      coordinates: '23.85°N, 72.10°E',
      base: {
        rpm: isTarmac ? 0 : 2820,
        rpmJitter: isTarmac ? 0 : 12, // Smooth, stable
        cht: isTarmac ? 36.0 : 156.4, // Nominal cool (< 165°C)
        chtJitter: 0.5,
        egt: isTarmac ? 35.0 : 718.0, // Nominal (650 - 730°C)
        egtJitter: 2.0,
        oilPress: isTarmac ? 0.0 : 4.15, // Nominal (3.5 - 5.0 bar)
        oilPressJitter: 0.05,
        oilTemp: isTarmac ? 32.0 : 78.5, // Nominal (70 - 85°C)
        oilTempJitter: 0.4,
        fuelFlow: isTarmac ? 0.0 : 18.2, // Nominal (14 - 24 L/h)
        fuelFlowJitter: 0.2,
        vibration: isTarmac ? 0.05 : 1.95, // Nominal (< 3.0 mm/s)
        vibrationJitter: 0.08,
        batteryVoltage: 27.8,
        batteryJitter: 0.05,
        injectionTiming: isTarmac ? 0.0 : 12.4, // Nominal 12.0° BTDC
        timingJitter: 0.1,
      },
      ai: {
        rulHours: isTarmac ? 800.0 : 442.0,
        confidence: 91.2,
        healthOverall: 96,
        combustionStability: 98,
        lubricationScore: 97,
        coolingScore: 95,
        electricalScore: 98,
        anomalyMessage: isTarmac ? 'Asset in Ground Standby at Airbase Alpha. Systems verified and ready for scramble.' : 'All systems nominal. Digital twin baseline verified within 0.02% variance. Optimal cruise performance.',
      }
    };
  }
};

export default function DroneConfigurationView({ drone, onBack }) {
  const tabParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
  const initialDroneId = drone?.id || 'TAPAS-01';
  const [selectedDroneId, setSelectedDroneId] = useState(initialDroneId);
  const initialProfile = getDroneProfile(initialDroneId);

  const [activeTab, setActiveTab] = useState(tabParam || '3d'); // '3d', 'trends', 'params', 'config'
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));
  const [selectedTrendMetric, setSelectedTrendMetric] = useState('rpm');
  const [trendTimeRange, setTrendTimeRange] = useState('1h');
  const [wsConnected, setWsConnected] = useState(false);

  // Configuration controls state
  const [throttle, setThrottle] = useState(78);
  const [cruiseAltitude, setCruiseAltitude] = useState(initialProfile.altitude);
  const [activeFault, setActiveFault] = useState(initialProfile.naturalFaultCode); // Tracks active fault code

  // Real-time telemetry state initialized directly from drone profile
  const [telemetry, setTelemetry] = useState({
    rpm: initialProfile.base.rpm,
    cht: initialProfile.base.cht,
    egt: initialProfile.base.egt,
    oilPress: initialProfile.base.oilPress,
    oilTemp: initialProfile.base.oilTemp,
    fuelFlow: initialProfile.base.fuelFlow,
    vibration: initialProfile.base.vibration,
    batteryVoltage: initialProfile.base.batteryVoltage,
    injectionTiming: initialProfile.base.injectionTiming,
    altitude: initialProfile.altitude,
    fault_label: initialProfile.naturalFaultCode,
  });

  const [aiAnalytics, setAiAnalytics] = useState({
    rulHours: initialProfile.ai.rulHours,
    confidence: initialProfile.ai.confidence,
    healthOverall: initialProfile.ai.healthOverall,
    combustionStability: initialProfile.ai.combustionStability,
    lubricationScore: initialProfile.ai.lubricationScore,
    coolingScore: initialProfile.ai.coolingScore,
    electricalScore: initialProfile.ai.electricalScore,
    anomalyMessage: initialProfile.ai.anomalyMessage,
    severity: initialProfile.severity,
  });

  const [telemetryHistory, setTelemetryHistory] = useState(() => {
    // Pre-populate with realistic initial history matching drone profile
    const initial = [];
    const baseTime = Date.now() - 30 * 1000;
    for (let i = 0; i < 30; i++) {
      const t = new Date(baseTime + i * 1000).toLocaleTimeString('en-GB', { hour12: false });
      const jitter = (Math.random() - 0.5);
      initial.push({
        time: t,
        rpm: Math.round(initialProfile.base.rpm + jitter * initialProfile.base.rpmJitter),
        cht: Math.round((initialProfile.base.cht + jitter * initialProfile.base.chtJitter) * 10) / 10,
        egt: Math.round(initialProfile.base.egt + jitter * initialProfile.base.egtJitter),
        oilPress: Math.max(1.5, Math.round((initialProfile.base.oilPress + jitter * initialProfile.base.oilPressJitter) * 100) / 100),
        oilTemp: Math.round((initialProfile.base.oilTemp + jitter * initialProfile.base.oilTempJitter) * 10) / 10,
        fuelFlow: Math.max(0, Math.round((initialProfile.base.fuelFlow + jitter * initialProfile.base.fuelFlowJitter) * 10) / 10),
        vibration: Math.round((initialProfile.base.vibration + Math.abs(jitter) * initialProfile.base.vibrationJitter) * 10) / 10,
      });
    }
    return initial;
  });

  const [eventLogs, setEventLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString('en-GB', { hour12: false }), text: `SYS: Digital Twin initialized for ${initialDroneId} [${initialProfile.statusLabel}]`, type: initialProfile.severity === 'critical' ? 'critical' : initialProfile.severity === 'warning' ? 'warning' : 'info' },
    { id: 2, time: new Date().toLocaleTimeString('en-GB', { hour12: false }), text: 'SEC: End-to-end AES-256 telemetry encryption verified', type: 'info' },
    { id: 3, time: new Date().toLocaleTimeString('en-GB', { hour12: false }), text: initialProfile.severity === 'critical' ? 'ALERT: Critical telemetry degradation received from asset' : 'DT: Digital twin synchronization baseline nominal', type: initialProfile.severity === 'critical' ? 'critical' : 'success' },
  ]);

  const wsRef = useRef(null);

  // 1. Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Synchronize selectedDroneId when parent drone prop changes
  useEffect(() => {
    if (drone?.id && drone.id !== selectedDroneId) {
      setSelectedDroneId(drone.id);
    }
  }, [drone?.id]);

  // 3. When selectedDroneId changes, immediately switch telemetry and AI state to its profile
  useEffect(() => {
    const prof = getDroneProfile(selectedDroneId);
    setActiveFault(prof.naturalFaultCode);
    setCruiseAltitude(prof.altitude);

    setTelemetry({
      rpm: prof.base.rpm,
      cht: prof.base.cht,
      egt: prof.base.egt,
      oilPress: prof.base.oilPress,
      oilTemp: prof.base.oilTemp,
      fuelFlow: prof.base.fuelFlow,
      vibration: prof.base.vibration,
      batteryVoltage: prof.base.batteryVoltage,
      injectionTiming: prof.base.injectionTiming,
      altitude: prof.altitude,
      fault_label: prof.naturalFaultCode,
    });

    setAiAnalytics({
      rulHours: prof.ai.rulHours,
      confidence: prof.ai.confidence,
      healthOverall: prof.ai.healthOverall,
      combustionStability: prof.ai.combustionStability,
      lubricationScore: prof.ai.lubricationScore,
      coolingScore: prof.ai.coolingScore,
      electricalScore: prof.ai.electricalScore,
      anomalyMessage: prof.ai.anomalyMessage,
      severity: prof.severity,
    });

    // Rebuild initial history with realistic baseline for this drone
    const initial = [];
    const baseTime = Date.now() - 30 * 1000;
    for (let i = 0; i < 30; i++) {
      const t = new Date(baseTime + i * 1000).toLocaleTimeString('en-GB', { hour12: false });
      const jitter = (Math.random() - 0.5);
      initial.push({
        time: t,
        rpm: Math.round(prof.base.rpm + jitter * prof.base.rpmJitter),
        cht: Math.round((prof.base.cht + jitter * prof.base.chtJitter) * 10) / 10,
        egt: Math.round(prof.base.egt + jitter * prof.base.egtJitter),
        oilPress: Math.max(1.5, Math.round((prof.base.oilPress + jitter * prof.base.oilPressJitter) * 100) / 100),
        oilTemp: Math.round((prof.base.oilTemp + jitter * prof.base.oilTempJitter) * 10) / 10,
        fuelFlow: Math.max(0, Math.round((prof.base.fuelFlow + jitter * prof.base.fuelFlowJitter) * 10) / 10),
        vibration: Math.round((prof.base.vibration + Math.abs(jitter) * prof.base.vibrationJitter) * 10) / 10,
      });
    }
    setTelemetryHistory(initial);

    setEventLogs((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        text: `SYS: Telemetry & AI stream switched to ${selectedDroneId} [${prof.statusLabel}]`,
        type: prof.severity === 'critical' ? 'critical' : prof.severity === 'warning' ? 'warning' : 'info',
      },
      ...prev.slice(0, 8),
    ]);

    // Send selection to backend if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'SELECT_DRONE', drone_id: selectedDroneId }));
    }
  }, [selectedDroneId]);

  // 4. WebSocket & Client Simulation fallback
  useEffect(() => {
    let fallbackInterval = null;

    // Try opening WebSocket to python backend
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        // Inform backend which drone stream is requested
        ws.send(JSON.stringify({ type: 'SELECT_DRONE', drone_id: selectedDroneId }));
        setEventLogs((prev) => [
          { id: Date.now(), time: new Date().toLocaleTimeString('en-GB', { hour12: false }), text: `NET: Connected to Python AI Digital Twin server (Streaming ${selectedDroneId})`, type: 'success' },
          ...prev.slice(0, 8),
        ]);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // If message is for a different drone, ignore until stream switches
          if (payload.drone_id && payload.drone_id !== selectedDroneId) {
            return;
          }
          const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
          if (payload.telemetry) {
            setTelemetry((prev) => ({
              ...prev,
              rpm: payload.telemetry.rpm ?? prev.rpm,
              cht: payload.telemetry.cht ?? prev.cht,
              egt: payload.telemetry.egt ?? prev.egt,
              oilPress: payload.telemetry.oilPress ?? prev.oilPress,
              oilTemp: payload.telemetry.oilTemp ?? prev.oilTemp,
              fuelFlow: payload.telemetry.fuelFlow ?? prev.fuelFlow,
              vibration: payload.telemetry.vibration ?? prev.vibration,
              batteryVoltage: payload.telemetry.batteryVoltage ?? prev.batteryVoltage,
              injectionTiming: payload.telemetry.injectionTiming ?? prev.injectionTiming,
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
              confidence: payload.ai_analytics.confidence_pct ?? payload.ai_analytics.confidence ?? prev.confidence,
              healthOverall: payload.ai_analytics.health_scores?.overall ?? prev.healthOverall,
              combustionStability: payload.ai_analytics.health_scores?.combustion ?? prev.combustionStability,
              lubricationScore: payload.ai_analytics.health_scores?.lubrication ?? prev.lubricationScore,
              coolingScore: payload.ai_analytics.health_scores?.cooling ?? prev.coolingScore,
              electricalScore: payload.ai_analytics.health_scores?.electrical ?? prev.electricalScore,
              anomalyMessage: payload.ai_analytics.diagnosis ?? prev.anomalyMessage,
              severity: payload.ai_analytics.severity || ((payload.ai_analytics.rul_hours < 30 || payload.ai_analytics.fault_label > 0) ? 'critical' : 'nominal'),
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
      const prof = getDroneProfile(selectedDroneId);

      setTelemetry((prev) => {
        let baseRpm = prof.base.rpm;
        let baseCht = prof.base.cht;
        let baseEgt = prof.base.egt;
        let baseOilP = prof.base.oilPress;
        let baseOilT = prof.base.oilTemp;
        let baseFuel = prof.base.fuelFlow;
        let baseVib = prof.base.vibration;
        let baseBattery = prof.base.batteryVoltage;
        let baseInj = prof.base.injectionTiming;

        // Apply organic jitter specific to drone profile
        let noiseRpm = (Math.random() - 0.5) * prof.base.rpmJitter;
        let noiseCht = (Math.random() - 0.5) * prof.base.chtJitter;
        let noiseEgt = (Math.random() - 0.5) * prof.base.egtJitter;
        let noiseOilP = (Math.random() - 0.5) * prof.base.oilPressJitter;
        let noiseOilT = (Math.random() - 0.5) * prof.base.oilTempJitter;
        let noiseFuel = (Math.random() - 0.5) * prof.base.fuelFlowJitter;
        let noiseVib = (Math.random() - 0.5) * prof.base.vibrationJitter;

        // If user manually injected a fault or drone has a natural fault
        const effFault = activeFault !== undefined ? activeFault : prof.naturalFaultCode;

        if (effFault === 1) {
          baseRpm -= 250;
          baseVib += 1.6;
          baseEgt -= 45;
        } else if (effFault === 2) {
          baseFuel += 3.2;
          baseEgt += 35;
        } else if (effFault === 3 && prof.category !== 'yellow') {
          baseCht += 48;
          baseOilT += 18;
        } else if (effFault === 4 && prof.category !== 'red') {
          baseOilP = Math.max(1.2, baseOilP - 1.8);
          baseOilT += 22;
          baseVib += 1.4;
        } else if (effFault === 5) {
          baseCht += 35;
        } else if (effFault === 6) {
          noiseRpm += (Math.random() > 0.5 ? 120 : -120);
          noiseEgt += (Math.random() > 0.5 ? 35 : -35);
        }

        const newPoint = {
          rpm: Math.max(0, Math.min(5500, Math.round(baseRpm + noiseRpm))),
          cht: Math.round((baseCht + noiseCht) * 10) / 10,
          egt: Math.round(baseEgt + noiseEgt),
          oilPress: Math.max(0, Math.round((baseOilP + noiseOilP) * 100) / 100),
          oilTemp: Math.round((baseOilT + noiseOilT) * 10) / 10,
          fuelFlow: Math.max(0, Math.round((baseFuel + noiseFuel) * 10) / 10),
          vibration: Math.round((baseVib + noiseVib) * 10) / 10,
          batteryVoltage: Math.round((baseBattery + (Math.random() - 0.5) * 0.1) * 10) / 10,
          injectionTiming: Math.round((baseInj + (Math.random() - 0.5) * 0.2) * 10) / 10,
          altitude: prof.altitude,
          fault_label: effFault,
        };

        setTelemetryHistory((hist) => {
          const updated = [...hist, { time: nowTime, ...newPoint }];
          return updated.slice(-35);
        });

        return newPoint;
      });

      // Update AI analytics dynamically based on drone profile and fault
      setAiAnalytics((prev) => {
        const effFault = activeFault !== undefined ? activeFault : prof.naturalFaultCode;

        if (prof.category === 'red') {
          // Rapid countdown for red drone
          const nextRul = Math.max(4.5, Math.round((prev.rulHours - 0.05) * 10) / 10);
          return {
            rulHours: nextRul,
            confidence: 93.8,
            healthOverall: 38,
            combustionStability: 58,
            lubricationScore: 24,
            coolingScore: 36,
            electricalScore: 84,
            anomalyMessage: 'CRITICAL ALERT: SEVERE LUBRICATION FAILURE & RUNAWAY CHT. Oil pressure (2.15 bar) below emergency threshold. Bearing knock detected. ADVISORY: LAND IMMEDIATELY.',
            severity: 'critical',
          };
        } else if (prof.category === 'yellow' || effFault === 3) {
          return {
            rulHours: 124.5,
            confidence: 87.4,
            healthOverall: 72,
            combustionStability: 86,
            lubricationScore: 80,
            coolingScore: 65,
            electricalScore: 94,
            anomalyMessage: 'WARNING: Elevated thermal stress at high altitude. Cyl 4 Temp Delta exceeds baseline (+28°C). Partial coolant restriction suspected. Maintain surveillance.',
            severity: 'warning',
          };
        } else if (effFault === 0) {
          return {
            rulHours: prof.altitude === 0 ? 800.0 : 442.0,
            confidence: 91.2,
            healthOverall: 96,
            combustionStability: 98,
            lubricationScore: 97,
            coolingScore: 95,
            electricalScore: 98,
            anomalyMessage: prof.altitude === 0 ? 'Asset in Ground Standby at Airbase Alpha. Systems verified and ready for scramble.' : 'All systems nominal. Digital twin baseline verified within 0.02% variance. Optimal cruise performance.',
            severity: 'nominal',
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
            anomalyMessage: `AI ALERT: Sensor anomaly detected (Fault Type #${effFault}). Predictive LSTM model evaluating degradation trend.`,
            severity: 'warning',
          };
        }
      });
    }, 1000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [selectedDroneId, activeFault, throttle, cruiseAltitude]);

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
  const activeProfile = getDroneProfile(selectedDroneId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#F8FAFC',
        color: '#0F172A',
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
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
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
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              color: '#1E40AF',
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
                background: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
              }}
            >
              <Shield size={20} color="#FFFFFF" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.5px', margin: 0, color: '#0F172A' }}>
                  {currentDroneObj.id}
                </h1>
                <StatusBadge
                  status={aiAnalytics.severity === 'critical' ? 'critical' : aiAnalytics.severity === 'warning' ? 'warning' : 'nominal'}
                  label={aiAnalytics.severity === 'critical' ? 'CRITICAL' : aiAnalytics.severity === 'warning' ? 'WARNING' : 'OPERATIONAL'}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', gap: '12px' }}>
                <span>Model: <strong style={{ color: '#334155' }}>{currentDroneObj.model}</strong></span>
                <span>Squadron: <strong style={{ color: '#334155' }}>DRDO MALE UAV</strong></span>
                <span>Mission: <strong style={{ color: '#1E40AF' }}>{currentDroneObj.mission}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Drone Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Select Asset:</span>
          <select
            value={selectedDroneId}
            onChange={(e) => setSelectedDroneId(e.target.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
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
            <div style={{ fontSize: '0.68rem', color: '#64748B', letterSpacing: '0.5px' }}>MISSION TIME (IST)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E40AF', fontFamily: '"JetBrains Mono", monospace' }}>
              {currentTime}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#15803D" />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803D', letterSpacing: '0.5px' }}>
                DATA LINK: SECURE
              </div>
              <div style={{ fontSize: '0.65rem', color: wsConnected ? '#1E40AF' : '#64748B' }}>
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
          padding: '4px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
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
                  backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#1E40AF' : '#64748B',
                  borderBottom: isActive ? '2px solid #1E40AF' : '2px solid transparent',
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
              background: aiAnalytics.severity === 'critical' ? '#FEF2F2' : '#FFFBEB',
              border: `1px solid ${aiAnalytics.severity === 'critical' ? '#FECACA' : '#FDE68A'}`,
              fontSize: '0.72rem',
              color: aiAnalytics.severity === 'critical' ? '#B91C1C' : '#B45309',
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
          gridTemplateColumns: '270px 1fr 320px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* RPM */}
            <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>RPM</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', fontWeight: 700, color: telemetry.rpm > 5000 || telemetry.rpm < 2000 ? '#DC2626' : telemetry.rpm > 4500 ? '#D97706' : '#0F172A' }}>
                    {telemetry.rpm}
                  </span>
                  <StatusBadge
                    status={telemetry.rpm > 5000 || telemetry.rpm < 2000 ? 'critical' : telemetry.rpm > 4500 ? 'warning' : 'nominal'}
                    label={telemetry.rpm > 5000 ? 'SURGE' : telemetry.rpm < 2000 ? 'LOW' : telemetry.rpm > 4500 ? 'HIGH' : 'NORMAL'}
                  />
                </div>
              </div>
              <LinearProgressBar value={telemetry.rpm} max={5500} showLabel={false} showValue={false} height={5} />
            </div>

            {/* Oil Pressure */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Oil Pressure</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Nominal: 3.5 - 5.0 bar</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: telemetry.oilPress < 2.5 ? '#DC2626' : telemetry.oilPress < 3.0 ? '#D97706' : '#0F172A' }}>
                  {telemetry.oilPress.toFixed(2)} bar
                </span>
                <StatusBadge
                  status={telemetry.oilPress < 2.5 ? 'critical' : telemetry.oilPress < 3.0 ? 'warning' : 'nominal'}
                  label={telemetry.oilPress < 2.5 ? 'CRITICAL' : telemetry.oilPress < 3.0 ? 'LOW' : 'NOMINAL'}
                />
              </div>
            </div>

            {/* Oil Temp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Oil Temperature</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Nominal: 70 - 95 °C</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: telemetry.oilTemp > 105 ? '#DC2626' : telemetry.oilTemp > 95 ? '#D97706' : '#0F172A' }}>
                  {telemetry.oilTemp.toFixed(1)} °C
                </span>
                <StatusBadge
                  status={telemetry.oilTemp > 105 ? 'critical' : telemetry.oilTemp > 95 ? 'warning' : 'nominal'}
                  label={telemetry.oilTemp > 105 ? 'OVERHEAT' : telemetry.oilTemp > 95 ? 'HIGH' : 'NOMINAL'}
                />
              </div>
            </div>

            {/* CHT (Avg) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>CHT (Avg)</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Limit: &lt; 180 °C</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: telemetry.cht > 195 ? '#DC2626' : telemetry.cht > 175 ? '#D97706' : '#0F172A' }}>
                  {telemetry.cht.toFixed(1)} °C
                </span>
                <StatusBadge
                  status={telemetry.cht > 195 ? 'critical' : telemetry.cht > 175 ? 'warning' : 'nominal'}
                  label={telemetry.cht > 195 ? 'CRITICAL' : telemetry.cht > 175 ? 'ELEVATED' : 'NOMINAL'}
                />
              </div>
            </div>

            {/* EGT (Avg) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>EGT (Avg)</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Nominal: 650 - 800 °C</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: telemetry.egt > 820 ? '#DC2626' : telemetry.egt > 790 ? '#D97706' : '#0F172A' }}>
                  {telemetry.egt.toFixed(0)} °C
                </span>
                <StatusBadge
                  status={telemetry.egt > 820 ? 'critical' : telemetry.egt > 790 ? 'warning' : 'nominal'}
                  label={telemetry.egt > 820 ? 'HIGH' : 'NOMINAL'}
                />
              </div>
            </div>

            {/* Fuel Flow */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Fuel Flow</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Nominal: 14 - 24 L/h</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: telemetry.fuelFlow > 26 ? '#DC2626' : telemetry.fuelFlow > 22 ? '#D97706' : '#0F172A' }}>
                  {telemetry.fuelFlow.toFixed(1)} L/h
                </span>
                <StatusBadge
                  status={telemetry.fuelFlow > 26 ? 'critical' : telemetry.fuelFlow > 22 ? 'warning' : 'nominal'}
                  label={telemetry.fuelFlow > 26 ? 'SURGE' : telemetry.fuelFlow > 22 ? 'HIGH' : 'NOMINAL'}
                />
              </div>
            </div>

            {/* Vibration */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Vibration</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Limit: &lt; 3.0 mm/s</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: telemetry.vibration > 4.0 ? '#DC2626' : telemetry.vibration > 3.0 ? '#D97706' : '#0F172A' }}>
                  {telemetry.vibration.toFixed(1)} mm/s
                </span>
                <StatusBadge
                  status={telemetry.vibration > 4.0 ? 'critical' : telemetry.vibration > 3.0 ? 'warning' : 'nominal'}
                  label={telemetry.vibration > 4.0 ? 'KNOCK' : telemetry.vibration > 3.0 ? 'HIGH' : 'NOMINAL'}
                />
              </div>
            </div>

            {/* Battery Voltage */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Battery Voltage</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Nominal: 28.0 V</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: telemetry.batteryVoltage < 25 ? '#DC2626' : telemetry.batteryVoltage < 26.5 ? '#D97706' : '#0F172A' }}>
                  {telemetry.batteryVoltage.toFixed(1)} V
                </span>
                <StatusBadge
                  status={telemetry.batteryVoltage < 25 ? 'critical' : telemetry.batteryVoltage < 26.5 ? 'warning' : 'nominal'}
                  label={telemetry.batteryVoltage < 25 ? 'LOW' : 'NOMINAL'}
                />
              </div>
            </div>

            {/* Injection Timing */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>Injection Timing</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Nominal: 12.0° BTDC</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  {telemetry.injectionTiming.toFixed(1)}° BTDC
                </span>
                <StatusBadge status="nominal" label="NOMINAL" />
              </div>
            </div>
          </div>
        </Card>

        {/* CENTER COLUMN: ACTIVE SUB-TAB VIEWPORT */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* TAB 1: 3D DIGITAL TWIN VIEW */}
          {activeTab === '3d' && (
            <div style={{ flex: 1, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
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
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
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

                  <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '4px', padding: '2px', border: '1px solid #E2E8F0' }}>
                    {['Live 10Hz', '1h', '6h', '24h'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTrendTimeRange(range)}
                        style={{
                          background: trendTimeRange === range ? '#1E40AF' : 'transparent',
                          color: trendTimeRange === range ? '#FFFFFF' : '#64748B',
                          border: 'none',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontWeight: 600,
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
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontFamily: '"JetBrains Mono", monospace',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        color: '#0F172A',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedTrendMetric}
                      stroke="#1E40AF"
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
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
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
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px', fontWeight: 600, color: '#0F172A' }}>{row.name}</td>
                      <td style={{ padding: '8px', fontFamily: '"JetBrains Mono", monospace', color: '#1E40AF', fontWeight: 700 }}>{row.val}</td>
                      <td style={{ padding: '8px', color: '#64748B' }}>{row.range}</td>
                      <td style={{ padding: '8px', fontFamily: '"JetBrains Mono", monospace', color: row.dev.startsWith('-') ? '#B45309' : '#15803D', fontWeight: 600 }}>{row.dev}</td>
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
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#1E40AF', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Flight Operational Envelope
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>Throttle Position:</span>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', color: '#1E40AF', fontWeight: 700 }}>{throttle}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={throttle}
                        onChange={(e) => setThrottle(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#1E40AF' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>Cruise Altitude:</span>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', color: '#1E40AF', fontWeight: 700 }}>{cruiseAltitude} ft</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="26000"
                        step="500"
                        value={cruiseAltitude}
                        onChange={(e) => setCruiseAltitude(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#1E40AF' }}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Fault Injection Tool */}
                <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '0.82rem', color: '#B91C1C', margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>
                        AI Fault Injection & Verification Sandbox
                      </h4>
                      <p style={{ fontSize: '0.68rem', color: '#64748B', margin: '2px 0 0 0' }}>
                        Inject real SIH thermodynamic failure profiles to test AI model degradation detection & RUL countdown
                      </p>
                    </div>
                    <button
                      onClick={() => triggerFaultInjection(0)}
                      style={{
                        background: '#15803D',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '5px 12px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
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
                          background: activeFault === fault.code ? '#FEE2E2' : '#FFFFFF',
                          border: `1px solid ${activeFault === fault.code ? '#EF4444' : '#E2E8F0'}`,
                          borderRadius: '6px',
                          padding: '10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: activeFault === fault.code ? '#B91C1C' : '#0F172A' }}>
                          #{fault.code} {fault.title}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>
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
                  ? '#FEF2F2'
                  : aiAnalytics.severity === 'warning'
                    ? '#FFFBEB'
                    : '#F0FDF4',
                border: `1px solid ${aiAnalytics.severity === 'critical' ? '#FECACA' : aiAnalytics.severity === 'warning' ? '#FDE68A' : '#BBF7D0'}`,
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  color: aiAnalytics.severity === 'critical' ? '#B91C1C' : aiAnalytics.severity === 'warning' ? '#B45309' : '#15803D',
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
              <div style={{ fontSize: '0.7rem', color: '#475569', lineHeight: 1.4 }}>
                {aiAnalytics.anomalyMessage}
              </div>
            </div>

            {/* RUL Display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Remaining Useful Life</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: aiAnalytics.rulHours < 50 ? '#DC2626' : aiAnalytics.rulHours < 200 ? '#D97706' : '#15803D', fontFamily: '"JetBrains Mono", monospace' }}>
                  {aiAnalytics.rulHours.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748B' }}>H</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#0284C7', fontWeight: 600 }}>AI Confidence: {aiAnalytics.confidence}%</div>
              </div>
              <CircularGauge value={aiAnalytics.rulHours} max={500} size={76} strokeWidth={6} showStatusDot={false} label="" unit="h" />
            </div>

            {/* System Health Scores */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
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
                  <Line type="monotone" dataKey="cht" stroke="#1E40AF" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="egt" stroke="#D97706" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              <span style={{ color: '#1E40AF' }}>● CHT: {telemetry.cht.toFixed(1)}°C</span>
              <span style={{ color: '#D97706' }}>● EGT: {telemetry.egt.toFixed(0)}°C</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. BOTTOM TACTICAL OVERLAY & SECURE AI EVENT LOG */}
      <footer
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          maxHeight: '110px',
          padding: '8px 20px',
          gap: '16px',
          zIndex: 10,
        }}
      >
        {/* Tactical Mission Overlay */}
        <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <MapPin size={13} color="#1E40AF" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
              Mission Tactical Overlay
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.7rem' }}>
            <div style={{ background: '#F8FAFC', padding: '4px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.62rem' }}>ALTITUDE</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#1E40AF' }}>
                {telemetry.altitude.toLocaleString()} FT
              </span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '4px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.62rem' }}>AIRSPEED</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#0F172A' }}>
                {activeProfile.airspeed || 142} KTS
              </span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '4px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.62rem' }}>FUEL REMAINING</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: (activeProfile.fuelRemaining || 75) < 25 ? '#DC2626' : (activeProfile.fuelRemaining || 75) < 50 ? '#D97706' : '#15803D' }}>
                {activeProfile.fuelRemaining || 68}%
              </span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '4px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.62rem' }}>COORDINATES</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: '#334155' }}>
                {activeProfile.coordinates || '23.41°N, 72.56°E'}
              </span>
            </div>
          </div>
        </div>

        {/* Secure AI Event Log */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Terminal size={13} color="#15803D" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
              Secure AI Event Log
            </span>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.65rem',
              color: '#64748B',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {eventLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: '#1E40AF', fontWeight: 600 }}>[{log.time}]</span>
                <span
                  style={{
                    color: log.type === 'critical' ? '#B91C1C' : log.type === 'warning' ? '#B45309' : log.type === 'success' ? '#15803D' : '#334155',
                    fontWeight: 500,
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
