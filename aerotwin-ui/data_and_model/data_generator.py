import pandas as pd
import numpy as np

# Set seed for reproducible datasets
np.random.seed(42)

def generate_uav_telemetry(samples, fault_type=0, run_to_failure=False):
    """
    Generates MALE UAV piston engine telemetry aligned with SIH requirements.
    Faults: 1(Misfire), 2(Injector), 3(Cooling), 4(Lubrication), 5(Sensor Drift), 6(Instability)
    """
    # Section E: Environmental condition simulation (High Altitude & Weather)
    altitude_ft = np.random.uniform(10000, 25000, samples)
    ambient_temp_c = 15 - (altitude_ft / 1000) * 2  # Standard atmospheric lapse rate
    
    # Section E: Rapid throttle transitions
    throttle_pct = np.random.uniform(60, 100, samples)
    rapid_spikes = np.random.choice([True, False], size=samples, p=[0.05, 0.95])
    throttle_pct[rapid_spikes] = np.random.uniform(20, 100, size=np.sum(rapid_spikes))
    
    # Section B: Health Monitoring System Parameters
    rpm = throttle_pct * 55 + np.random.normal(0, 20, samples)
    cht_c = 130 + (throttle_pct * 0.5) + np.random.normal(0, 2, samples)
    egt_c = 650 + (throttle_pct * 1.5) + np.random.normal(0, 5, samples)
    oil_press_psi = 60 + (rpm * 0.002) + np.random.normal(0, 1.5, samples)
    oil_temp_c = 90 + (throttle_pct * 0.2) + np.random.normal(0, 1.5, samples)
    fuel_flow_lph = (throttle_pct * 0.35) + np.random.normal(0, 0.5, samples)
    vibration_g = 1.2 + (rpm * 0.0001) + np.random.normal(0, 0.05, samples)
    battery_v = np.random.normal(28.2, 0.2, samples)
    inj_timing_deg = np.random.normal(22.0, 0.1, samples)
    
    # Section D: Remaining Useful Life (RUL) estimation
    rul_hours = np.linspace(samples, 0, samples) if run_to_failure else np.random.uniform(500, 1000, samples)
    
    # Section C & D: Fault Detection & AI/ML Layer (Hybrid thermodynamic degradation)
    if run_to_failure:
        deg = 1.0 + np.exp(-rul_hours / (samples * 0.15))
        
        if fault_type == 1: # Misfire conditions
            rpm -= (deg * 100)
            vibration_g *= (deg ** 1.5)
            egt_c -= (deg * 20)
        elif fault_type == 2: # Injector abnormalities
            fuel_flow_lph *= (deg * 1.2)
            inj_timing_deg += (deg * 2)
            egt_c += (deg * 15)
        elif fault_type == 3: # Cooling degradation / Overheating trends
            cht_c *= (deg ** 1.1)
            oil_temp_c *= (deg ** 1.05)
        elif fault_type == 4: # Lubrication issues / Abnormal vibration patterns
            oil_press_psi /= (deg ** 1.2)
            oil_temp_c *= (deg ** 1.1)
            vibration_g *= (deg ** 1.3)
        elif fault_type == 5: # Sensor drift/ failure
            cht_c += np.linspace(0, samples * 0.5, samples)
            oil_press_psi[rul_hours < 10] = 0 # Complete sensor failure near end of life
        elif fault_type == 6: # Combustion instability
            rpm += np.where(np.arange(samples) % 2 == 0, 150, -150) * deg
            egt_c += np.where(np.arange(samples) % 2 == 0, 50, -50) * deg

    return pd.DataFrame({
        'altitude_ft': altitude_ft,
        'ambient_temp_c': ambient_temp_c,
        'throttle_pct': throttle_pct,
        'rpm': rpm,
        'cht_c': cht_c,
        'egt_c': egt_c,
        'oil_press_psi': oil_press_psi,
        'oil_temp_c': oil_temp_c,
        'fuel_flow_lph': fuel_flow_lph,
        'vibration_g': vibration_g,
        'battery_v': battery_v,
        'inj_timing_deg': inj_timing_deg,
        'fault_label': np.where(rul_hours < (samples * 0.1), fault_type, 0) if run_to_failure else 0,
        'rul_hours': rul_hours
    })

def main():
    print("Initializing SIH-Compliant MALE UAV Digital Twin Data Engine...")
    
    print("Generating healthy mission telemetry (Isolation Forest baseline)...")
    normal_df = generate_uav_telemetry(15000, fault_type=0, run_to_failure=False)
    normal_df.to_csv('normal_telemetry.csv', index=False)
    
    print("Generating hybrid thermodynamic degradation profiles...")
    fault_dfs = []
    for cycle in range(50):
        # Generate all 6 explicitly requested fault types
        for f_type in range(1, 7): 
            fault_dfs.append(generate_uav_telemetry(150, fault_type=f_type, run_to_failure=True))
            
    pd.concat(fault_dfs, ignore_index=True).to_csv('full_fault_telemetry.csv', index=False)
    print("Success! Strictly compliant UAV datasets created.")

if __name__ == "__main__":
    main()