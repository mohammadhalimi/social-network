// __tests__/NotificationBell.test.tsx
'use client';

import { NotificationBell } from '../NotificationBell';
import {
    render,
    screen,
    fireEvent
} from '@testing-library/react';

// ✅ mock کردن useNotifications
jest.mock('@/app/hooks/useNotifications', () => ({
    useNotifications: jest.fn(),
}));

// ✅ mock کردن NotificationBadge
jest.mock('../NotificationBadge', () => ({
    NotificationBadge: ({ count }: { count: number }) => (
        <div data-testid="notification-badge">{count}</div>
    ),
}));

// ✅ mock کردن NotificationDropdown
jest.mock('../NotificationDropdown', () => ({
    NotificationDropdown: ({ onClose, unreadCount, loading }: any) => (
        <div data-testid="notification-dropdown">
            <button data-testid="close-btn" onClick={onClose}>close</button>
            <span data-testid="dropdown-unread">{unreadCount}</span>
            <span data-testid="dropdown-loading">{String(loading)}</span>
        </div>
    ),
}));

import { useNotifications } from '@/app/hooks/useNotifications';
const mockUseNotifications = useNotifications as jest.Mock;

// ===================================================================
// NotificationBell
// ===================================================================
describe('NotificationBell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNotifications.mockReturnValue({
            notifications: [],
            unreadCount: 0,
            loading: false,
        });
    });

    // ===============================================================
    // Render اولیه
    // ===============================================================
    it('renders bell icon and badge', () => {
        render(<NotificationBell />);

        expect(screen.getByRole('button', { name: /اعلان‌ها/i })).toBeInTheDocument();
        expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    });

    it('passes unreadCount to badge', () => {
        mockUseNotifications.mockReturnValue({
            notifications: [],
            unreadCount: 5,
            loading: false,
        });

        render(<NotificationBell />);

        expect(screen.getByTestId('notification-badge')).toHaveTextContent('5');
    });

    it('does not render dropdown initially', () => {
        render(<NotificationBell />);

        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
    });

    // ===============================================================
    // Toggle
    // ===============================================================
    it('opens dropdown on button click', () => {
        render(<NotificationBell />);

        fireEvent.click(screen.getByRole('button', { name: /اعلان‌ها/i }));

        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    });

    it('closes dropdown on second button click', () => {
        render(<NotificationBell />);

        const button = screen.getByRole('button', { name: /اعلان‌ها/i });

        fireEvent.click(button);
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
    });

    it('sets aria-expanded correctly', () => {
        render(<NotificationBell />);

        const button = screen.getByRole('button', { name: /اعلان‌ها/i });

        expect(button).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // ===============================================================
    // کلیک بیرون
    // ===============================================================
    it('closes dropdown on outside click', () => {
        render(<NotificationBell />);

        fireEvent.click(screen.getByRole('button', { name: /اعلان‌ها/i }));
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

        // ✅ کلیک بیرون (روی body)
        fireEvent.mouseDown(document.body);

        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
    });

    it('does not close dropdown on inside click', () => {
        render(<NotificationBell />);

        fireEvent.click(screen.getByRole('button', { name: /اعلان‌ها/i }));
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

        // ✅ کلیک داخل dropdown (نه بیرون)
        fireEvent.mouseDown(screen.getByTestId('notification-dropdown'));

        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    });

    it('does not add mousedown listener when closed', () => {
        const addSpy = jest.spyOn(document, 'addEventListener');
        const removeSpy = jest.spyOn(document, 'removeEventListener');

        render(<NotificationBell />);

        // ✅ listener برای mousedown اضافه نشده (چون isOpen = false)
        expect(addSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));

        addSpy.mockRestore();
        removeSpy.mockRestore();
    });

    // ===============================================================
    // Props به dropdown
    // ===============================================================
    it('passes notifications, unreadCount, loading to dropdown', () => {
        mockUseNotifications.mockReturnValue({
            notifications: [{ id: '1' }],
            unreadCount: 3,
            loading: true,
        });

        render(<NotificationBell />);
        fireEvent.click(screen.getByRole('button', { name: /اعلان‌ها/i }));

        expect(screen.getByTestId('dropdown-unread')).toHaveTextContent('3');
        expect(screen.getByTestId('dropdown-loading')).toHaveTextContent('true');
    });

    it('closes dropdown via onClose', () => {
        render(<NotificationBell />);

        fireEvent.click(screen.getByRole('button', { name: /اعلان‌ها/i }));
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

        // ✅ onClose رو صدا بزن
        fireEvent.click(screen.getByTestId('close-btn'));

        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
    });

    // ===============================================================
    // Cleanup
    // ===============================================================
    it('removes mousedown listener on unmount', () => {
        const removeSpy = jest.spyOn(document, 'removeEventListener');

        const { unmount } = render(<NotificationBell />);

        fireEvent.click(screen.getByRole('button', { name: /اعلان‌ها/i }));

        unmount();

        expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

        removeSpy.mockRestore();
    });
});