import React, { useState } from 'react';
import BootScreen from './BootScreen';
import FleetCommand from './FleetCommand';
import DroneConfigurationView from './pages/DroneConfigurationView';
import './App.css';

export default function App() {
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialView = queryParams?.get('view') || 'boot';
  const initialDroneId = queryParams?.get('drone') || 'TAPAS-01';

  const [currentView, setCurrentView] = useState(initialView); // 'boot', 'fleet', 'dashboard'
  const [activeDrone, setActiveDrone] = useState(initialView === 'dashboard' ? { id: initialDroneId } : null);

  if (currentView === 'boot') {
    return <BootScreen onLogin={() => setCurrentView('fleet')} />;
  }

  if (currentView === 'fleet') {
    return (
      <FleetCommand
        onSelectDrone={(drone) => {
          setActiveDrone(drone);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  return (
    <DroneConfigurationView
      drone={activeDrone || { id: 'TAPAS-01' }}
      onBack={() => setCurrentView('fleet')}
    />
  );
}
