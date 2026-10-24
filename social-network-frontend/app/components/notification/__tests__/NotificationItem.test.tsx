// app/components/notification/NotificationItem/__tests__/index.test.tsx
'use client';

import { NotificationItem } from '../NotificationItemIndex'
import {
    render,
    screen,
    fireEvent
} from '@testing-library/react';
import { INotification } from '@/app/graphql/notification.queries';

// ✅ mock useNotificationItem
const mockHandleClick = jest.fn();
const mockHandleAccept = jest.fn();
const mockHandleReject = jest.fn();

jest.mock('../NotificationItem/useNotificationItem', () => ({
    useNotificationItem: () => ({
        handleClick: mockHandleClick,
        handleAccept: mockHandleAccept,
        handleReject: mockHandleReject,
    }),
}));

// ✅ mock getAvatarUrl
jest.mock('@/app/lib/utils/avatar', () => ({
    getAvatarUrl: (avatar: string | null) => avatar,
}));

// ✅ mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// ✅ mock date-fns (چون faIR locale داره)
jest.mock('date-fns', () => ({
    formatDistanceToNow: () => '۲ دقیقه پیش',
}));

jest.mock('date-fns/locale', () => ({
    faIR: {},
}));

// ===================================================================
// Helpers
// ===================================================================
const makeNotification = (overrides: Partial<INotification> = {}): INotification => ({
    id: 'notif-1',
    type: 'LIKE',
    isRead: false,
    createdAt: '2026-10-20T10:00:00.000Z',
    actor: { id: 'user-1', username: 'user1', fullName: 'علی رضایی', avatar: null },
    postId: 'post-1',
    commentId: null,
    followRequest: null,
    ...overrides,
});

const mockOnClose = jest.fn();

// ===================================================================
// Tests
// ===================================================================
describe('NotificationItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ===============================================================
    // Render
    // ===============================================================
    describe('rendering', () => {
        it('renders actor name and message', () => {
            render(<NotificationItem notification={makeNotification()} onClose={mockOnClose} />);

            expect(screen.getByText('علی رضایی')).toBeInTheDocument();
            expect(screen.getByText('پست شما را لایک کرد')).toBeInTheDocument();
        });

        it('renders time ago', () => {
            render(<NotificationItem notification={makeNotification()} onClose={mockOnClose} />);

            expect(screen.getByText('۲ دقیقه پیش')).toBeInTheDocument();
        });

        it('renders avatar image when avatar exists', () => {
            const notification = makeNotification({
                actor: {
                    id: 'user-1',
                    username: 'user1',
                    fullName: 'علی',
                    avatar: '/uploads/avatar.jpg',
                },
            });

            render(<NotificationItem notification={notification} onClose={mockOnClose} />);

            expect(screen.getByAltText('علی')).toHaveAttribute('src', '/uploads/avatar.jpg');
        });

        it('renders first letter when no avatar', () => {
            render(<NotificationItem notification={makeNotification()} onClose={mockOnClose} />);

            expect(screen.getByText('ع')).toBeInTheDocument();
        });
    });

    // ===============================================================
    // Message map (all types)
    // ===============================================================
    describe('message map', () => {
        it.each([
            ['FOLLOW', 'شما را دنبال کرد'],
            ['FOLLOW_REQUEST', 'درخواست دنبال کردن فرستاد'],
            ['FOLLOW_REQUEST_ACCEPTED', 'درخواست شما را پذیرفت'],
            ['LIKE', 'پست شما را لایک کرد'],
            ['COMMENT', 'برای پست شما کامنت گذاشت'],
            ['REPLY', 'به کامنت شما پاسخ داد'],
            ['COMMENT_LIKE', 'کامنت شما را لایک کرد'],
        ] as const)('renders message for %s', (type, message) => {
            render(
                <NotificationItem
                    notification={makeNotification({ type })}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByText(message)).toBeInTheDocument();
        });
    });

    // ===============================================================
    // Unread style
    // ===============================================================
    describe('unread style', () => {
        it('applies unread class when isRead=false', () => {
            render(
                <NotificationItem
                    notification={makeNotification({ isRead: false })}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByTestId('notification-item').className).toMatch(/border-r-2/);
        });

        it('does not apply unread class when isRead=true', () => {
            render(
                <NotificationItem
                    notification={makeNotification({ isRead: true })}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByTestId('notification-item').className).not.toMatch(/border-r-2/);
        });
    });

    // ===============================================================
    // handleClick
    // ===============================================================
    describe('handleClick', () => {
        it('calls handleClick when item clicked', () => {
            render(<NotificationItem notification={makeNotification()} onClose={mockOnClose} />);

            fireEvent.click(screen.getByTestId('notification-item'));

            expect(mockHandleClick).toHaveBeenCalledTimes(1);
        });
    });

    // ===============================================================
    // Accept/Reject buttons
    // ===============================================================
    describe('follow request buttons', () => {
        const makeFollowRequestNotification = (status: string) =>
            makeNotification({
                type: 'FOLLOW_REQUEST',
                followRequest: { id: 'req-1', status } as any,
            });

        it('renders accept/reject buttons for PENDING FOLLOW_REQUEST', () => {
            render(
                <NotificationItem
                    notification={makeFollowRequestNotification('PENDING')}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByTestId('accept-button')).toBeInTheDocument();
            expect(screen.getByTestId('reject-button')).toBeInTheDocument();
        });

        it('does NOT render buttons for FOLLOW_REQUEST with ACCEPTED status', () => {
            render(
                <NotificationItem
                    notification={makeFollowRequestNotification('ACCEPTED')}
                    onClose={mockOnClose}
                />
            );

            expect(screen.queryByTestId('accept-button')).not.toBeInTheDocument();
            expect(screen.queryByTestId('reject-button')).not.toBeInTheDocument();
        });

        it('does NOT render buttons for non-FOLLOW_REQUEST types', () => {
            render(
                <NotificationItem
                    notification={makeNotification({ type: 'LIKE' })}
                    onClose={mockOnClose}
                />
            );

            expect(screen.queryByTestId('accept-button')).not.toBeInTheDocument();
        });

        it('calls handleAccept when accept clicked', () => {
            render(
                <NotificationItem
                    notification={makeFollowRequestNotification('PENDING')}
                    onClose={mockOnClose}
                />
            );

            fireEvent.click(screen.getByTestId('accept-button'));

            expect(mockHandleAccept).toHaveBeenCalledTimes(1);
        });

        it('calls handleReject when reject clicked', () => {
            render(
                <NotificationItem
                    notification={makeFollowRequestNotification('PENDING')}
                    onClose={mockOnClose}
                />
            );

            fireEvent.click(screen.getByTestId('reject-button'));

            expect(mockHandleReject).toHaveBeenCalledTimes(1);
        });
    });
});