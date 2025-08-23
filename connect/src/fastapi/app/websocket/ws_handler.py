import json
import os
import base64
import pathlib
from fastapi import WebSocket, WebSocketDisconnect
from app.services.notifications import boradcast_notification
from app.services.file_service import save_file

clients=[]

async def websocket_endpoint(websocket : WebSocket):
    await websocket.accept()
    clients.append(websocket)
    print("Websocket client connected")
    try:
        while True:
            raw_message = await websocket.receive_text()
            try:
                data = json.loads(raw_message)
                if data.get("type")=="notification":
                    notification_data=json.loads(
                        base64.b64decode(data["data"]).decode("utf-8")
                    )
                    print("Parsed notification",notification_data)
                    
                    #broadcasr to all clients
                    
                    await boradcast_notification(notification_data,clients)
                    
                    await websocket.send_json({
                        "status":"success",
                        "message":"Notification rece"
                    })