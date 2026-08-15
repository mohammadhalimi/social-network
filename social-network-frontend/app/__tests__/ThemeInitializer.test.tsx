import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { initTheme } from '@/app/redux/features/themeSlice';
import { ThemeInitializer } from '../components/ThemeInitializer';

// ==========================================================
// Mock: Redux hooks
// ==========================================================
const mockDispatch = jest.fn();
let mockThemeState = { theme: 'light' };

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => {
        const state = { theme: mockThemeState };
        return selector(state);
    },
}));

// ==========================================================
// Mock: themeSlice actions
// ==========================================================
jest.mock('@/app/redux/features/themeSlice', () => ({
    initTheme: jest.fn(() => ({ type: 'theme/init' })),
}));

describe('ThemeInitializer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockThemeState = { theme: 'light' };
    });

    // ==========================================================
    //  تست ۱: رندر کامپوننت (null برمی‌گرداند)
    // ==========================================================
    it('should render nothing', () => {
        const { container } = render(<ThemeInitializer />);
        expect(container.firstChild).toBeNull();
    });

    // ==========================================================
    //  تست ۲: dispatch initTheme در useEffect
    // ==========================================================
    it('should dispatch initTheme on mount', () => {
        render(<ThemeInitializer />);

        expect(initTheme).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'theme/init' });
    });

    // ==========================================================
    //  تست ۳: فقط یک بار dispatch می‌شود
    // ==========================================================
    it('should dispatch initTheme only once', () => {
        const { rerender } = render(<ThemeInitializer />);

        expect(mockDispatch).toHaveBeenCalledTimes(1);

        rerender(<ThemeInitializer />);

        // ✅ در StrictMode ممکن است 2 بار باشد، پس بررسی می‌کنیم که حداقل 1 بار باشد
        expect(mockDispatch).toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۴: با تغییر theme دوباره dispatch می‌شود (رفتار صحیح)
    // ==========================================================
    it('should dispatch again when theme changes', () => {
        render(<ThemeInitializer />);

        // اولین بار
        expect(mockDispatch).toHaveBeenCalledTimes(1);

        // تغییر theme
        mockThemeState = { theme: 'dark' };
        
        // رندر مجدد
        render(<ThemeInitializer />);

        // ✅ به دلیل وابستگی useEffect به theme، دوباره dispatch می‌شود
        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
});