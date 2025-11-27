import asyncio
import json
import logging
from typing import Dict, Optional
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # user_id -> websocket
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            self.active_connections.pop(user_id)
            logger.info(f"User {user_id} disconnected from WebSocket")

    async def send_to_user(self, user_id: str, message: str):
        """Send a structured message to a specific user"""
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_text(message)
                logger.info(f"Message sent to user {user_id}: {message}")
                return True
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                # Remove disconnected websocket
                self.disconnect(user_id)
                return False
        else:
            logger.warning(f"No active connection found for user {user_id}")
            return False

    def is_user_connected(self, user_id: str) -> bool:
        """Check if a user is currently connected"""
        return user_id in self.active_connections
    
    async def broadcast_to_all(self, message: str, exclude_user_id: Optional[str] = None):
        """Broadcast a message to all connected users"""
        disconnected = []
        for user_id, websocket in self.active_connections.items():
            if user_id == exclude_user_id:
                continue
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                disconnected.append(user_id)
        
        # Remove disconnected users
        for user_id in disconnected:
            self.disconnect(user_id)
    
    async def send_location_update_to_route_users(self, route_id: str, location_data: dict, user_ids: list):
        """Send location update to specific users (brokers/shippers) for a route"""
        message = json.dumps({
            "type": "location_update",
            "route_id": route_id,
            "data": location_data,
            "timestamp": location_data.get("timestamp")
        })
        
        # Send to specific users only
        sent_count = 0
        for user_id in user_ids:
            if await self.send_to_user(user_id, message):
                sent_count += 1
        
        logger.info(f"Sent location update for route {route_id} to {sent_count}/{len(user_ids)} users")
    
    async def send_location_update_to_order_trackers(self, route_id: str, location_data: dict, order_ids: list):
        """Send location update to users tracking specific orders"""
        message = json.dumps({
            "type": "order_location_update",
            "route_id": route_id,
            "order_ids": order_ids,
            "data": location_data,
            "timestamp": location_data.get("timestamp")
        })
        
        # For now, broadcast to all users
        # In a more sophisticated implementation, you'd track which users are watching which orders
        await self.broadcast_to_all(message)
        logger.info(f"Sent location update for route {route_id} to order trackers: {order_ids}")

manager = ConnectionManager()