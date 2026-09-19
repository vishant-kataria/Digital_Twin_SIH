import React, { useState, useEffect } from 'react';
import { Plane, Navigation, CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';

const INITIAL_FLEET = [
  // --- INTERMIXED SQUADRON PATROLS ---
  // Top-Right: Green (TAPAS-01)
  { id: 'TAPAS-01', status: 'flying', health: 'nominal', baseX: 74, baseY: 26, alt: '18,500 ft', rx: 3.5, ry: 2.2, speed: 0.0006, phase: 0.0 },

  // Top-Left: Yellow (TAPAS-02)
  { id: 'TAPAS-02', status: 'flying', health: 'warning', baseX: 26, baseY: 32, alt: '22,100 ft', rx: 4.2, ry: 2.6, speed: 0.0007, phase: 2.3 },

  // Center / Emergency Priority: Red (TAPAS-03)
  { id: 'TAPAS-03', status: 'flying', health: 'critical', baseX: 54, baseY: 42, alt: '12,000 ft', rx: 3.2, ry: 3.0, speed: 0.0010, phase: 1.1 },

  // Mid-Right: Green (TAPAS-04)
  { id: 'TAPAS-04', status: 'flying', health: 'nominal', baseX: 78, baseY: 54, alt: '19,200 ft', rx: 3.8, ry: 2.4, speed: 0.0005, phase: 1.8 },

  // Top-North: Green (TAPAS-05)
  { id: 'TAPAS-05', status: 'flying', health: 'nominal', baseX: 42, baseY: 18, alt: '17,800 ft', rx: 3.2, ry: 2.0, speed: 0.0007, phase: 3.4 },

  // Lower-Left: Green (TAPAS-06)
  { id: 'TAPAS-06', status: 'flying', health: 'nominal', baseX: 32, baseY: 68, alt: '16,500 ft', rx: 3.6, ry: 2.2, speed: 0.0006, phase: 4.7 },

  // Mid-Left: Yellow (TAPAS-07)
  { id: 'TAPAS-07', status: 'flying', health: 'warning', baseX: 18, baseY: 54, alt: '21,500 ft', rx: 3.5, ry: 2.8, speed: 0.0006, phase: 5.1 },

  // --- STATIONARY ASSETS (Airbase Alpha Tarmac) ---
  { id: 'TAPAS-08', status: 'stationary', health: 'nominal', baseX: 48, baseY: 85, alt: '0 ft' },
  { id: 'TAPAS-09', status: 'stationary', health: 'nominal', baseX: 52, baseY: 85, alt: '0 ft' },
  { id: 'TAPAS-10', status: 'stationary', health: 'nominal', baseX: 48, baseY: 92, alt: '0 ft' },
  { id: 'TAPAS-11', status: 'stationary', health: 'nominal', baseX: 52, baseY: 92, alt: '0 ft' },
];

export default function FleetCommand({ onSelectDrone }) {
  const [hoveredDrone, setHoveredDrone] = useState(null);
  const [fleet] = useState(INITIAL_FLEET);
  const [positions, setPositions] = useState(() => {
    const posMap = {};
    INITIAL_FLEET.forEach((d) => {
      posMap[d.id] = { x: d.baseX, y: d.baseY, heading: 45 };
    });
    return posMap;
  });

  // Subtle, smooth tactical patrol drift animation
  useEffect(() => {
    let animId;
    const animate = (time) => {
      const newPos = {};
      INITIAL_FLEET.forEach((d) => {
        if (d.status === 'flying') {
          const angle = time * (d.speed || 0.0006) + (d.phase || 0);
          const dx = Math.cos(angle) * (d.rx || 3.0);
          const dy = Math.sin(angle) * (d.ry || 2.0);
          const x = d.baseX + dx;
          const y = d.baseY + dy;
          const heading = Math.atan2(Math.cos(angle) * (d.ry || 2.0), -Math.sin(angle) * (d.rx || 3.0)) * (180 / Math.PI) + 45;
          newPos[d.id] = { x, y, heading };
        } else {
          newPos[d.id] = { x: d.baseX, y: d.baseY, heading: 0 };
        }
      });
      setPositions(newPos);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const getStatusColor = (health) => {
    switch(health) {
      case 'nominal': return '#15803D';
      case 'warning': return '#D97706';
      case 'critical': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getPulseAnimation = (health, isFlying) => {
    if (!isFlying) return 'none';
    if (health === 'critical') return 'pulse-red 1s infinite';
    if (health === 'warning') return 'pulse-amber 2s infinite';
    return 'pulse-green 3s infinite';
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      
      {/* HEADER */}
      <header className="tactical-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '8px' }}>
            <ShieldAlert color="#1E40AF" size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', color: '#0F172A', letterSpacing: '1px', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>
              Fleet Command Overview
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>DRDO MALE UAV SQUADRON STATUS</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', fontFamily: '"JetBrains Mono", monospace' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>TOTAL ASSETS</div>
            <div style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 700 }}>{fleet.length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>AIRBORNE</div>
            <div style={{ fontSize: '1.4rem', color: '#1E40AF', fontWeight: 700 }}>{fleet.filter(d => d.status === 'flying').length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>STATIONARY</div>
            <div style={{ fontSize: '1.4rem', color: '#64748B', fontWeight: 700 }}>{fleet.filter(d => d.status === 'stationary').length}</div>
          </div>
        </div>
      </header>

      {/* TACTICAL MAP / GRID AREA */}
      <main className="tactical-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        {/* Grid Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}></div>

        {/* Center Radar Sweep */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '800px', height: '800px', border: '1px solid rgba(148, 163, 184, 0.35)', borderRadius: '50%',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', width: '50%', height: '50%',
            borderBottom: '1px solid rgba(30, 64, 175, 0.3)', borderLeft: '1px solid rgba(30, 64, 175, 0.3)',
            transformOrigin: 'bottom left', animation: 'radar-sweep 5s linear infinite',
            background: 'linear-gradient(45deg, rgba(30, 64, 175, 0.08) 0%, transparent 50%)'
          }}></div>
        </div>

        {/* Range ring 2 */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px', border: '1px dashed rgba(148, 163, 184, 0.3)', borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        {/* Base Area Marker */}
        <div style={{ position: 'absolute', bottom: '6%', left: '50%', transform: 'translateX(-50%)', width: '180px', height: '180px', border: '2px dashed rgba(148, 163, 184, 0.45)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ position: 'absolute', bottom: '-20px', fontSize: '0.68rem', color: '#64748B', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>AIRBASE ALPHA</span>
        </div>

        {/* Render Drones with Live Dynamic Positioning */}
        {fleet.map((drone) => {
          const pos = positions[drone.id] || { x: drone.baseX, y: drone.baseY, heading: 45 };
          const isFlying = drone.status === 'flying';
          const isHovered = hoveredDrone === drone.id;

          return (
            <div 
              key={drone.id}
              onClick={() => onSelectDrone(drone)}
              onMouseEnter={() => setHoveredDrone(drone.id)}
              onMouseLeave={() => setHoveredDrone(null)}
              style={{
                position: 'absolute',
                top: `${pos.y}%`,
                left: `${pos.x}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isHovered ? 10 : 1,
                transition: 'top 0.05s linear, left 0.05s linear',
              }}
            >
              {/* Drone Marker */}
              <div style={{
                width: '26px', height: '26px',
                backgroundColor: '#FFFFFF',
                border: `2px solid ${!isFlying ? '#94A3B8' : getStatusColor(drone.health)}`,
                borderRadius: '50%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                animation: getPulseAnimation(drone.health, isFlying),
              }}>
                {isFlying ? (
                  <Navigation 
                    size={13} 
                    color={getStatusColor(drone.health)} 
                    style={{ 
                      transform: `rotate(${pos.heading || 45}deg)`,
                      transition: 'transform 0.1s linear'
                    }} 
                  />
                ) : (
                  <Plane size={13} color="#64748B" />
                )}
              </div>

              {/* Label (Always visible for flying, hover for stationary) */}
              {(isFlying || isHovered) && (
                <div style={{
                  marginTop: '8px', padding: '6px 10px',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${getStatusColor(drone.health)}`,
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  fontFamily: '"JetBrains Mono", monospace',
                  whiteSpace: 'nowrap',
                  display: 'flex', flexDirection: 'column', gap: '2px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#0F172A', fontWeight: 'bold' }}>
                    {drone.health === 'nominal' && <CheckCircle2 size={12} color="#15803D" />}
                    {drone.health === 'warning' && <AlertTriangle size={12} color="#D97706" />}
                    {drone.health === 'critical' && <XCircle size={12} color="#DC2626" />}
                    {drone.id}
                  </div>
                  {isFlying && (
                    <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                      ALT: <strong style={{ color: '#0F172A' }}>{drone.alt}</strong> <br/>
                      <span style={{ color: getStatusColor(drone.health), fontWeight: 600 }}>
                        {drone.health === 'nominal' ? 'SYSTEMS NOMINAL' : drone.health === 'warning' ? 'CHECK REQUIRED' : 'LAND IMMEDIATELY'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <style>{`
          @keyframes radar-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(21, 128, 61, 0.4); } 70% { box-shadow: 0 0 0 14px rgba(21, 128, 61, 0); } 100% { box-shadow: 0 0 0 0 rgba(21, 128, 61, 0); } }
          @keyframes pulse-amber { 0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); } 70% { box-shadow: 0 0 0 16px rgba(217, 119, 6, 0); } 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); } }
          @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); } 70% { box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }
        `}</style>
      </main>

    </div>
  );
}
