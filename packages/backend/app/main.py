from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Dict

app = FastAPI(title="PhysioAI")

# Updated CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
active_connections: Dict[str, WebSocket] = {}

@app.websocket("/ws/movement")
async def movement_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Process movement data
            await websocket.send_json({
                "status": "received",
                "metrics": {
                    "angle": 45.0,  # Placeholder values
                    "form_quality": 0.85,
                    "repetitions": 1
                },
                "points": [[100, 100], [200, 200], [300, 150]]  # Example visualization data
            })
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if websocket in active_connections.values():
            del active_connections[next(k for k, v in active_connections.items() if v == websocket)]

@app.websocket("/ws/analysis")
async def analysis_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Process analysis data
            await websocket.send_json({
                "status": "analyzed",
                "points": [[100, 100], [200, 200], [300, 150]]
            })
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)