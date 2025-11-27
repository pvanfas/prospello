// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice'
import websocketReducer from './websocketSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only persist auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  websocket: websocketReducer, // Make sure this line exists
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/FLUSH',
          'persist/PURGE',
          'persist/REGISTER',
          'websocket/setSocket',
        ],
        ignoredActionsPaths: ['payload.socket'],
        ignoredPaths: ['websocket.socket'],
      },
    }),
});

export const persistor = persistStore(store);
