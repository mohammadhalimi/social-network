// app/components/notification/NotificationItem/__tests__/useNotificationItem.test.tsx
'use client';

import { renderHook, act } from '@testing-library/react';
import { useNotificationItem } from '../useNotificationItem';
import { INotification } from '@/app/graphql/notification.queries';

// ✅ mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// ✅ mock Apollo — بر اساس operation name
const mockMarkAsRead = jest.fn();
const mockAcceptRequest = jest.fn();
const mockRejectRequest = jest.fn();

declare global {
    var __mockMarkAsRead: jest.Mock;
    var __mockAcceptRequest: jest.Mock;
    var __mockRejectRequest: jest.Mock;
}

jest.mock('@apollo/client/react', () => ({
    useMutation: (mutation: any) => {
        const opName = mutation?.definitions?.[0]?.name?.value;

        if (opName === 'MarkNotificationRead') return [global.__mockMarkAsRead];
        if (opName === 'AcceptFollowRequest') return [global.__mockAcceptRequest];
        if (opName === 'RejectFollowRequest') return [global.__mockRejectRequest];
        return [jest.fn()];
    },
}));

// ✅ mock Redux
const mockDispatch = jest.fn();
jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('@/app/redux/uiSlice', () => ({
    openPostModal: (postId: string) => ({ type: 'OPEN_POST_MODAL', payload: postId }),
}));

// ✅ mock toast
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

import toast from 'react-hot-toast';

// ===================================================================
// Helpers
// ===================================================================
const makeNotification = (overrides: Partial<INotification> = {}): INotification => ({
    id: 'notif-1',
    type: 'LIKE',
    isRead: false,
    createdAt: '2026-10-20T10:00:00.000Z',
    actor: { id: 'user-1', username: 'user1', fullName: 'User 1', avatar: null },
    postId: 'post-1',
    commentId: null,
    followRequest: null,
    ...overrides,
});

const mockOnClose = jest.fn();

