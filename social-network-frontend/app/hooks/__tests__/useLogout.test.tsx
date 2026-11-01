// app/hooks/__tests__/useLogout.test.tsx

import toast from 'react-hot-toast';
import { useLogout } from '../useLogout';
import {
    renderHook,
    act
} from '@testing-library/react';

// ✅ mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// ✅ mock Redux
const mockDispatch = jest.fn();
jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('@/app/redux/features/authSlice', () => ({
    logout: () => ({ type: 'LOGOUT' }),
}));

// ✅ mock Apollo
const mockLogoutMutation = jest.fn();
jest.mock('@apollo/client/react', () => ({
    useMutation: () => [mockLogoutMutation],
}));

// ✅ mock toast
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: { success: jest.fn(), error: jest.fn() },
}));

describe('useLogout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls logoutMutation, dispatches logout, shows toast, and redirects on success', async () => {
        mockLogoutMutation.mockResolvedValue({
            data: { logout: { success: true } },
        });

        const { result } = renderHook(() => useLogout());

        await act(async () => {
            await result.current.handleLogout();
        });

        // ✅ چک کردن فراخوانی mutation
        expect(mockLogoutMutation).toHaveBeenCalledTimes(1);
        
        // ✅ چک کردن پاک شدن State ریداکس
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
        
        // ✅ چک کردن نمایش پیام موفقیت
        expect(toast.success).toHaveBeenCalledWith('✅ با موفقیت خارج شدید!');
        
        // ✅ چک کردن ریدایرکت
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });

    it('shows error toast when logout returns success=false', async () => {
        mockLogoutMutation.mockResolvedValue({
            data: { logout: { success: false } },
        });

        const { result } = renderHook(() => useLogout());

        await act(async () => {
            await result.current.handleLogout();
        });

        expect(toast.error).toHaveBeenCalledWith('❌ خطا در خروج از حساب');
        expect(mockDispatch).not.toHaveBeenCalled(); // ❌ دیتا نباید پاک بشه
        expect(mockPush).not.toHaveBeenCalled();     // ❌ ریدایرکت نباید بشه
    });

    it('shows error toast when mutation throws (network error)', async () => {
        mockLogoutMutation.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useLogout());

        await act(async () => {
            await result.current.handleLogout();
        });

        expect(toast.error).toHaveBeenCalledWith('❌ خطا در خروج از حساب');
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });
});