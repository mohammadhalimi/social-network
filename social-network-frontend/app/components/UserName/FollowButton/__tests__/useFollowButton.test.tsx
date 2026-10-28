import { useMutation } from '@apollo/client/react';
import { useFollowButton } from '../useFollowButton';
import { renderHook, act } from '@testing-library/react';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/app/graphql/user.queries';
import { CANCEL_FOLLOW_REQUEST } from '@/app/graphql/notification.queries';


jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: { success: jest.fn(), error: jest.fn() },
}));

import toast from 'react-hot-toast';

const mockedUseMutation = useMutation as jest.Mock;

describe('useFollowButton', () => {
    let followMock: jest.Mock;
    let unfollowMock: jest.Mock;
    let cancelMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        followMock = jest.fn();
        unfollowMock = jest.fn();
        cancelMock = jest.fn();

        mockedUseMutation.mockImplementation((mutation: any) => {
            if (mutation === FOLLOW_USER) return [followMock];
            if (mutation === UNFOLLOW_USER) return [unfollowMock];
            if (mutation === CANCEL_FOLLOW_REQUEST) return [cancelMock];
            return [jest.fn()];
        });
    });

    // initial state
    it('initial state: not-following', () => {
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false })
        );
        expect(result.current.state).toBe('not-following');
    });

    it('initial state: following', () => {
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: true })
        );
        expect(result.current.state).toBe('following');
    });

    it('initial state: pending', () => {
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false, initialIsPending: true })
        );
        expect(result.current.state).toBe('pending');
    });

    // follow (public)
    it('follow (public): → following + onFollowChange', async () => {
        followMock.mockResolvedValue({
            data: { followUser: { success: true, followersCount: 10, isPending: false } },
        });
        const onFollowChange = jest.fn();
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false, onFollowChange })
        );

        await act(async () => { await result.current.handleClick(); });

        expect(result.current.state).toBe('following');
        expect(onFollowChange).toHaveBeenCalledWith(true, 10);
    });

    // follow (private) → pending
    it('follow (private): → pending + toast', async () => {
        followMock.mockResolvedValue({
            data: { followUser: { success: true, isPending: true } },
        });
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false })
        );

        await act(async () => { await result.current.handleClick(); });

        expect(result.current.state).toBe('pending');
        expect(toast.success).toHaveBeenCalledWith('درخواست دنبال کردن ارسال شد');
    });

    // unfollow
    it('unfollow: → not-following + onFollowChange', async () => {
        unfollowMock.mockResolvedValue({
            data: { unfollowUser: { success: true, followersCount: 9 } },
        });
        const onFollowChange = jest.fn();
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: true, onFollowChange })
        );

        await act(async () => { await result.current.handleClick(); });

        expect(result.current.state).toBe('not-following');
        expect(onFollowChange).toHaveBeenCalledWith(false, 9);
    });

    // cancel
    it('cancel request: → not-following + toast', async () => {
        cancelMock.mockResolvedValue({
            data: { cancelFollowRequest: { success: true } },
        });
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false, initialIsPending: true })
        );

        await act(async () => { await result.current.handleClick(); });

        expect(result.current.state).toBe('not-following');
        expect(toast.success).toHaveBeenCalledWith('درخواست لغو شد');
    });

    // errors
    it('follow error: state unchanged + toast', async () => {
        followMock.mockResolvedValue({ error: { message: 'خطا' } });
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false })
        );

        await act(async () => { await result.current.handleClick(); });

        expect(result.current.state).toBe('not-following');
        expect(toast.error).toHaveBeenCalledWith('خطا');
    });

    it('network error: toast', async () => {
        followMock.mockRejectedValue(new Error('Network'));
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false })
        );

        await act(async () => { await result.current.handleClick(); });

        expect(toast.error).toHaveBeenCalledWith('Network');
    });

    // loading
    it('sets isLoading during mutation', async () => {
        let resolve: any;
        followMock.mockReturnValue(new Promise((r) => { resolve = r; }));
        const { result } = renderHook(() =>
            useFollowButton({ userId: 'u1', initialIsFollowing: false })
        );

        act(() => { result.current.handleClick(); });

        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            resolve({ data: { followUser: { success: true, isPending: false, followersCount: 1 } } });
        });

        expect(result.current.isLoading).toBe(false);
    });
});