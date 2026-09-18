import React, { useState } from 'react';
import { Plane, Navigation, CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';

const MOCK_FLEET = [
  { id: 'TAPAS-01', status: 'flying', health: 'nominal', x: 25, y: 30, alt: '18,500 ft' },
  { id: 'TAPAS-02', status: 'flying', health: 'warning', x: 60, y: 45, alt: '22,100 ft' },
  { id: 'TAPAS-03', status: 'flying', health: 'critical', x: 80, y: 20, alt: '12,000 ft' },
  { id: 'TAPAS-04', status: 'stationary', health: 'nominal', x: 48, y: 85, alt: '0 ft' },
  { id: 'TAPAS-05', status: 'stationary', health: 'nominal', x: 52, y: 85, alt: '0 ft' },
  { id: 'TAPAS-06', status: 'stationary', health: 'nominal', x: 48, y: 92, alt: '0 ft' },
  { id: 'TAPAS-07', status: 'stationary', health: 'nominal', x: 52, y: 92, alt: '0 ft' },
];

export default function FleetCommand({ onSelectDrone }) {
  const [hoveredDrone, setHoveredDrone] = useState(null);

  const getStatusColor = (health) => {
    switch(health) {
      case 'nominal': return 'var(--accent-green)';
      case 'warning': return 'var(--accent-amber)';
      case 'critical': return 'var(--accent-red)';
      default: return 'var(--text-muted)';
    }
  };

  const getPulseAnimation = (health, isFlying) => {
    if (!isFlying) return 'none';
    if (health === 'critical') return 'pulse-red 1s infinite';
    if (health === 'warning') return 'pulse-amber 2s infinite';
    return 'pulse-green 3s infinite';
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#0b0e14', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      
      {/* HEADER */}
      <header className="tactical-panel" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ShieldAlert color="var(--accent-cyan)" size={28} />
          <div>
            <h1 style={{ fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>FLEET COMMAND OVERVIEW</h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DRDO MALE UAV SQUADRON STATUS</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', fontFamily: '"JetBrains Mono", monospace' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL ASSETS</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{MOCK_FLEET.length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AIRBORNE</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>{MOCK_FLEET.filter(d => d.status === 'flying').length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STATIONARY</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>{MOCK_FLEET.filter(d => d.status === 'stationary').length}</div>
          </div>
        </div>
      </header>

      {/* TACTICAL MAP / GRID AREA */}
      <main className="tactical-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Grid Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}></div>

        {/* Center Radar Sweep */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '800px', height: '800px', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '50%',
        }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: '50%', borderBottom: '1px solid rgba(0,240,255,0.3)', borderLeft: '1px solid rgba(0,240,255,0.3)', transformOrigin: 'bottom left', animation: 'radar-sweep 4s linear infinite', background: 'linear-gradient(45deg, rgba(0,240,255,0.1) 0%, transparent 50%)' }}></div>
        </div>

        {/* Base Area Marker */}
        <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ position: 'absolute', bottom: '-20px', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>AIRBASE ALPHA</span>
        </div>

        {/* Render Drones */}
        {MOCK_FLEET.map(drone => (
          <div 
            key={drone.id}
            onClick={() => onSelectDrone(drone)}
            onMouseEnter={() => setHoveredDrone(drone.id)}
            onMouseLeave={() => setHoveredDrone(null)}
            style={{
              position: 'absolute',
              top: `${drone.y}%`,
              left: `${drone.x}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: hoveredDrone === drone.id ? 10 : 1
            }}
          >
            {/* Drone Marker */}
            <div style={{
              width: '24px', height: '24px',
              backgroundColor: drone.status === 'stationary' ? 'rgba(255,255,255,0.1)' : getStatusColor(drone.health),
              border: `2px solid ${drone.status === 'stationary' ? 'var(--text-muted)' : getStatusColor(drone.health)}`,
              borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: drone.status === 'flying' ? `0 0 15px ${getStatusColor(drone.health)}` : 'none',
              animation: getPulseAnimation(drone.health, drone.status === 'flying')
            }}>
              {drone.status === 'flying' ? <Navigation size={12} color="#000" style={{ transform: 'rotate(45deg)' }} /> : <Plane size={12} color="var(--text-muted)" />}
            </div>

            {/* Label (Always visible for flying, hover for stationary) */}
            {(drone.status === 'flying' || hoveredDrone === drone.id) && (
              <div className="tactical-panel" style={{
                marginTop: '10px', padding: '5px 10px',
                backgroundColor: 'rgba(11, 14, 20, 0.9)',
                border: `1px solid ${getStatusColor(drone.health)}`,
                fontFamily: '"JetBrains Mono", monospace',
                whiteSpace: 'nowrap',
                display: 'flex', flexDirection: 'column', gap: '3px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                  {drone.health === 'nominal' && <CheckCircle2 size={12} color="var(--accent-green)" />}
                  {drone.health === 'warning' && <AlertTriangle size={12} color="var(--accent-amber)" />}
                  {drone.health === 'critical' && <XCircle size={12} color="var(--accent-red)" />}
                  {drone.id}
                </div>
                {drone.status === 'flying' && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    ALT: {drone.alt} <br/>
                    <span style={{ color: getStatusColor(drone.health) }}>
                      {drone.health === 'nominal' ? 'SYSTEMS NOMINAL' : drone.health === 'warning' ? 'CHECK REQUIRED' : 'LAND IMMEDIATELY'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <style>{`
          @keyframes radar-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(0, 255, 102, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 255, 102, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 255, 102, 0); } }
          @keyframes pulse-amber { 0% { box-shadow: 0 0 0 0 rgba(255, 179, 0, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(255, 179, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 179, 0, 0); } }
          @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.9); } 70% { box-shadow: 0 0 0 25px rgba(255, 51, 51, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0); } }
        `}</style>
      </main>

    </div>
  );
}
