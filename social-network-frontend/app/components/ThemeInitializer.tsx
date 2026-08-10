'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { initTheme } from '@/app/redux/features/themeSlice';

export function ThemeInitializer() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  useEffect(() => {
    // هماهنگی با DOM
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return null;
}