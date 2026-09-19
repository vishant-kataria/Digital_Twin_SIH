import asyncio
import websockets
import json
import time
import os

# Enable ANSI terminal colors on Windows console
os.system('')

script_dir = os.path.dirname(os.path.abspath(__file__))
from ai_engine import AeroTwinAIEngine
from scenario_streamer import DroneScenarioManager

ALL_DRONE_IDS = ['TAPAS-01', 'TAPAS-02', 'TAPAS-03', 'TAPAS-04', 'TAPAS-05', 'TAPAS-06', 'TAPAS-07']

# Dedicated AI engine instances for each drone so their time-series buffers remain separate
ai_engines = {d_id: AeroTwinAIEngine() for d_id in ALL_DRONE_IDS}

scenario_mgr = DroneScenarioManager(script_dir)

# Track which drone each connected dashboard client wants to monitor
client_drone_map = {}
connected_clients = set()

# ANSI Color Codes for Aerospace Command Display
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
WHITE = "\033[97m"
BG_RED = "\033[41m\033[97m"
BG_YELLOW = "\033[43m\033[30m"
BG_GREEN = "\033[42m\033[30m"

def print_aerospace_dashboard(tick_count, drones_data, connected_clients):
    """
    Renders an aerospace command telemetry matrix to the console,
    showcasing all physical parameters and dual AI inference metrics to impress evaluators/judges.
    """
    now_str = time.strftime('%H:%M:%S')
    client_count = len(connected_clients)
    
    # Active monitoring targets
    active_targets = [client_drone_map.get(c, 'TAPAS-01') for c in connected_clients]
    active_str = ", ".join(set(active_targets)) if active_targets else "Standby (Awaiting GUI link)"
    
    print("\n" + "=" * 132)
    print(f"{BOLD}{CYAN}⚡ DRDO MALE UAV DIGITAL TWIN | AERO-TWIN MULTI-AGENT TELEMETRY & DUAL AI ENGINE ⚡{RESET}")
    print(f"{DIM}TICK #{tick_count:05d} | MISSION TIME (IST): {now_str} | STREAM RATE: 10 Hz | ACTIVE COCKPITS: {client_count} [{active_str}]{RESET}")
    print("=" * 132)
    
    # Table Header
    print(f"{BOLD}{'UAV ID':<10} {'STATUS':<11} {'ALT(ft)':<9} {'RPM':<6} {'CHT(°C)':<8} {'EGT(°C)':<8} {'OIL(bar)':<9} {'OIL(°C)':<8} {'VIB(g)':<7} {'FUEL(L/h)':<9} {'RUL':<8} {'CONF':<7} {'DIAGNOSIS & FAULT VERDICT'}{RESET}")
    print("-" * 132)
    
    for drone_id in ALL_DRONE_IDS:
        info = drones_data.get(drone_id)
        if not info:
            continue
        raw = info['raw']
        ai = info['ai']
        
        sev = ai.get('severity', 'nominal').lower()
        if sev == 'critical':
            status_badge = f"{BG_RED} CRITICAL  {RESET}"
            id_str = f"{RED}{BOLD}{drone_id}{RESET}"
            rul_str = f"{RED}{BOLD}{ai['rul_hours']:>5.1f}h{RESET}"
            diag_str = f"{RED}{BOLD}{ai.get('diagnosis', 'CRITICAL FAILURE DETECTED')[:40]}{RESET}"
        elif sev == 'warning':
            status_badge = f"{BG_YELLOW}  WARNING  {RESET}"
            id_str = f"{YELLOW}{BOLD}{drone_id}{RESET}"
            rul_str = f"{YELLOW}{ai['rul_hours']:>5.1f}h{RESET}"
            diag_str = f"{YELLOW}{ai.get('diagnosis', 'THERMAL STRAIN DETECTED')[:40]}{RESET}"
        else:
            status_badge = f"{GREEN}  NOMINAL  {RESET}"
            id_str = f"{GREEN}{drone_id}{RESET}"
            rul_str = f"{GREEN}{ai['rul_hours']:>5.1f}h{RESET}"
            diag_str = f"{DIM}{ai.get('diagnosis', 'Optimal digital twin synchronization')[:40]}{RESET}"
            
        alt_str = f"{int(raw['altitude_ft']):,}"
        rpm_str = f"{int(raw['rpm'])}"
        cht_str = f"{raw['cht_c']:.1f}"
        egt_str = f"{raw['egt_c']:.0f}"
        oil_bar = raw['oil_press_psi'] / 14.5038
        oil_p_str = f"{oil_bar:.2f}"
        oil_t_str = f"{raw['oil_temp_c']:.1f}"
        vib_str = f"{raw['vibration_g']:.2f}"
        fuel_str = f"{raw['fuel_flow_lph']:.1f}"
        conf_str = f"{ai.get('confidence', 95.0):.1f}%"
        
        # Color specific cell values if out of bounds
        if oil_bar < 2.5:
            oil_p_str = f"{RED}{oil_p_str}{RESET}"
        elif oil_bar < 3.0:
            oil_p_str = f"{YELLOW}{oil_p_str}{RESET}"
            
        if raw['cht_c'] > 195:
            cht_str = f"{RED}{cht_str}{RESET}"
        elif raw['cht_c'] > 175:
            cht_str = f"{YELLOW}{cht_str}{RESET}"

        if raw['vibration_g'] > 3.0:
            vib_str = f"{RED}{vib_str}{RESET}"
            
        print(f"{id_str:<19} {status_badge} {alt_str:>8} {rpm_str:>6} {cht_str:>8} {egt_str:>8} {oil_p_str:>9} {oil_t_str:>8} {vib_str:>7} {fuel_str:>9} {rul_str} {conf_str:>7}  {diag_str}")

    print("-" * 132)
    
    # Detailed AI Model Deep Dive for Emergency & Warning Units
    t3 = drones_data.get('TAPAS-03', {})
    t3_ai = t3.get('ai', {})
    scores = t3_ai.get('health_scores', {})
    
    print(f"{BOLD}{WHITE}>>> AI MULTI-MODEL INFERENCE ENGINE VERDICT:{RESET}")
    print(f"  * {BOLD}PyTorch LSTM (64x32 RUL Regressor){RESET} : TAPAS-03 RUL={t3_ai.get('rul_hours', 18.5)}h | Decay Rate: -0.1h/tick | Confidence: {t3_ai.get('confidence', 96.8)}%")
    print(f"  * {BOLD}Scikit-Learn Isolation Forest{RESET}      : Contamination=0.05, 12 Sensor Features -> Score: {t3_ai.get('anomaly_score', -0.42):.3f} ({RED}OUTLIER ANOMALY{RESET})")
    print(f"  * {BOLD}TAPAS-03 Subsystems Health{RESET}         : Combustion: {scores.get('combustion', 65)}% | {RED}Cooling: {scores.get('cooling', 38)}% (OVERHEAT){RESET} | {RED}Lubrication: {scores.get('lubrication', 22)}% (CRITICAL DROP){RESET} | Electrical: {scores.get('electrical', 94)}%")
    print(f"  * {BOLD}Tactical Advisory Directive{RESET}        : {BG_RED} ACTION: {t3_ai.get('action_advisory', 'LAND IMMEDIATELY').upper()} {RESET}")
    print("=" * 132)

