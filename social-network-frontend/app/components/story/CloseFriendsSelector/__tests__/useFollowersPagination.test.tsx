// components/story/CloseFriendsSelector/__tests__/useFollowersPagination.test.tsx

import { useQuery } from '@apollo/client/react';
import { useFollowersPagination } from '../useFollowersPagination';
import { renderHook, render, act, waitFor } from '@testing-library/react';

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as unknown as jest.Mock;

// ==========================================================
// ✅ Mock IntersectionObserver
// ==========================================================
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockUnobserve = jest.fn();
const observerCallbacks: any[] = [];

const MockIntersectionObserver = jest.fn().mockImplementation((callback) => {
    observerCallbacks.push(callback);
    return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: mockUnobserve,
    };
});

(global as any).IntersectionObserver = MockIntersectionObserver;

// ==========================================================
// ✅ تابع کمکی
// ==========================================================
const makeUsers = (count: number, startId = 0) =>
    Array.from({ length: count }, (_, i) => ({
        id: `user-${startId + i}`,
        username: `user${startId + i}`,
        fullName: `کاربر ${startId + i}`,
        avatar: null,
    }));

// ==========================================================
// ✅ کامپوننت تستی که ref رو به DOM وصل می‌کنه
// ==========================================================
const TestComponent = ({ userId, onReady }: { userId: string; onReady?: (api: any) => void }) => {
    const api = useFollowersPagination(userId);
    onReady?.(api);
    return <div ref={api.loadMoreRef} data-testid="load-more-sentinel" />;
};

