import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Activity, Cpu, Thermometer, Droplets, Map, Radio, Terminal, Settings, ChevronLeft } from 'lucide-react';
import BootScreen from './BootScreen';
import FleetCommand from './FleetCommand';
import LiveTelemetryChart from './LiveTelemetryChart';
import Engine3DView from './Engine3DView';
import './App.css'; // empty now

function Dashboard({ drone, onBack }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));
  
  // Mock Real-Time Telemetry Data
  const [telemetry, setTelemetry] = useState({
    rpm: 4050,
    cht: 195.0,
    egt: 810,
    oilPress: 4.5,
    fuelFlow: 14.0,
  });

  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [rul, setRul] = useState(125.5); // AI RUL Prediction
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to Python Digital Twin Server
    wsRef.current = new WebSocket('ws://localhost:8000');

    wsRef.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const newTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        
        setTime(newTime);
        setTelemetry(payload.telemetry);
        setRul(payload.ai_analytics.rul_hours);

        // Update historical chart data (keep last 30 data points)
        setTelemetryHistory(prev => {
          const newHistory = [...prev, { time: newTime, ...payload.telemetry }];
          if (newHistory.length > 30) newHistory.shift();
          return newHistory;
        });
      } catch (err) {
        console.error("Error parsing telemetry", err);
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="dashboard-grid">
      {/* HEADER */}
      <header className="header tactical-panel" style={{ borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--accent-cyan)', padding: '5px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={20} />
          </button>
          <ShieldAlert color={drone?.health === 'critical' ? 'var(--accent-red)' : drone?.health === 'warning' ? 'var(--accent-amber)' : 'var(--accent-amber)'} size={28} />
          <div>
            <h1 style={{ fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '2px', textTransform: 'uppercase' }}>{drone ? drone.id : 'DRDO AeroTwin'}</h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MALE UAV DIGITAL TWIN CMD</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontFamily: '"JetBrains Mono", monospace' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MISSION TIME (IST)</span>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem' }}>{time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio color="var(--accent-green)" size={18} />
            <span style={{ color: 'var(--accent-green)', fontSize: '0.8rem', letterSpacing: '1px' }}>DATA LINK: SECURE</span>
          </div>
          <Settings color="var(--text-muted)" size={20} style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* LEFT PANEL: TELEMETRY */}
      <aside className="tactical-panel" style={{ gridColumn: '1 / 2', gridRow: '2 / 3', padding: '15px' }}>
        <div className="panel-title">
          <Activity size={16} /> LIVE TELEMETRY STREAM
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <div className="data-row">
              <span className="data-label font-mono">ENGINE RPM</span>
              <span className="data-value cyan font-mono">{(telemetry?.rpm ?? 0).toFixed(0)}</span>
            </div>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: `${((telemetry?.rpm ?? 0) / 5000) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="data-row">
              <span className="data-label font-mono"><Thermometer size={14} style={{display:'inline'}}/> CHT (°C)</span>
              <span className={`data-value font-mono ${(telemetry?.cht ?? 0) > 220 ? 'red' : (telemetry?.cht ?? 0) > 200 ? 'amber' : 'cyan'}`}>
                {(telemetry?.cht ?? 0).toFixed(1)}
              </span>
            </div>
            <div className="health-bar-container">
              <div className={`health-bar-fill ${(telemetry?.cht ?? 0) > 220 ? 'critical' : (telemetry?.cht ?? 0) > 200 ? 'warning' : ''}`} style={{ width: `${((telemetry?.cht ?? 0) / 250) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="data-row">
              <span className="data-label font-mono"><Thermometer size={14} style={{display:'inline'}}/> EGT (°C)</span>
              <span className="data-value cyan font-mono">{(telemetry?.egt ?? 0).toFixed(0)}</span>
            </div>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: `${((telemetry?.egt ?? 0) / 1000) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="data-row">
              <span className="data-label font-mono"><Droplets size={14} style={{display:'inline'}}/> OIL PRESS (BAR)</span>
              <span className="data-value cyan font-mono">{(telemetry?.oilPress ?? telemetry?.oilPres ?? 0).toFixed(2)}</span>
            </div>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: `${((telemetry?.oilPress ?? telemetry?.oilPres ?? 0) / 6) * 100}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="data-row">
              <span className="data-label font-mono">FUEL FLOW (L/H)</span>
              <span className="data-value cyan font-mono">{(telemetry?.fuelFlow ?? 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER: 3D DIGITAL TWIN */}
      <main className="tactical-panel" style={{ gridColumn: '2 / 3', gridRow: '2 / 3', padding: '0', overflow: 'hidden', position: 'relative' }}>
        <Engine3DView telemetry={telemetry} />
      </main>

      {/* RIGHT PANEL: AI ANALYTICS & RUL */}
      <aside className="tactical-panel warning" style={{ gridColumn: '3 / 4', gridRow: '2 / 3', padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="panel-title" style={{ color: 'var(--accent-amber)', borderColor: 'rgba(255, 179, 0, 0.2)' }}>
          <Activity size={16} /> AI PREDICTIVE ANALYTICS
        </div>
        
        {rul < 30 ? (
          <div style={{ background: 'rgba(255, 51, 51, 0.1)', border: '1px solid var(--accent-red)', padding: '15px', borderRadius: '4px' }}>
            <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>CRITICAL: IMMINENT FAILURE PREDICTED</div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>AI Model predicts engine failure. Land immediately.</div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255, 179, 0, 0.1)', border: '1px solid var(--accent-amber)', padding: '15px', borderRadius: '4px' }}>
            <div style={{ color: 'var(--accent-amber)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>WARNING: DEGRADATION DETECTED</div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>Cyl 4 Temp Delta exceeds baseline.<br/>Probable partial coolant blockage.</div>
          </div>
        )}

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>REMAINING USEFUL LIFE (RUL)</div>
          <div style={{ fontSize: '2.5rem', color: rul < 30 ? 'var(--accent-red)' : 'var(--accent-amber)', fontFamily: '"JetBrains Mono", monospace', lineHeight: '1' }}>
            {rul.toFixed(1)}<span style={{ fontSize: '1.2rem' }}>H</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>CONFIDENCE: 87.4%</div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px' }}>SYSTEM HEALTH SCORES</div>
          <div className="data-row">
            <span className="data-label font-mono">THERMODYNAMIC</span>
            <span className="data-value amber font-mono">72%</span>
          </div>
          <div className="data-row">
            <span className="data-label font-mono">MECHANICAL</span>
            <span className="data-value cyan font-mono">94%</span>
          </div>
          <div className="data-row">
            <span className="data-label font-mono">LUBRICATION</span>
            <span className="data-value cyan font-mono">98%</span>
          </div>
        </div>

        <LiveTelemetryChart data={telemetryHistory} />
      </aside>

      {/* BOTTOM PANEL: MAP & TERMINAL */}
      <footer className="tactical-panel" style={{ gridColumn: '1 / -1', gridRow: '3 / 4', display: 'flex' }}>
        
        <div style={{ flex: '1', borderRight: '1px solid var(--border-color)', padding: '15px' }}>
          <div className="panel-title">
            <Map size={16} /> MISSION TACTICAL OVERLAY
          </div>
          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(0, 240, 255, 0.2)', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
            [ TOPOGRAPHICAL MAP RENDERER OFFLINE ]<br/>AWAITING GPS LOCK
          </div>
        </div>

        <div style={{ flex: '1', padding: '15px', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-title">
            <Terminal size={16} /> SECURE EVENT LOG
          </div>
          <div style={{ flex: '1', overflowY: 'auto', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><span style={{color: 'var(--accent-cyan)'}}>[{time}]</span> SYS: Connected to Core AI Server</div>
            <div><span style={{color: 'var(--accent-cyan)'}}>[{time}]</span> SEC: Packet encryption key verified</div>
            <div><span style={{color: 'var(--accent-cyan)'}}>[{time}]</span> DT: Synchronizing physical baseline...</div>
            <div><span style={{color: 'var(--accent-cyan)'}}>[{time}]</span> DT: Sync complete. Delta = 0.04%</div>
            <div style={{color: 'var(--accent-amber)'}}><span>[{time}]</span> AI: Anomaly registered on sensor CHT_04</div>
            <div><span style={{color: 'var(--accent-cyan)'}}>[{time}]</span> NET: RX Rate 50Hz, Latency 42ms</div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('boot'); // 'boot', 'fleet', 'dashboard'
  const [activeDrone, setActiveDrone] = useState(null);

  if (currentView === 'boot') {
    return <BootScreen onLogin={() => setCurrentView('fleet')} />;
  }

  if (currentView === 'fleet') {
    return <FleetCommand onSelectDrone={(drone) => {
      setActiveDrone(drone);
      setCurrentView('dashboard');
    }} />;
  }

  return <Dashboard drone={activeDrone} onBack={() => setCurrentView('fleet')} />;
}
