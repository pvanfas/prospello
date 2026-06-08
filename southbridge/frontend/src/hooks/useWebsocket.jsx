import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSocket, addMessage, disconnect, setRefreshing } from '../redux/websocketSlice';
import { refreshTokenSuccess } from '../redux/authSlice';
import { useToast } from '../components/Toast';
import useAuth from './useAuth';
import { store } from '../redux/store';
import { baseURL } from '../services/api';

// Use WebSocket URL from environment variable
const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000';
const useWebSocket = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user, isAuthenticated, accessToken } = useAuth();
  const websocketState = useSelector(state => state.websocket || {});
  
  // Reconnection state
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // Start with 1 second

  // Reconnection function
  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('🔴 WebSocket: Max reconnection attempts reached');
      showToast("error", "WebSocket connection failed. Please refresh the page.");
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1); // Exponential backoff
    
    console.log(`🔄 WebSocket: Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && user?.id && accessToken) {
        connectWebSocket();
      }
    }, delay);
  };

  // WebSocket connection function
  const connectWebSocket = () => {
    // Get the latest token from Redux state
    const currentState = store.getState();
    const currentAccessToken = currentState.auth.accessToken;
    
    if (!isAuthenticated || !user?.id || !currentAccessToken) {
      console.log('🔴 WebSocket: Cannot connect - missing authentication', {
        isAuthenticated,
        userId: user?.id,
        hasToken: !!currentAccessToken
      });
      return;
    }

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection
    if (websocketState.socket) {
      websocketState.socket.close();
      dispatch(disconnect());
    }

    console.log('🔌 WebSocket: Attempting to connect with token:', currentAccessToken.substring(0, 20) + '...');
    const ws = new WebSocket(`${wsUrl}/api/v1/ws/${user.id}?token=${currentAccessToken}`);
    
    ws.onopen = () => {
      console.log('✅ WebSocket: Connected successfully');
      reconnectAttemptsRef.current = 0; // Reset reconnection attempts
      dispatch(setSocket(ws));
      // showToast("success", "Live tracking connected"); // Commented out - too frequent
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket: Message received:', data);
        
        dispatch(addMessage(data));
        
        // Handle different message types
        if (data.type === 'bid_accepted') {
          showToast("success", `${data.message}`);
        }

        if (data.type === 'order_accepted') {
          showToast("success", `${data.message}`);
        }
        
        if (data.type === 'order_completed') {
          showToast("info", `${data.message}`);
        }

      } catch (error) {
        console.error('❌ WebSocket: Error parsing message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('🔴 WebSocket: Disconnected with code:', event.code);
      dispatch(disconnect());
      
      // Handle different close codes
      if (event.code === 1008) {
        console.log('🔐 WebSocket: Authentication failed - token invalid/expired');
        showToast("warning", "Authentication expired. Attempting to refresh...");
        
        // Automatically try to refresh token and reconnect
        setTimeout(() => {
          refreshTokenAndReconnect();
        }, 1000);
        return;
      }
      
      // Only attempt reconnection if it wasn't a manual close
      if (event.code !== 1000 && isAuthenticated && user?.id) {
        console.log('🔄 WebSocket: Connection lost, attempting reconnection...');
        attemptReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket: Connection error:', error);
      dispatch(disconnect());
      
      // Attempt reconnection on error
      if (isAuthenticated && user?.id) {
        console.log('🔄 WebSocket: Error occurred, attempting reconnection...');
        attemptReconnect();
      }
    };
  };

  useEffect(() => {
    console.log('🔄 WebSocket: useEffect triggered', { 
      isAuthenticated, 
      userId: user?.id, 
      hasAccessToken: !!accessToken,
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'None'
    });
    
    if (!isAuthenticated || !user?.id) {
      // Clear reconnection timeout if not authenticated
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Disconnect if not authenticated
      if (websocketState.socket) {
        websocketState.socket.close();
        dispatch(disconnect());
      }
      return;
    }

    // Reset reconnection attempts when user/token changes
    reconnectAttemptsRef.current = 0;
    
    // Connect WebSocket with latest token
    connectWebSocket();

    // Cleanup on unmount or dependency change
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (websocketState.socket && websocketState.socket.readyState === WebSocket.OPEN) {
        websocketState.socket.close(1000, 'Component unmounting'); // Normal closure
      }
    };
  }, [isAuthenticated, user?.id, accessToken, dispatch]);

  // Manual reconnection function
  const manualReconnect = () => {
    console.log('🔄 WebSocket: Manual reconnection requested');
    reconnectAttemptsRef.current = 0; // Reset attempts
    connectWebSocket();
  };

  // Token refresh function
  const refreshTokenAndReconnect = async () => {
    try {
      console.log('🔄 WebSocket: Refreshing token and reconnecting...');
      
      // Set refreshing state
      dispatch(setRefreshing(true));
      
      // Get current state
      const state = store.getState();
      const { refreshToken } = state.auth;
      
      if (!refreshToken) {
        console.error('❌ WebSocket: No refresh token available');
        showToast("error", "Please login again.");
        return;
      }
      
      // Call refresh API directly
      const response = await fetch(`${baseURL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      console.log('✅ WebSocket: Token refresh successful');
      
      // Update Redux store with new tokens
      store.dispatch(refreshTokenSuccess({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      }));
      
      console.log('✅ WebSocket: Token updated in Redux store');
      
      // The useEffect will automatically trigger WebSocket reconnection 
      // when accessToken changes, so we don't need to manually call connectWebSocket
      
      showToast("success", "Authentication refreshed. Reconnecting...");
      
    } catch (error) {
      console.error('❌ WebSocket: Token refresh failed:', error);
      showToast("error", "Authentication failed. Please login again.");
    } finally {
      // Reset refreshing state
      dispatch(setRefreshing(false));
    }
  };

  return {
    ...websocketState,
    manualReconnect,
    refreshTokenAndReconnect
  };
};

export default useWebSocket;