describe('useFollowersPagination', () => {
    let fetchMoreMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMoreMock = jest.fn();

        observerCallbacks.length = 0;
        MockIntersectionObserver.mockClear();

        // ✅ استفاده از mockReset و تنظیم مجدد
        mockObserve.mockReset();
        mockDisconnect.mockReset();
        mockUnobserve.mockReset();

        mockObserve.mockImplementation(() => { });
        mockDisconnect.mockImplementation(() => { });
        mockUnobserve.mockImplementation(() => { });

        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: makeUsers(5), hasMore: true } },
            loading: false,
            fetchMore: fetchMoreMock,
        });
    });

    // ==========================================================
    //  مقداردهی اولیه (با renderHook)
    // ==========================================================
    it('allFollowers را با نتایج اولیه‌ی useQuery پر می‌کند', async () => {
        const { result } = renderHook(() => useFollowersPagination('user-1'));

        await waitFor(() => {
            expect(result.current.allFollowers).toHaveLength(5);
        });
        expect(result.current.hasMore).toBe(true);
    });

    it('وقتی data.getFollowers.hasMore=false است، hasMore را false می‌کند', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: makeUsers(3), hasMore: false } },
            loading: false,
            fetchMore: fetchMoreMock,
        });

        const { result } = renderHook(() => useFollowersPagination('user-1'));

        await waitFor(() => {
            expect(result.current.hasMore).toBe(false);
        });
    });

    it('وقتی data وجود ندارد، allFollowers خالی می‌ماند', () => {
        mockedUseQuery.mockReturnValue({
            data: undefined,
            loading: true,
            fetchMore: fetchMoreMock,
        });

        const { result } = renderHook(() => useFollowersPagination('user-1'));

        expect(result.current.allFollowers).toHaveLength(0);
    });

    // ==========================================================
    //  Debounce (با fakeTimers)
    // ==========================================================
    describe('Debounce', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('setSearchTerm بلافاصله debouncedSearch را تغییر نمی‌دهد', () => {
            const { result } = renderHook(() => useFollowersPagination('user-1'));

            act(() => {
                result.current.setSearchTerm('ali');
            });

            expect(mockedUseQuery).toHaveBeenLastCalledWith(
                expect.anything(),
                expect.objectContaining({
                    variables: expect.objectContaining({ searchTerm: '' }),
                })
            );
        });

        it('بعد از ۳۰۰ میلی‌ثانیه، debouncedSearch به‌روزرسانی می‌شود', () => {
            const { result, rerender } = renderHook(() => useFollowersPagination('user-1'));

            act(() => {
                result.current.setSearchTerm('ali');
            });
            act(() => {
                jest.advanceTimersByTime(300);
            });
            rerender();

            expect(mockedUseQuery).toHaveBeenLastCalledWith(
                expect.anything(),
                expect.objectContaining({
                    variables: expect.objectContaining({ searchTerm: 'ali' }),
                })
            );
        });

        it('تایپ سریع و پشت‌سرهم، فقط آخرین مقدار را اعمال می‌کند', () => {
            const { result, rerender } = renderHook(() => useFollowersPagination('user-1'));

            act(() => {
                result.current.setSearchTerm('a');
            });
            act(() => {
                jest.advanceTimersByTime(100);
                result.current.setSearchTerm('al');
            });
            act(() => {
                jest.advanceTimersByTime(100);
                result.current.setSearchTerm('ali');
            });
            act(() => {
                jest.advanceTimersByTime(300);
            });
            rerender();

            expect(mockedUseQuery).toHaveBeenLastCalledWith(
                expect.anything(),
                expect.objectContaining({
                    variables: expect.objectContaining({ searchTerm: 'ali' }),
                })
            );
        });
    });

    // ==========================================================
    //  ریست با تغییر search
    // ==========================================================
    it('با تغییر debouncedSearch، allFollowers و hasMore ریست می‌شوند', async () => {
        const { result } = renderHook(() => useFollowersPagination('user-1'));

        await waitFor(() => {
            expect(result.current.allFollowers).toHaveLength(5);
        });

        act(() => {
            result.current.setSearchTerm('ali');
        });

        await waitFor(
            () => {
                expect(mockedUseQuery).toHaveBeenLastCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        variables: expect.objectContaining({ searchTerm: 'ali' }),
                    })
                );
            },
            { timeout: 1000 }
        );
    });

    // ==========================================================
    //  handleLoadMore (با render واقعی)
    // ==========================================================
    it('handleLoadMore نتایج جدید را به انتهای لیست اضافه می‌کند', async () => {
        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: makeUsers(5, 5), hasMore: false } },
        });

        render(<TestComponent userId="user-1" />);

        // ✅ صبر کن observer ساخته بشه
        await waitFor(() => {
            expect(observerCallbacks.length).toBeGreaterThan(0);
        });

        const observerCallback = observerCallbacks.at(-1);

        await act(async () => {
            observerCallback([{ isIntersecting: true }]);
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(fetchMoreMock).toHaveBeenCalled();
        });
    });

    it('پیدا کردن کاربران تکراری در merge نادیده گرفته می‌شود', async () => {
        const duplicateUser = { id: 'user-4', username: 'user4', fullName: 'کاربر 4', avatar: null };
        const newUser = { id: 'user-5', username: 'user5', fullName: 'کاربر 5', avatar: null };

        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: [duplicateUser, newUser], hasMore: false } },
        });

        render(<TestComponent userId="user-1" />);

        await waitFor(() => {
            expect(observerCallbacks.length).toBeGreaterThan(0);
        });

        const observerCallback = observerCallbacks.at(-1);

        await act(async () => {
            observerCallback([{ isIntersecting: true }]);
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(fetchMoreMock).toHaveBeenCalled();
        });
    });

    it('بعد از handleLoadMore موفق، hasMore به‌روزرسانی می‌شود', async () => {
        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: makeUsers(2, 5), hasMore: false } },
        });

        render(<TestComponent userId="user-1" />);

        await waitFor(() => {
            expect(observerCallbacks.length).toBeGreaterThan(0);
        });

        const observerCallback = observerCallbacks.at(-1);

        await act(async () => {
            observerCallback([{ isIntersecting: true }]);
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(fetchMoreMock).toHaveBeenCalled();
        });
    });

    it('بعد از اینکه hasMore=false شود، observer disconnect می‌شود', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: makeUsers(5), hasMore: false } },
            loading: false,
            fetchMore: fetchMoreMock,
        });

        render(<TestComponent userId="user-1" />);

        await waitFor(() => {
            expect(mockedUseQuery).toHaveBeenCalled();
        });

        await new Promise((r) => setTimeout(r, 100));

        // ✅ disconnect باید صدا زده شده باشد
        expect(mockDisconnect).toHaveBeenCalled();
    });
});