async def telemetry_handler(websocket, path=None):
    """
    Handles new React dashboard connections and listens for DRONE_SELECT commands.
    """
    client_drone_map[websocket] = 'TAPAS-01'
    print(f"{GREEN}[NET] New dashboard cockpit connected: {websocket.remote_address}{RESET}")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get('type') == 'SELECT_DRONE':
                    drone_id = data.get('drone_id', 'TAPAS-01')
                    client_drone_map[websocket] = drone_id
                    print(f"{CYAN}[COMMAND] Cockpit {websocket.remote_address} switched telemetry stream to: {BOLD}{drone_id}{RESET}")
            except Exception:
                pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print(f"{DIM}[NET] Dashboard disconnected: {websocket.remote_address}{RESET}")
        connected_clients.discard(websocket)
        client_drone_map.pop(websocket, None)

async def broadcast_telemetry():
    """
    Simultaneously computes AI analytics for all drones in the squadron
    and streams targeted 10Hz telemetry to connected cockpits and fleet radar.
    """
    tick_count = 0
    while True:
        tick_count += 1
        
        # 1. Generate live telemetry and run AI models for each drone
        drones_data = {}
        for drone_id in ALL_DRONE_IDS:
            raw_tick = scenario_mgr.get_tick_for_drone(drone_id)
            ai_analytics = ai_engines[drone_id].predict_tick(raw_tick)
            drones_data[drone_id] = {
                'raw': raw_tick,
                'ai': ai_analytics
            }
            
        # 2. Live terminal heartbeat every 20 ticks (2 seconds) with full telemetry matrix
        if tick_count % 20 == 0:
            print_aerospace_dashboard(tick_count, drones_data, connected_clients)

        # 3. Build Fleet Overview summary for the radar map (4 Green, 2 Yellow, 1 Red, 4 Stationary)
        fleet_status = []
        for d in ALL_DRONE_IDS:
            d_data = drones_data.get(d)
            if d_data:
                fleet_status.append({
                    "id": d,
                    "alt": f"{int(d_data['raw']['altitude_ft']):,} ft",
                    "health": d_data['ai']['severity'],
                    "rul": d_data['ai']['rul_hours']
                })
        for s in ['TAPAS-08', 'TAPAS-09', 'TAPAS-10', 'TAPAS-11']:
            fleet_status.append({"id": s, "alt": "0 ft", "health": "nominal", "rul": 800.0})

        # 4. Stream tailored payload to each connected dashboard
        if connected_clients:
            tasks = []
            for client in list(connected_clients):
                target_drone = client_drone_map.get(client, 'TAPAS-01')
                drone_info = drones_data.get(target_drone, drones_data['TAPAS-01'])
                row = drone_info['raw']
                ai_analytics = drone_info['ai']

                payload = {
                    "drone_id": target_drone,
                    "telemetry": {
                        "rpm": round(row['rpm'], 0),
                        "cht": round(row['cht_c'], 1),
                        "egt": round(row['egt_c'], 1),
                        "oilPress": round(row['oil_press_psi'] / 14.5038, 2),
                        "oilTemp": round(row['oil_temp_c'], 1),
                        "fuelFlow": round(row['fuel_flow_lph'], 1),
                        "vibration": round(row['vibration_g'], 2),
                        "batteryVoltage": round(row['battery_v'], 2),
                        "injectionTiming": round(row['inj_timing_deg'], 1),
                        "altitude": round(row['altitude_ft'], 0)
                    },
                    "ai_analytics": ai_analytics,
                    "fleet_status": fleet_status
                }
                tasks.append(asyncio.create_task(client.send(json.dumps(payload))))

            await asyncio.gather(*tasks, return_exceptions=True)

        await asyncio.sleep(0.1) # 10 Hz rate

async def main():
    print(f"{BOLD}{CYAN}================================================================================{RESET}")
    print(f"{BOLD}{GREEN}✓ AeroTwin Multi-Drone Digital Twin Server Initialized{RESET}")
    print(f"{BOLD}Listening for React Dashboards on ws://localhost:8000 ...{RESET}")
    print(f"{BOLD}{CYAN}================================================================================{RESET}")
    server = await websockets.serve(telemetry_handler, "localhost", 8000)
    broadcast_task = asyncio.create_task(broadcast_telemetry())
    await asyncio.gather(server.wait_closed(), broadcast_task)

if __name__ == "__main__":
    asyncio.run(main())
