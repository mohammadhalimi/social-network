import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ✅ نوع‌های TypeScript برای استفاده در کل پروژه
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;