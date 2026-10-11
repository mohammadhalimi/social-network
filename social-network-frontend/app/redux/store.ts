import uiReducer from './uiSlice';
import authReducer from './features/authSlice';
import themeReducer from './features/themeSlice'; 
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;