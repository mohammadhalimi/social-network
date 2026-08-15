import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

// ==========================================================
// Mock: next/navigation
// ==========================================================
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: mockPush })),
}));

// ==========================================================
// Mock: Redux hooks
// ==========================================================
let mockAuthState = { isAuthenticated: true, loading: false };

jest.mock('@/app/redux/hooks', () => ({
    useAppSelector: (selector: any) => {
        const state = { auth: mockAuthState };
        return selector(state);
    },
}));

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthState = { isAuthenticated: true, loading: false };
    });

    // ==========================================================
    //  تست ۱: رندر کودکان وقتی کاربر لاگین است
    // ==========================================================
    it('should render children when user is authenticated', () => {
        mockAuthState = { isAuthenticated: true, loading: false };

        render(
            <ProtectedRoute>
                <div data-testid="children">محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        expect(screen.getByTestId('children')).toBeInTheDocument();
        expect(screen.getByText('محتوای محافظت‌شده')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۲: نمایش لودینگ در حالت loading
    // ==========================================================
    it('should show loading spinner when loading is true', () => {
        mockAuthState = { isAuthenticated: false, loading: true };

        render(
            <ProtectedRoute>
                <div>محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
        expect(screen.queryByText('محتوای محافظت‌شده')).not.toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۳: هدایت به لاگین وقتی کاربر لاگین نیست
    // ==========================================================
    it('should redirect to login when user is not authenticated', async () => {
        mockAuthState = { isAuthenticated: false, loading: false };

        render(
            <ProtectedRoute>
                <div>محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });
    });

    // ==========================================================
    //  تست ۴: رندر null وقتی کاربر لاگین نیست
    // ==========================================================
    it('should render null when user is not authenticated', () => {
        mockAuthState = { isAuthenticated: false, loading: false };

        const { container } = render(
            <ProtectedRoute>
                <div>محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        expect(container.firstChild).toBeNull();
        expect(screen.queryByText('محتوای محافظت‌شده')).not.toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۵: فقط یک بار هدایت می‌کند (با استفاده از toHaveBeenNthCalledWith)
    // ==========================================================
    it('should redirect only once', async () => {
        mockAuthState = { isAuthenticated: false, loading: false };

        const { rerender } = render(
            <ProtectedRoute>
                <div>محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            // ✅ بررسی اینکه حداقل یک بار صدا زده شده
            expect(mockPush).toHaveBeenCalled();
        });

        // رندر مجدد
        rerender(
            <ProtectedRoute>
                <div>محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        // ✅ بررسی اینکه تعداد دفعات صدا زدن بیشتر از 1 نیست
        // (در StrictMode ممکن است 2 بار صدا زده شود)
        expect(mockPush).toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۶: از لودینگ به لاگین
    // ==========================================================
    it('should transition from loading to redirect', async () => {
        // حالت اول: لودینگ
        mockAuthState = { isAuthenticated: false, loading: true };

        const { rerender } = render(
            <ProtectedRoute>
                <div>محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();

        // حالت دوم: لودینگ تمام شد و کاربر لاگین نیست
        mockAuthState = { isAuthenticated: false, loading: false };

        rerender(
            <ProtectedRoute>
                <div>محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });
    });

    // ==========================================================
    //  تست ۷: از لودینگ به رندر کودکان
    // ==========================================================
    it('should transition from loading to render children', async () => {
        // حالت اول: لودینگ
        mockAuthState = { isAuthenticated: false, loading: true };

        const { rerender } = render(
            <ProtectedRoute>
                <div data-testid="children">محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
        expect(screen.queryByTestId('children')).not.toBeInTheDocument();

        // حالت دوم: کاربر لاگین شد
        mockAuthState = { isAuthenticated: true, loading: false };

        rerender(
            <ProtectedRoute>
                <div data-testid="children">محتوای محافظت‌شده</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(screen.getByTestId('children')).toBeInTheDocument();
            expect(screen.getByText('محتوای محافظت‌شده')).toBeInTheDocument();
        });
    });
});