import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Settings from '@/app/components/profile/settings';

import {
    render,
    screen,
    fireEvent
} from '@testing-library/react';

import
themeReducer,
{ toggleTheme }
    from '@/app/redux/features/themeSlice';

// ==========================================================
// Mock: lucide-react
// ==========================================================
jest.mock('lucide-react', () => ({
    Sun: () => <svg data-testid="sun-icon" />,
    Moon: () => <svg data-testid="moon-icon" />,
}));

// ==========================================================
// Mock: redux hooks
// ==========================================================
const mockDispatch = jest.fn();
let mockThemeState = { theme: 'light' };

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => {
        // ✅ بازگرداندن مقدار بر اساس selector
        return selector({ theme: mockThemeState });
    },
}));

// ==========================================================
// تابع کمکی برای ساخت Store
// ==========================================================
const createTestStore = (theme: 'light' | 'dark') => {
    return configureStore({
        reducer: {
            theme: themeReducer,
        },
        preloadedState: {
            theme: { theme },
        },
    });
};

describe('Settings Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockThemeState = { theme: 'light' };
    });

    // ==========================================================
    //  تست ۱: رندر صحیح کامپوننت
    // ==========================================================
    it('should render correctly', () => {
        const store = createTestStore('light');

        render(
            <Provider store={store}>
                <Settings />
            </Provider>
        );

        expect(screen.getByTestId('settings-component')).toBeInTheDocument();
        expect(screen.getByText('⚙️ تنظیمات')).toBeInTheDocument();
        expect(screen.getByText('تم')).toBeInTheDocument();
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۲: نمایش آیکون خورشید در حالت لایت
    // ==========================================================
    it('should show Sun icon in light mode', () => {
        mockThemeState = { theme: 'light' };
        const store = createTestStore('light');

        render(
            <Provider store={store}>
                <Settings />
            </Provider>
        );

        expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
        expect(screen.getByText('تم روشن')).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۳: نمایش آیکون ماه در حالت دارک
    // ==========================================================
    it('should show Moon icon in dark mode', () => {
        // ✅ تنظیم حالت دارک
        mockThemeState = { theme: 'dark' };
        const store = createTestStore('dark');

        render(
            <Provider store={store}>
                <Settings />
            </Provider>
        );

        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
        expect(screen.getByText('تم تاریک')).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۴: تغییر تم با کلیک روی دکمه
    // ==========================================================
    it('should dispatch toggleTheme when button is clicked', async () => {
        const user = userEvent.setup();
        mockThemeState = { theme: 'light' };
        const store = createTestStore('light');

        render(
            <Provider store={store}>
                <Settings />
            </Provider>
        );

        const toggleButton = screen.getByTestId('theme-toggle');
        await user.click(toggleButton);

        expect(mockDispatch).toHaveBeenCalledWith(toggleTheme());
    });

    // ==========================================================
    //  تست ۵: وضعیت دکمه کشویی در حالت لایت
    // ==========================================================
    it('should have correct toggle switch position in light mode', () => {
        mockThemeState = { theme: 'light' };
        const store = createTestStore('light');

        render(
            <Provider store={store}>
                <Settings />
            </Provider>
        );

        const toggleSwitch = screen.getByTestId('theme-toggle').querySelector('span');
        expect(toggleSwitch).toHaveClass('translate-x-0');
    });

    // ==========================================================
    //  تست ۶: وضعیت دکمه کشویی در حالت دارک
    // ==========================================================
    it('should have correct toggle switch position in dark mode', () => {
        // ✅ تنظیم حالت دارک
        mockThemeState = { theme: 'dark' };
        const store = createTestStore('dark');

        render(
            <Provider store={store}>
                <Settings />
            </Provider>
        );

        const toggleSwitch = screen.getByTestId('theme-toggle').querySelector('span');
        expect(toggleSwitch).toHaveClass('translate-x-6');
    });

    // ==========================================================
    //  تست ۷: ChangeTheme با Redux کار می‌کند
    // ==========================================================
    it('ChangeTheme component should work with Redux', () => {
        mockThemeState = { theme: 'light' };
        const store = createTestStore('light');

        render(
            <Provider store={store}>
                <Settings />
            </Provider>
        );

        expect(screen.getByText('تم روشن')).toBeInTheDocument();

        const toggleButton = screen.getByTestId('theme-toggle');
        fireEvent.click(toggleButton);

        expect(mockDispatch).toHaveBeenCalledWith(toggleTheme());
    });
});