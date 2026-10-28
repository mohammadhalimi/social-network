// app/components/profile/settings/__tests__/ChangeTheme.test.tsx
'use client';

import { ChangeTheme } from '../ChangeTheme';
import {
    render,
    screen,
    fireEvent
} from '@testing-library/react';

// ✅ mock Redux
const mockDispatch = jest.fn();
let mockTheme: 'light' | 'dark' = 'light';

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => selector({ theme: { theme: mockTheme } }),
}));

jest.mock('@/app/redux/features/themeSlice', () => ({
    toggleTheme: () => ({ type: 'TOGGLE_THEME' }),
}));

// ===================================================================
// Tests
// ===================================================================
describe('ChangeTheme', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTheme = 'light';
    });

    // ===============================================================
    // Light theme
    // ===============================================================
    describe('when theme is light', () => {
        it('shows Sun icon', () => {
            render(<ChangeTheme />);

            expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
        });

        it('shows "تم روشن" text', () => {
            render(<ChangeTheme />);

            expect(screen.getByText('تم روشن')).toBeInTheDocument();
        });

        it('toggle has data-theme="light"', () => {
            render(<ChangeTheme />);

            expect(screen.getByTestId('theme-toggle')).toHaveAttribute('data-theme', 'light');
        });
    });

    // ===============================================================
    // Dark theme
    // ===============================================================
    describe('when theme is dark', () => {
        beforeEach(() => {
            mockTheme = 'dark';
        });

        it('shows Moon icon', () => {
            render(<ChangeTheme />);

            expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
        });

        it('shows "تم تاریک" text', () => {
            render(<ChangeTheme />);

            expect(screen.getByText('تم تاریک')).toBeInTheDocument();
        });

        it('toggle has data-theme="dark"', () => {
            render(<ChangeTheme />);

            expect(screen.getByTestId('theme-toggle')).toHaveAttribute('data-theme', 'dark');
        });
    });

    // ===============================================================
    // Toggle
    // ===============================================================
    describe('toggle', () => {
        it('dispatches toggleTheme on click', () => {
            render(<ChangeTheme />);

            fireEvent.click(screen.getByTestId('theme-toggle'));

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_THEME' });
        });

        it('dispatches toggleTheme when theme is dark', () => {
            mockTheme = 'dark';

            render(<ChangeTheme />);

            fireEvent.click(screen.getByTestId('theme-toggle'));

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_THEME' });
        });
    });

    // ===============================================================
    // Title
    // ===============================================================
    it('renders title "تم"', () => {
        render(<ChangeTheme />);

        expect(screen.getByText('تم')).toBeInTheDocument();
    });
});