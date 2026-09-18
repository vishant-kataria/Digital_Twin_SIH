import asyncio
import websockets
import json
import pandas as pd
import time
import os

# Ensure the working directory is correct so we can find the CSV
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'normal_telemetry.csv')

print(f"Loading dataset from: {csv_path}...")
try:
    df = pd.read_csv(csv_path)
    print(f"Successfully loaded {len(df)} rows.")
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit(1)

# A set to keep track of all connected React dashboards
connected_clients = set()

async def telemetry_handler(websocket, path=None):
    """
    This function is called every time a new React dashboard connects.
    We add them to our connected_clients set.
    """
    print(f"New dashboard connected: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        # Keep the connection open and wait for messages (if any)
        # or wait until the client disconnects.
        async for message in websocket:
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print(f"Dashboard disconnected: {websocket.remote_address}")
        connected_clients.remove(websocket)

async def broadcast_telemetry():
    """
    This function runs in the background.
    It loops through the dataset and broadcasts the current row to ALL connected dashboards.
    """
    while True:
        # Loop through the dataset row by row
        for index, row in df.iterrows():
            
            # Map the CSV columns to what the React frontend expects
            payload = {
                "telemetry": {
                    "rpm": round(row['rpm'], 0),
                    "cht": round(row['cht_c'], 1),
                    "egt": round(row['egt_c'], 1),
                    "oilPress": round(row['oil_press_psi'], 2),
                    "fuelFlow": round(row['fuel_flow_lph'], 1),
                    "altitude": round(row['altitude_ft'], 0)
                },
                "ai_analytics": {
                    # 🚀 TODO FOR TEAMMATE: Insert LSTM model prediction here!
                    # Example: rul = model.predict(row)
                    # For now, we just pass the 'rul_hours' from the CSV
                    "rul_hours": round(row.get('rul_hours', 500), 1),
                    "fault_label": int(row.get('fault_label', 0))
                }
            }
            
            message = json.dumps(payload)
            
            # Send the payload to all connected clients
            if connected_clients:
                # Create tasks to send to all clients concurrently
                tasks = [asyncio.create_task(client.send(message)) for client in connected_clients]
                await asyncio.gather(*tasks, return_exceptions=True)
            
            # Wait 0.1 seconds (10 Hz update rate) before sending the next row
            await asyncio.sleep(0.1)

async def main():
    print("Starting AeroTwin Telemetry Server on ws://localhost:8000 ...")
    
    # Start the WebSocket server
    server = await websockets.serve(telemetry_handler, "localhost", 8000)
    
    # Run the broadcast loop concurrently
    broadcast_task = asyncio.create_task(broadcast_telemetry())
    
    # Keep the server running indefinitely
    await asyncio.gather(server.wait_closed(), broadcast_task)

if __name__ == "__main__":
    asyncio.run(main())
