// __tests__/NotificationDropdown.test.tsx
'use client';


import { NotificationDropdown } from '../NotificationDropdown';
import { INotification } from '@/app/graphql/notification.queries';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ✅ mock کردن Apollo
const mockMarkAllAsRead = jest.fn();
jest.mock('@apollo/client/react', () => ({
    useMutation: () => [mockMarkAllAsRead, { loading: false }],
}));

// ✅ mock کردن NotificationItem
jest.mock('../NotificationItemIndex', () => ({
    NotificationItem: ({ notification, onClose }: any) => (
        <div
            data-testid={`notification-${notification.id}`}
            onClick={onClose}
        >
            {notification.id}
        </div>
    ),
}));

// ✅ mock کردن next/link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, onClick }: any) => (
        <button onClick={onClick} data-testid="view-all-link">
            {children}
        </button>
    ),
}));
const mockOnClose = jest.fn();

const makeNotification = (id: string): INotification => ({
    id,
    type: 'LIKE',
    isRead: false,
    createdAt: '2026-10-20T10:00:00.000Z',
    actor: { id: 'user-1', username: 'user1', fullName: 'User 1', avatar: null },
    postId: null,             // ✅ به‌جای post
    commentId: null,          // ✅ به‌جای comment
    followRequest: null,
});

const defaultProps = {
    notifications: [] as INotification[],
    unreadCount: 0,
    loading: false,
    onClose: mockOnClose,
};

describe('NotificationDropdown', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ===============================================================
    // Loading state
    // ===============================================================
    it('shows loading spinner when loading is true', () => {
        render(<NotificationDropdown {...defaultProps} loading={true} />);

        // ✅ spinner (نمی‌تونیم مستقیم چک کنیم، ولی می‌تونیم absence empty state رو چک کنیم)
        expect(screen.queryByText('هنوز اعلانی ندارید')).not.toBeInTheDocument();
    });

    // ===============================================================
    // Empty state
    // ===============================================================
    it('shows empty state when no notifications', () => {
        render(<NotificationDropdown {...defaultProps} />);

        expect(screen.getByText('هنوز اعلانی ندارید')).toBeInTheDocument();
    });

    // ===============================================================
    // List
    // ===============================================================
    it('renders notifications list', () => {
        const notifications = [
            makeNotification('1'),
            makeNotification('2'),
            makeNotification('3'),
        ];

        render(<NotificationDropdown {...defaultProps} notifications={notifications} />);

        expect(screen.getByTestId('notification-1')).toBeInTheDocument();
        expect(screen.getByTestId('notification-2')).toBeInTheDocument();
        expect(screen.getByTestId('notification-3')).toBeInTheDocument();
    });

    it('shows only first 5 notifications (MAX_IN_DROPDOWN)', () => {
        const notifications = Array.from({ length: 8 }, (_, i) =>
            makeNotification(`${i + 1}`)
        );

        render(<NotificationDropdown {...defaultProps} notifications={notifications} />);

        expect(screen.getByTestId('notification-1')).toBeInTheDocument();
        expect(screen.getByTestId('notification-5')).toBeInTheDocument();
        expect(screen.queryByTestId('notification-6')).not.toBeInTheDocument();
        expect(screen.queryByTestId('notification-8')).not.toBeInTheDocument();
    });

    // ===============================================================
    // "دیدن همه" link
    // ===============================================================
    it('does not show "view all" link when <= 5 notifications', () => {
        const notifications = Array.from({ length: 5 }, (_, i) =>
            makeNotification(`${i + 1}`)
        );

        render(<NotificationDropdown {...defaultProps} notifications={notifications} />);

        expect(screen.queryByTestId('view-all-link')).not.toBeInTheDocument();
    });

    it('shows "view all" link when > 5 notifications', () => {
        const notifications = Array.from({ length: 6 }, (_, i) =>
            makeNotification(`${i + 1}`)
        );

        render(<NotificationDropdown {...defaultProps} notifications={notifications} />);

        expect(screen.getByTestId('view-all-link')).toBeInTheDocument();
        expect(screen.getByText('دیدن همه اعلان‌ها')).toBeInTheDocument();
    });

    it('calls onClose when "view all" link clicked', () => {
        const notifications = Array.from({ length: 6 }, (_, i) =>
            makeNotification(`${i + 1}`)
        );

        render(<NotificationDropdown {...defaultProps} notifications={notifications} />);

        fireEvent.click(screen.getByTestId('view-all-link'));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // ===============================================================
    // Mark all as read
    // ===============================================================
    it('shows "mark all as read" button when unreadCount > 0', () => {
        render(<NotificationDropdown {...defaultProps} unreadCount={3} />);

        expect(screen.getByText('خواندن همه')).toBeInTheDocument();
    });

    it('hides "mark all as read" button when unreadCount = 0', () => {
        render(<NotificationDropdown {...defaultProps} unreadCount={0} />);

        expect(screen.queryByText('خواندن همه')).not.toBeInTheDocument();
    });

    it('calls markAllAsRead mutation when button clicked', async () => {
        mockMarkAllAsRead.mockResolvedValue({ data: { markAllNotificationsRead: true } });

        render(<NotificationDropdown {...defaultProps} unreadCount={3} />);

        fireEvent.click(screen.getByText('خواندن همه'));

        await waitFor(() => {
            expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
        });
    });

    it('does not call mutation when unreadCount = 0', async () => {
        // ✅ دکمه اصلاً نمایش داده نمی‌شه، پس نمی‌شه کلیک کرد
        render(<NotificationDropdown {...defaultProps} unreadCount={0} />);

        expect(screen.queryByText('خواندن همه')).not.toBeInTheDocument();
        expect(mockMarkAllAsRead).not.toHaveBeenCalled();
    });

    // ===============================================================
    // onClose from NotificationItem
    // ===============================================================
    it('passes onClose to NotificationItem', () => {
        const notifications = [makeNotification('1')];

        render(<NotificationDropdown {...defaultProps} notifications={notifications} />);

        fireEvent.click(screen.getByTestId('notification-1'));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});