// ===================================================================
// Tests
// ===================================================================
describe('useNotificationItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // ✅ set global mocks برای useMutation factory
        (global as any).__mockMarkAsRead = mockMarkAsRead;
        (global as any).__mockAcceptRequest = mockAcceptRequest;
        (global as any).__mockRejectRequest = mockRejectRequest;

        // default resolved values
        mockMarkAsRead.mockResolvedValue({ data: {} });
        mockAcceptRequest.mockResolvedValue({
            data: { acceptFollowRequest: { success: true } },
        });
        mockRejectRequest.mockResolvedValue({
            data: { rejectFollowRequest: { success: true } },
        });
    });

    // ===============================================================
    // handleClick — markAsRead
    // ===============================================================
    describe('handleClick — markAsRead', () => {
        it('calls markAsRead when notification is unread', async () => {
            const { result } = renderHook(() =>
                useNotificationItem(makeNotification({ isRead: false }), mockOnClose)
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockMarkAsRead).toHaveBeenCalledWith({
                variables: { notificationId: 'notif-1' },
            });
        });

        it('does NOT call markAsRead when notification is already read', async () => {
            const { result } = renderHook(() =>
                useNotificationItem(makeNotification({ isRead: true }), mockOnClose)
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockMarkAsRead).not.toHaveBeenCalled();
        });
    });

    // ===============================================================
    // handleClick — post types
    // ===============================================================
    describe('handleClick — post notification types', () => {
        it.each(['LIKE', 'COMMENT', 'REPLY', 'COMMENT_LIKE'] as const)(
            'dispatches openPostModal for %s with postId',
            async (type) => {
                const { result } = renderHook(() =>
                    useNotificationItem(
                        makeNotification({ type, postId: 'post-123', isRead: true }),
                        mockOnClose
                    )
                );

                await act(async () => {
                    await result.current.handleClick();
                });

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'OPEN_POST_MODAL',
                    payload: 'post-123',
                });
                expect(mockOnClose).toHaveBeenCalledTimes(1);
                expect(mockPush).not.toHaveBeenCalled();
            }
        );

        it('does NOT dispatch when postId is null (post type)', async () => {
            const { result } = renderHook(() =>
                useNotificationItem(
                    makeNotification({ type: 'LIKE', postId: null, isRead: true }),
                    mockOnClose
                )
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockDispatch).not.toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    // ===============================================================
    // handleClick — profile types
    // ===============================================================
    describe('handleClick — profile notification types', () => {
        it.each(['FOLLOW', 'FOLLOW_REQUEST', 'FOLLOW_REQUEST_ACCEPTED'] as const)(
            'navigates to profile for %s',
            async (type) => {
                const { result } = renderHook(() =>
                    useNotificationItem(
                        makeNotification({ type, isRead: true }),
                        mockOnClose
                    )
                );

                await act(async () => {
                    await result.current.handleClick();
                });

                expect(mockPush).toHaveBeenCalledWith('/user1');
                expect(mockOnClose).toHaveBeenCalledTimes(1);
                expect(mockDispatch).not.toHaveBeenCalled();
            }
        );
    });

    // ===============================================================
    // handleAccept
    // ===============================================================
    describe('handleAccept', () => {
        const makeEvent = () => ({ stopPropagation: jest.fn() } as any);

        const makeFollowReqNotification = () =>
            makeNotification({
                type: 'FOLLOW_REQUEST',
                followRequest: { id: 'req-1', status: 'PENDING' } as any,
            });

        it('calls acceptRequest and shows success toast', async () => {
            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            const event = makeEvent();
            await act(async () => {
                await result.current.handleAccept(event);
            });

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(mockAcceptRequest).toHaveBeenCalledWith({
                variables: { requestId: 'req-1' },
            });
            expect(toast.success).toHaveBeenCalledWith('درخواست قبول شد ✅');
        });

        it('shows error toast when mutation returns error', async () => {
            mockAcceptRequest.mockResolvedValue({
                error: { message: 'خطای شبکه' },
            });

            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            await act(async () => {
                await result.current.handleAccept(makeEvent());
            });

            expect(toast.error).toHaveBeenCalledWith('خطای شبکه');
            expect(toast.success).not.toHaveBeenCalled();
        });

        it('shows fallback error message when error.message is missing', async () => {
            mockAcceptRequest.mockResolvedValue({ error: {} });

            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            await act(async () => {
                await result.current.handleAccept(makeEvent());
            });

            expect(toast.error).toHaveBeenCalledWith('خطا در قبول درخواست');
        });

        it('does nothing when followRequest is null', async () => {
            const notification = makeNotification({
                type: 'FOLLOW_REQUEST',
                followRequest: null,
            });

            const { result } = renderHook(() =>
                useNotificationItem(notification, mockOnClose)
            );

            const event = makeEvent();
            await act(async () => {
                await result.current.handleAccept(event);
            });

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(mockAcceptRequest).not.toHaveBeenCalled();
            expect(toast.success).not.toHaveBeenCalled();
        });

        it('does not show success toast when data.success is false', async () => {
            mockAcceptRequest.mockResolvedValue({
                data: { acceptFollowRequest: { success: false } },
            });

            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            await act(async () => {
                await result.current.handleAccept(makeEvent());
            });

            expect(toast.success).not.toHaveBeenCalled();
        });
    });

    // ===============================================================
    // handleReject
    // ===============================================================
    describe('handleReject', () => {
        const makeEvent = () => ({ stopPropagation: jest.fn() } as any);

        const makeFollowReqNotification = () =>
            makeNotification({
                type: 'FOLLOW_REQUEST',
                followRequest: { id: 'req-1', status: 'PENDING' } as any,
            });

        it('calls rejectRequest and shows success toast', async () => {
            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            const event = makeEvent();
            await act(async () => {
                await result.current.handleReject(event);
            });

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(mockRejectRequest).toHaveBeenCalledWith({
                variables: { requestId: 'req-1' },
            });
            expect(toast.success).toHaveBeenCalledWith('درخواست رد شد');
        });

        it('shows fallback error message when error.message is missing', async () => {
            mockRejectRequest.mockResolvedValue({ error: {} });

            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            await act(async () => {
                await result.current.handleReject(makeEvent());
            });

            expect(toast.error).toHaveBeenCalledWith('خطا در رد درخواست');
        });

        it('does not show success toast when data.success is false', async () => {
            mockRejectRequest.mockResolvedValue({
                data: { rejectFollowRequest: { success: false } },
            });

            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            await act(async () => {
                await result.current.handleReject(makeEvent());
            });

            expect(toast.success).not.toHaveBeenCalled();
        });

        it('shows error toast when mutation returns error', async () => {
            mockRejectRequest.mockResolvedValue({
                error: { message: 'خطای شبکه' },
            });

            const { result } = renderHook(() =>
                useNotificationItem(makeFollowReqNotification(), mockOnClose)
            );

            await act(async () => {
                await result.current.handleReject(makeEvent());
            });

            expect(toast.error).toHaveBeenCalledWith('خطای شبکه');
            expect(toast.success).not.toHaveBeenCalled();
        });

        it('does nothing when followRequest is null', async () => {
            const notification = makeNotification({
                type: 'FOLLOW_REQUEST',
                followRequest: null,
            });

            const { result } = renderHook(() =>
                useNotificationItem(notification, mockOnClose)
            );

            const event = makeEvent();
            await act(async () => {
                await result.current.handleReject(event);
            });

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(mockRejectRequest).not.toHaveBeenCalled();
            expect(toast.success).not.toHaveBeenCalled();
        });
    });
});