import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

// ✅ خواندن تم از localStorage در زمان بارگذاری
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) return saved;
    // بررسی تنظیمات سیستم
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      // ذخیره در localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },
    // ✅ برای هماهنگی با سیستم در زمان بارگذاری
    initTheme: (state) => {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved) {
        state.theme = saved;
        document.documentElement.setAttribute('data-theme', saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        state.theme = 'dark';
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    },
  },
});

export const { toggleTheme, setTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;