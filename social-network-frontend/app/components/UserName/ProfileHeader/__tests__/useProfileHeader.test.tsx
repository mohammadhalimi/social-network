// app/user/[username]/components/ProfileHeader/__tests__/useProfileHeader.test.tsx

import { useQuery } from '@apollo/client/react';
import { useProfileHeader } from '../useProfileHeader';
import { renderHook, act } from '@testing-library/react';

// ✅ mock Apollo
const mockRefetch = jest.fn();
let mockQueryData: any = { getUserStories: [] };

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(() => ({
        data: mockQueryData,
        refetch: mockRefetch,
    })),
}));

describe('useProfileHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockQueryData = { getUserStories: [] };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns initial state', () => {
        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        expect(result.current.viewerOpen).toBe(false);
        expect(result.current.isLongPressing).toBe(false);
        expect(result.current.hasStories).toBe(false);
    });

    it('skips query when canViewContent=false', () => {
        renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: false, avatarUrl: '/a.jpg' })
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ skip: true })
        );
    });

    it('long-press activates after 400ms', () => {
        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        act(() => {
            result.current.handlePressStart();
            jest.advanceTimersByTime(400);
        });

        expect(result.current.isLongPressing).toBe(true);
    });

    it('short-press does NOT activate long-press', () => {
        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        act(() => {
            result.current.handlePressStart();
            result.current.handlePressEnd();
        });

        expect(result.current.isLongPressing).toBe(false);
    });

    it('short-press opens viewer when hasStories', () => {
        mockQueryData = {
            getUserStories: [{ id: 's1', isViewedByMe: false }],
        };

        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        act(() => {
            result.current.handlePressStart();
            result.current.handlePressEnd();
        });

        expect(result.current.viewerOpen).toBe(true);
    });

    it('short-press does NOT open viewer when no stories', () => {
        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        act(() => {
            result.current.handlePressStart();
            result.current.handlePressEnd();
        });

        expect(result.current.viewerOpen).toBe(false);
    });

    it('handlePressCancel resets state', () => {
        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        act(() => {
            result.current.handlePressStart();
            result.current.handlePressCancel();
            jest.advanceTimersByTime(400);
        });

        expect(result.current.isLongPressing).toBe(false);
    });

    it('handlePressStart does nothing when avatarUrl is null', () => {
        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: null })
        );

        act(() => {
            result.current.handlePressStart();
            jest.advanceTimersByTime(400);
        });

        expect(result.current.isLongPressing).toBe(false);
    });

    it('computes hasUnviewedStory + initialIndex', () => {
        mockQueryData = {
            getUserStories: [
                { id: 's1', isViewedByMe: true },
                { id: 's2', isViewedByMe: false },
            ],
        };

        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        expect(result.current.hasUnviewedStory).toBe(true);
        expect(result.current.initialIndex).toBe(1);
    });

    it('closeViewer closes viewer', () => {
        mockQueryData = { getUserStories: [{ id: 's1', isViewedByMe: false }] };
        const { result } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        act(() => {
            result.current.handlePressStart();
            result.current.handlePressEnd();
        });
        expect(result.current.viewerOpen).toBe(true);

        act(() => result.current.closeViewer());
        expect(result.current.viewerOpen).toBe(false);
    });

    it('cleans up timer on unmount', () => {
        const { unmount } = renderHook(() =>
            useProfileHeader({ userId: 'u1', canViewContent: true, avatarUrl: '/a.jpg' })
        );

        unmount();
    });
});