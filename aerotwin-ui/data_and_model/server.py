import asyncio
import websockets
import json
import time
import os

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

async def telemetry_handler(websocket, path=None):
    """
    Handles new React dashboard connections and listens for DRONE_SELECT commands.
    """
    client_drone_map[websocket] = 'TAPAS-01'
    print(f"[NET] New dashboard connected: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get('type') == 'SELECT_DRONE':
                    drone_id = data.get('drone_id', 'TAPAS-01')
                    client_drone_map[websocket] = drone_id
                    print(f"[COMMAND] Dashboard {websocket.remote_address} switched stream to: {drone_id}")
            except Exception:
                pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print(f"[NET] Dashboard disconnected: {websocket.remote_address}")
        connected_clients.remove(websocket)
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
            
        # 2. Live terminal heartbeat every 20 ticks (2 seconds)
        if tick_count % 20 == 0:
            t1 = drones_data['TAPAS-01']
            t2 = drones_data['TAPAS-02']
            t3 = drones_data['TAPAS-03']
            print(f"[AI FLEET STREAM | Tick #{tick_count}]")
            print(f"  * TAPAS-01 (Green) : RPM={t1['raw']['rpm']} | CHT={t1['raw']['cht_c']}C | Status={t1['ai']['severity'].upper()} | RUL={t1['ai']['rul_hours']}h")
            print(f"  * TAPAS-02 (Yellow): RPM={t2['raw']['rpm']} | CHT={t2['raw']['cht_c']}C | Status={t2['ai']['severity'].upper()} | RUL={t2['ai']['rul_hours']}h")
            print(f"  * TAPAS-03 (Red)   : RPM={t3['raw']['rpm']} | CHT={t3['raw']['cht_c']}C | Status={t3['ai']['severity'].upper()} | RUL={t3['ai']['rul_hours']}h")

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
    print("Starting AeroTwin Multi-Drone Telemetry Server on ws://localhost:8000 ...")
    server = await websockets.serve(telemetry_handler, "localhost", 8000)
    broadcast_task = asyncio.create_task(broadcast_telemetry())
    await asyncio.gather(server.wait_closed(), broadcast_task)

if __name__ == "__main__":
    asyncio.run(main())
