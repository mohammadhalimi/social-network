// app/hooks/__tests__/useNotifications.test.tsx

import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../useNotifications';

// ✅ mock Apollo useQuery
const mockRefetch = jest.fn();
let mockQueryData: any = null;
let mockQueryLoading = false;

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(() => ({
        data: mockQueryData,
        loading: mockQueryLoading,
        refetch: mockRefetch,
    })),
}));

// ✅ mock Apollo Client (برای readQuery/writeQuery)
const mockReadQuery = jest.fn();
const mockWriteQuery = jest.fn();

jest.mock('@/app/lib/apollo-client', () => ({
    client: {
        readQuery: (...args: any[]) => mockReadQuery(...args),
        writeQuery: (...args: any[]) => mockWriteQuery(...args),
    },
}));

// ✅ mock Socket
const mockSocketOn = jest.fn();
const mockSocketOff = jest.fn();
const mockSocket = {
    on: mockSocketOn,
    off: mockSocketOff,
};

let mockUseSocketReturn: any = { socket: mockSocket };

jest.mock('@/app/providers/SocketProvider', () => ({
    useSocket: () => mockUseSocketReturn,
}));

describe('useNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockQueryData = null;
        mockQueryLoading = false;
        mockUseSocketReturn = { socket: mockSocket };
    });

    // ===============================================================
    // Initial state
    // ===============================================================
    it('returns empty notifications and 0 unreadCount initially', () => {
        const { result } = renderHook(() => useNotifications());

        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
        expect(result.current.loading).toBe(false);
    });

    it('returns data from query', () => {
        mockQueryData = {
            getNotifications: {
                notifications: [{ id: 'n1', type: 'LIKE' }],
                unreadCount: 5,
            },
        };

        const { result } = renderHook(() => useNotifications());

        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.unreadCount).toBe(5);
    });

    // ===============================================================
    // Socket registration
    // ===============================================================
    it('registers socket listener on mount', () => {
        renderHook(() => useNotifications());

        expect(mockSocketOn).toHaveBeenCalledWith('notification:new', expect.any(Function));
    });

    it('removes socket listener on unmount', () => {
        const { unmount } = renderHook(() => useNotifications());
        unmount();

        expect(mockSocketOff).toHaveBeenCalledWith('notification:new', expect.any(Function));
    });

    it('does NOT register listener when socket is null', () => {
        mockUseSocketReturn = { socket: null };

        renderHook(() => useNotifications());

        expect(mockSocketOn).not.toHaveBeenCalled();
    });

    // ===============================================================
    // Socket event → Cache update
    // ===============================================================
    it('updates Apollo cache when notification:new event fires', () => {
        // ✅ دیتای اولیه در کش
        mockReadQuery.mockReturnValue({
            getNotifications: {
                notifications: [{ id: 'n1', type: 'LIKE' }],
                unreadCount: 1,
                totalCount: 1,
            },
        });

        renderHook(() => useNotifications());

        // ✅ پیدا کردن هندلر
        const handler = mockSocketOn.mock.calls[0][1];

        // ✅ شبیه‌سازی رویداد
        act(() => {
            handler({
                id: 'n2',
                type: 'COMMENT',
                isRead: false,
                createdAt: '2026-01-01',
                actor: { id: 'u1', username: 'ali' },
                postId: 'p1',
                commentId: null,
                followRequest: null,
                unreadCount: 2,
            });
        });

        // ✅ چک کردن writeQuery
        expect(mockWriteQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                variables: { limit: 20, offset: 0 },
                data: {
                    getNotifications: {
                        notifications: [
                            expect.objectContaining({ id: 'n2', type: 'COMMENT' }),
                            expect.objectContaining({ id: 'n1', type: 'LIKE' }),
                        ],
                        unreadCount: 2,
                        totalCount: 2,
                    },
                },
            })
        );
    });

    it('uses fallback unreadCount when payload does not include it', () => {
        mockReadQuery.mockReturnValue({
            getNotifications: {
                notifications: [],
                unreadCount: 3,
                totalCount: 0,
            },
        });

        renderHook(() => useNotifications());

        const handler = mockSocketOn.mock.calls[0][1];

        act(() => {
            handler({
                id: 'n2',
                type: 'LIKE',
                isRead: false,
                createdAt: '2026-01-01',
                actor: { id: 'u1' },
                postId: null,
                commentId: null,
                followRequest: null,
                // ❌ unreadCount نداره
            });
        });

        expect(mockWriteQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    getNotifications: expect.objectContaining({
                        unreadCount: 4, // ✅ 3 + 1
                    }),
                },
            })
        );
    });

    it('does NOT update cache when existing data is null (readQuery returns null)', () => {
        mockReadQuery.mockReturnValue(null);

        renderHook(() => useNotifications());

        const handler = mockSocketOn.mock.calls[0][1];

        act(() => {
            handler({ id: 'n2', type: 'LIKE' });
        });

        expect(mockWriteQuery).not.toHaveBeenCalled();
    });

    // ===============================================================
    // Refetch
    // ===============================================================
    it('exposes refetch from useQuery', () => {
        const { result } = renderHook(() => useNotifications());

        expect(result.current.refetch).toBe(mockRefetch);
    });
});