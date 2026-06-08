import React from 'react';
import useWebSocket from '../hooks/useWebsocket';

const WebSocketProvider = ({ children }) => {
  // This will automatically connect/disconnect WebSocket based on auth state
  useWebSocket();
  
  return children;
};

export default WebSocketProvider;