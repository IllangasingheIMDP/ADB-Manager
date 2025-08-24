from fastapi import FastAPI,Websocket,WebSocketDisconnect
from app.api import devices
from app.websocket.ws_handler import websocket_endpoint


app = FastAPI()

app.include_router(devices.router,prefix="/api")

app.add_api_websocket_route("/ws",websocket_endpoint)