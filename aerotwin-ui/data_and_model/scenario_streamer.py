import os
import math
import numpy as np
import pandas as pd

class DroneScenarioManager:
    """
    Manages 3 distinct, continuous flight telemetry streams for the AeroTwin MALE UAV fleet:
      - TAPAS-01: Green / Stable Cruise (Nominal flight, RUL > 400h)
      - TAPAS-02: Yellow / Normal Unstable (High-altitude atmospheric drift, warning thermal state)
      - TAPAS-03: Red / Very Unstable (Critical emergency degradation, runaway CHT, rapid RUL loss)
      - TAPAS-04: Ground Standby (Airbase Alpha, 0 ft, idle)
    """
    def __init__(self, data_dir=None):
        if data_dir is None:
            data_dir = os.path.dirname(os.path.abspath(__file__))
            
        self.data_dir = data_dir
        self.step = 0
        
        # Load available datasets for realistic data seeds
        normal_path = os.path.join(data_dir, 'normal_telemetry.csv')
        fault_path = os.path.join(data_dir, 'full_fault_telemetry.csv')
        
        if os.path.exists(normal_path):
            self.normal_df = pd.read_csv(normal_path)
        else:
            self.normal_df = None
            
        if os.path.exists(fault_path):
            self.fault_df = pd.read_csv(fault_path)
        else:
            self.fault_df = None
            
        self.idx_01 = 0
        self.idx_03 = 0
        self.tapas03_rul = 28.5  # Rapid countdown starts under 30h

    def get_tapas01_tick(self):
        """
        TAPAS-01: GREEN / STABLE CRUISE
        Nominal mission flight profile: 18,500 ft, stable RPM, nominal temperatures.
        """
        self.step += 1
        t = self.step * 0.1
        
        # Base healthy parameters with realistic organic micro-vibrations
        altitude = 18500.0 + math.sin(t * 0.2) * 15.0
        ambient_temp = -22.0 + math.cos(t * 0.15) * 0.5
        throttle = 78.0 + math.sin(t * 0.08) * 1.5
        
        rpm = 2820.0 + math.sin(t * 0.4) * 15.0 + np.random.normal(0, 3.0)
        cht = 156.4 + math.sin(t * 0.1) * 1.5 + np.random.normal(0, 0.3)
        egt = 718.0 + math.cos(t * 0.12) * 4.0 + np.random.normal(0, 1.0)
        oil_press = 60.2 + math.sin(t * 0.25) * 0.8 + np.random.normal(0, 0.2) # ~4.15 bar
        oil_temp = 78.5 + math.sin(t * 0.05) * 1.0
        fuel_flow = 18.2 + math.sin(t * 0.1) * 0.4
        vibration = 1.95 + abs(math.sin(t * 0.5)) * 0.12
        battery = 27.8 + np.random.normal(0, 0.03)
        inj_timing = 12.4 + np.random.normal(0, 0.04)
        
        return {
            'altitude_ft': round(altitude, 0),
            'ambient_temp_c': round(ambient_temp, 1),
            'throttle_pct': round(throttle, 1),
            'rpm': round(rpm, 0),
            'cht_c': round(cht, 1),
            'egt_c': round(egt, 1),
            'oil_press_psi': round(oil_press, 2),
            'oil_temp_c': round(oil_temp, 1),
            'fuel_flow_lph': round(fuel_flow, 1),
            'vibration_g': round(vibration, 2),
            'battery_v': round(battery, 2),
            'inj_timing_deg': round(inj_timing, 1),
            'fault_label': 0,
            'rul_hours': 442.0
        }

    def get_tapas02_tick(self):
        """
        TAPAS-02: YELLOW / NORMAL UNSTABLE
        Border Recon flight: High altitude (22,100 ft), gusty throttle compensation,
        running warm near thermal ceiling, cycle-to-cycle RPM/EGT flutter.
        """
        t = self.step * 0.1
        
        # High altitude with noticeable atmospheric draft
        altitude = 22100.0 + math.sin(t * 0.35) * 65.0
        ambient_temp = -29.2 + math.cos(t * 0.2) * 1.2
        throttle = 86.0 + math.sin(t * 0.5) * 6.0  # Variable throttle
        
        # RPM flutter and thermal escalation
        rpm = 3040.0 + math.sin(t * 1.2) * 45.0 + (55.0 if (self.step % 14 < 3) else -45.0 if (self.step % 14 > 11) else 0.0)
        cht = 187.5 + math.sin(t * 0.2) * 3.5 + (throttle - 80.0) * 0.3  # Touches 188-192 C
        egt = 778.0 + math.sin(t * 0.9) * 12.0 + np.random.normal(0, 2.5)
        oil_press = 49.6 - (cht - 180.0) * 0.3 + np.random.normal(0, 0.4) # ~3.42 bar
        oil_temp = 96.5 + math.sin(t * 0.15) * 1.8
        fuel_flow = 21.8 + math.sin(t * 0.4) * 0.8
        vibration = 2.85 + abs(math.sin(t * 0.8)) * 0.18  # Elevated vibration
        battery = 27.1 + np.random.normal(0, 0.05)
        inj_timing = 13.2 + math.sin(t * 0.3) * 0.15
        
        return {
            'altitude_ft': round(altitude, 0),
            'ambient_temp_c': round(ambient_temp, 1),
            'throttle_pct': round(throttle, 1),
            'rpm': round(rpm, 0),
            'cht_c': round(cht, 1),
            'egt_c': round(egt, 1),
            'oil_press_psi': round(oil_press, 2),
            'oil_temp_c': round(oil_temp, 1),
            'fuel_flow_lph': round(fuel_flow, 1),
            'vibration_g': round(vibration, 2),
            'battery_v': round(battery, 2),
            'inj_timing_deg': round(inj_timing, 1),
            'fault_label': 3,  # Cooling Degradation / Atmospheric stress
            'rul_hours': 124.5
        }

    def get_tapas03_tick(self):
        """
        TAPAS-03: RED / VERY UNSTABLE (CRITICAL EMERGENCY)
        Catastrophic engine degradation: CHT > 215 C, severe lubrication loss (<35 PSI),
        high mechanical knock (>3.4g), rapid RUL countdown towards failure.
        """
        t = self.step * 0.1
        
        # Countdown RUL rapidly
        self.tapas03_rul = max(4.2, self.tapas03_rul - 0.05)
        
        # Descending rapidly in emergency profile
        altitude = max(9500.0, 12000.0 - (t * 12.0) % 3000.0)
        ambient_temp = -12.0 + (altitude / 1000.0) * -1.8
        throttle = 64.0 + math.sin(t * 1.5) * 8.0  # Struggling throttle
        
        # Severe combustion misfire and severe thermal runaway
        rpm = 2420.0 + (math.sin(t * 2.5) * 140.0) + np.random.normal(0, 30.0)
        cht = 218.4 + math.sin(t * 0.3) * 5.0 + np.random.normal(0, 1.2)  # Extreme overheat!
        egt = 842.0 + math.sin(t * 1.8) * 18.0 + np.random.normal(0, 3.5)
        
        # Lubrication failure (pressure below safe threshold)
        oil_press = max(24.0, 31.2 - math.sin(t * 0.4) * 3.0 + np.random.normal(0, 0.5)) # ~2.15 bar
        oil_temp = 116.5 + math.sin(t * 0.2) * 2.5  # Boiling oil
        fuel_flow = 26.8 + math.sin(t * 1.1) * 1.2
        vibration = 3.85 + abs(math.sin(t * 3.0)) * 0.45  # Critical mechanical knock
        battery = 25.4 + np.random.normal(0, 0.08)
        inj_timing = 14.6 + math.sin(t * 0.8) * 0.25
        
        return {
            'altitude_ft': round(altitude, 0),
            'ambient_temp_c': round(ambient_temp, 1),
            'throttle_pct': round(throttle, 1),
            'rpm': round(rpm, 0),
            'cht_c': round(cht, 1),
            'egt_c': round(egt, 1),
            'oil_press_psi': round(oil_press, 2),
            'oil_temp_c': round(oil_temp, 1),
            'fuel_flow_lph': round(fuel_flow, 1),
            'vibration_g': round(vibration, 2),
            'battery_v': round(battery, 2),
            'inj_timing_deg': round(inj_timing, 1),
            'fault_label': 4,  # Critical Lubrication & Thermal Failure
            'rul_hours': round(self.tapas03_rul, 1)
        }

    def get_tapas04_tick(self):
        """
        TAPAS-04: Standby asset parked on Airbase Alpha tarmac.
        """
        return {
            'altitude_ft': 0.0,
            'ambient_temp_c': 28.0,
            'throttle_pct': 0.0,
            'rpm': 0.0,
            'cht_c': 35.0,
            'egt_c': 35.0,
            'oil_press_psi': 0.0,
            'oil_temp_c': 32.0,
            'fuel_flow_lph': 0.0,
            'vibration_g': 0.05,
            'battery_v': 28.4,
            'inj_timing_deg': 0.0,
            'fault_label': 0,
            'rul_hours': 800.0
        }

    def get_tick_for_drone(self, drone_id):
        """Returns the appropriate telemetry tick for the requested drone identifier."""
        drone_id_upper = str(drone_id).upper().strip()
        # 4 GREEN DRONES (Stable / Nominal Cruise)
        if any(k in drone_id_upper for k in ['01', '04', '05', '06']):
            tick = self.get_tapas01_tick()
            if '04' in drone_id_upper:
                tick['altitude_ft'] = round(19200.0 + (tick['altitude_ft'] - 18500.0), 0)
            elif '05' in drone_id_upper:
                tick['altitude_ft'] = round(17800.0 + (tick['altitude_ft'] - 18500.0), 0)
            elif '06' in drone_id_upper:
                tick['altitude_ft'] = round(16500.0 + (tick['altitude_ft'] - 18500.0), 0)
            return tick
        # 2 YELLOW DRONES (Normal Unstable / Warning State)
        elif any(k in drone_id_upper for k in ['02', '07']):
            tick = self.get_tapas02_tick()
            if '07' in drone_id_upper:
                tick['altitude_ft'] = round(21500.0 + (tick['altitude_ft'] - 22100.0), 0)
            return tick
        # 1 RED DRONE (Very Unstable / Critical Failure)
        elif '03' in drone_id_upper:
            return self.get_tapas03_tick()
        # TARMAC STANDBY DRONES
        else:
            return self.get_tapas04_tick()
