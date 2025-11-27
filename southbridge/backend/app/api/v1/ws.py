
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from app.services.websocket_manager import manager
from app.core.security import verify_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    try:
        logger.info(f"WebSocket connection attempt for user {user_id}")
        logger.info(f"Query params: {websocket.query_params}")
        
        # Expect JWT token as a query parameter: /ws/{user_id}?token=...
        token = websocket.query_params.get("token")
        logger.info(f"Token received: {token is not None}")
        
        # Token validation - JWT authentication enabled
        if not token or not verify_token(token, "access"):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)  
            logger.warning(f"WebSocket connection rejected for user {user_id}: Invalid or missing token.")
            return

        logger.info(f"Attempting to connect user {user_id}")
        await manager.connect(user_id, websocket)
        logger.info(f"User {user_id} successfully connected")
    except Exception as e:
        logger.error(f"Error in WebSocket endpoint for user {user_id}: {e}")
        await websocket.close(code=1011)  # Internal server error
        return
    try:
        while True:
            # Keep the connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # You can handle incoming messages here if needed
            logger.info(f"Received message from {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        
