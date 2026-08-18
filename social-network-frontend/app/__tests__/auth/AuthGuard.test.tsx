import '@testing-library/jest-dom';
import { AuthGuard } from '@/app/components/auth/AuthGuard';
import { render, screen, waitFor } from '@testing-library/react';

// ==========================================================
// Mock: next/navigation
// ==========================================================
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: mockPush })),
}));

// ==========================================================
// Mock: redux hooks
// ==========================================================
let mockAuthState = { isAuthenticated: false, loading: false };

jest.mock('@/app/redux/hooks', () => ({
    useAppSelector: (selector: any) => {
        const state = { auth: mockAuthState };
        return selector(state);
    },
}));

describe('AuthGuard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthState = { isAuthenticated: false, loading: false };
    });

    // ==========================================================
    //  تست ۱: رندر کودکان وقتی کاربر لاگین نیست
    // ==========================================================
    it('should render children when user is not authenticated', () => {
        mockAuthState = { isAuthenticated: false, loading: false };

        render(
            <AuthGuard>
                <div data-testid="children">محتوای صفحه</div>
            </AuthGuard>
        );

        expect(screen.getByTestId('children')).toBeInTheDocument();
        expect(screen.getByText('محتوای صفحه')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۲: هدایت به پروفایل وقتی کاربر لاگین است
    // ==========================================================
    it('should redirect to profile when user is authenticated', async () => {
        mockAuthState = { isAuthenticated: true, loading: false };

        render(
            <AuthGuard>
                <div>محتوای صفحه</div>
            </AuthGuard>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/profile');
        });
    });

    // ==========================================================
    //  تست ۳: نمایش لودینگ در حالت loading
    // ==========================================================
    it('should show loading spinner when loading is true', () => {
        mockAuthState = { isAuthenticated: false, loading: true };

        render(
            <AuthGuard>
                <div>محتوای صفحه</div>
            </AuthGuard>
        );

        expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
        expect(screen.queryByText('محتوای صفحه')).not.toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۴: رندر null وقتی کاربر لاگین است
    // ==========================================================
    it('should render null when user is authenticated (after redirect)', () => {
        mockAuthState = { isAuthenticated: true, loading: false };

        const { container } = render(
            <AuthGuard>
                <div>محتوای صفحه</div>
            </AuthGuard>
        );

        // در حین رندر اولیه، کودکان نمایش داده نمی‌شوند
        expect(container.firstChild).toBeNull();
        expect(screen.queryByText('محتوای صفحه')).not.toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۵: از لودینگ به لاگین
    // ==========================================================
    it('should transition from loading to render children', async () => {
        // حالت اول: لودینگ
        mockAuthState = { isAuthenticated: false, loading: true };

        const { rerender } = render(
            <AuthGuard>
                <div data-testid="children">محتوای صفحه</div>
            </AuthGuard>
        );

        expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
        expect(screen.queryByTestId('children')).not.toBeInTheDocument();

        // حالت دوم: لودینگ تمام شد و کاربر لاگین نیست
        mockAuthState = { isAuthenticated: false, loading: false };

        rerender(
            <AuthGuard>
                <div data-testid="children">محتوای صفحه</div>
            </AuthGuard>
        );

        await waitFor(() => {
            expect(screen.getByTestId('children')).toBeInTheDocument();
            expect(screen.getByText('محتوای صفحه')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۶: از لودینگ به هدایت به پروفایل
    // ==========================================================
    it('should transition from loading to redirect to profile', async () => {
        // حالت اول: لودینگ
        mockAuthState = { isAuthenticated: false, loading: true };

        const { rerender } = render(
            <AuthGuard>
                <div>محتوای صفحه</div>
            </AuthGuard>
        );

        expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();

        // حالت دوم: کاربر لاگین شد
        mockAuthState = { isAuthenticated: true, loading: false };

        rerender(
            <AuthGuard>
                <div>محتوای صفحه</div>
            </AuthGuard>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/profile');
        });
    });
});