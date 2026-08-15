import '@testing-library/jest-dom';
import {  usePathname } from 'next/navigation';
import { render, waitFor } from '@testing-library/react';
import AuthChecker from '../components/auth/AuthChecker';
import { loginSuccess, logout } from '@/app/redux/features/authSlice';

// ==========================================================
// Mock: next/navigation
// ==========================================================
const mockPush = jest.fn();
const mockPathname = '/profile';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: mockPush })),
    usePathname: jest.fn(() => mockPathname),
}));

// ==========================================================
// Mock: Apollo useQuery
// ==========================================================
const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
    useQuery: (...args: any[]) => mockUseQuery(...args),
}));

// ==========================================================
// Mock: Redux hooks
// ==========================================================
const mockDispatch = jest.fn();
let mockToken = 'fake-token';

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => {
        const state = { auth: { token: mockToken } };
        return selector(state);
    },
}));

// ==========================================================
// Mock: authSlice actions
// ==========================================================
jest.mock('@/app/redux/features/authSlice', () => ({
    loginSuccess: jest.fn((payload) => ({ type: 'auth/loginSuccess', payload })),
    logout: jest.fn(() => ({ type: 'auth/logout' })),
}));

describe('AuthChecker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockToken = 'fake-token';
        mockUseQuery.mockReturnValue({
            data: null,
            loading: false,
            error: null,
        });
    });

    // ==========================================================
    //  تست ۱: رندر کامپوننت (null برمی‌گرداند)
    // ==========================================================
    it('should render nothing', () => {
        const { container } = render(<AuthChecker />);
        // ✅ بررسی اینکه کامپوننت چیزی رندر نمی‌کند
        expect(container.firstChild).toBeNull();
    });

    // ==========================================================
    //  تست ۲: وقتی توکن وجود ندارد، درخواست ارسال نمی‌شود
    // ==========================================================
    it('should skip query when token is missing', () => {
        mockToken = '';
        render(<AuthChecker />);
        expect(mockUseQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ skip: true })
        );
    });

    // ==========================================================
    //  تست ۳: وقتی توکن وجود دارد، درخواست ارسال می‌شود
    // ==========================================================
    it('should not skip query when token exists', () => {
        mockToken = 'fake-token';
        render(<AuthChecker />);
        expect(mockUseQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ skip: false })
        );
    });

    // ==========================================================
    //  تست ۴: وقتی کاربر لاگین است، loginSuccess dispatch می‌شود
    // ==========================================================
    it('should dispatch loginSuccess when user is authenticated', async () => {
        const mockUser = {
            id: 'cm123',
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'کاربر تست',
            bio: null,
            avatar: null,
            createdAt: '2026-01-01T12:00:00.000Z',
            updatedAt: '2026-01-01T12:00:00.000Z',
        };

        mockUseQuery.mockReturnValue({
            data: { me: mockUser },
            loading: false,
            error: null,
        });

        render(<AuthChecker />);

        await waitFor(() => {
            expect(loginSuccess).toHaveBeenCalledWith({
                user: mockUser,
                token: 'fake-token',
            });
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'auth/loginSuccess',
                payload: { user: mockUser, token: 'fake-token' },
            });
        });
    });

    // ==========================================================
    //  تست ۵: وقتی کاربر لاگین نیست، logout dispatch می‌شود
    // ==========================================================
    it('should dispatch logout when user is not authenticated', async () => {
        mockUseQuery.mockReturnValue({
            data: { me: null },
            loading: false,
            error: null,
        });

        render(<AuthChecker />);

        await waitFor(() => {
            expect(logout).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/logout' });
        });
    });

    // ==========================================================
    //  تست ۶: هدایت به لاگین در مسیر /profile
    // ==========================================================
    it('should redirect to login when on /profile and not authenticated', async () => {
        mockUseQuery.mockReturnValue({
            data: { me: null },
            loading: false,
            error: null,
        });

        render(<AuthChecker />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });
    });

    // ==========================================================
    //  تست ۷: در مسیرهای غیر از /profile هدایت نمی‌شود
    // ==========================================================
    it('should not redirect when not on /profile path', async () => {
        const mockPathnameNotProfile = '/other';
        (usePathname as jest.Mock).mockReturnValue(mockPathnameNotProfile);

        mockUseQuery.mockReturnValue({
            data: { me: null },
            loading: false,
            error: null,
        });

        render(<AuthChecker />);

        await waitFor(() => {
            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۸: فقط یک بار اجرا می‌شود (useRef)
    // ==========================================================
    it('should only run once (useRef check)', async () => {
        const mockUser = {
            id: 'cm123',
            email: 'test@example.com',
            username: 'testuser',
            fullName: 'کاربر تست',
            bio: null,
            avatar: null,
            createdAt: '2026-01-01T12:00:00.000Z',
            updatedAt: '2026-01-01T12:00:00.000Z',
        };

        mockUseQuery.mockReturnValue({
            data: { me: mockUser },
            loading: false,
            error: null,
        });

        const { rerender } = render(<AuthChecker />);
        
        await waitFor(() => {
            expect(loginSuccess).toHaveBeenCalledTimes(1);
        });

        mockUseQuery.mockReturnValue({
            data: { me: mockUser },
            loading: false,
            error: null,
        });
        
        rerender(<AuthChecker />);
        
        expect(loginSuccess).toHaveBeenCalledTimes(1);
    });

    // ==========================================================
    //  تست ۹: در حالت loading کاری انجام نمی‌دهد
    // ==========================================================
    it('should do nothing while loading', () => {
        mockUseQuery.mockReturnValue({
            data: null,
            loading: true,
            error: null,
        });

        render(<AuthChecker />);

        expect(loginSuccess).not.toHaveBeenCalled();
        expect(logout).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });
});