import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	accessToken: null,
	refreshToken: null,
	user: null,
	isAuthenticated: false,
	isRefreshing: false,
};

// Debug: Log initial state (only in development)
if (import.meta.env.DEV) {
	console.log('🔧 Auth slice initialized with state:', {
		hasAccessToken: !!initialState.accessToken,
		hasRefreshToken: !!initialState.refreshToken,
		isAuthenticated: initialState.isAuthenticated
	});
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		loginSuccess: (state, action) => {
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.user = action.payload.user;
			state.isAuthenticated = true;
			
			// Debug: Log successful login (only in development)
			if (import.meta.env.DEV) {
				console.log('🔐 Login successful - tokens stored:', {
					hasAccessToken: !!action.payload.accessToken,
					hasRefreshToken: !!action.payload.refreshToken,
					accessTokenPreview: action.payload.accessToken ? `${action.payload.accessToken.substring(0, 20)}...` : 'None'
				});
			}
		},
		logout: (state) => {
			state.accessToken = null;
			state.refreshToken = null;
			state.user = null;
			state.isAuthenticated = false;
		},
		refreshTokenSuccess: (state, action) => {
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			// Note: isRefreshing will be reset by the API interceptor finally block
			
			// Debug: Log successful refresh (only in development)
			if (import.meta.env.DEV) {
				console.log('🔄 Token refresh successful - new tokens stored:', {
					hasAccessToken: !!action.payload.accessToken,
					hasRefreshToken: !!action.payload.refreshToken,
					accessTokenPreview: action.payload.accessToken ? `${action.payload.accessToken.substring(0, 20)}...` : 'None'
				});
			}
		},
		setRefreshing: (state, action) => {
			state.isRefreshing = action.payload;
		},
		updateUser: (state, action) => {
			state.user = action.payload.user;
		},
	},
});

export const { loginSuccess, logout, refreshTokenSuccess, updateUser, setRefreshing } = authSlice.actions;
export default authSlice.reducer;
