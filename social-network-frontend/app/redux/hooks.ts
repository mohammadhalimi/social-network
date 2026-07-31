import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// ✅ استفاده در سراسر پروژه به جای useDispatch و useSelector معمولی
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();