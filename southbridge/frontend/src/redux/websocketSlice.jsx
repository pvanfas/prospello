import { createSlice } from '@reduxjs/toolkit';

const websocketSlice = createSlice({
  name: 'websocket',
  initialState: {
    socket: null,
    isConnected: false,
    isRefreshing: false,
    messages: [],
    notifications: []
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
      state.isConnected = !!action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      
      // Add to notifications if it's a notification type
      if (action.payload.type === 'bid_accepted' || action.payload.type === 'order_update' || action.payload.type === 'order_completed') {
        state.notifications.push({
          id: Date.now(),
          ...action.payload,
          read: false,
          timestamp: action.payload.timestamp || new Date().toISOString()
        });
      }
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    disconnect: (state) => {
      state.socket = null;
      state.isConnected = false;
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    }
  }
});

export const { 
  setSocket, 
  addMessage, 
  markNotificationRead, 
  clearNotifications, 
  disconnect,
  setRefreshing
} = websocketSlice.actions;

export default websocketSlice.reducer;