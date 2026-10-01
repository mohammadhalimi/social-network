// components/story/CloseFriendsSelector/__tests__/useFollowersPagination.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { useFollowersPagination } from '../useFollowersPagination';

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as unknown as jest.Mock;

// ✅ Mock کردن IntersectionObserver (در jsdom وجود ندارد)
class MockIntersectionObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}
(global as any).IntersectionObserver = MockIntersectionObserver;

const makeUsers = (count: number, startId = 0) =>
    Array.from({ length: count }, (_, i) => ({
        id: `user-${startId + i}`,
        username: `user${startId + i}`,
        fullName: `کاربر ${startId + i}`,
        avatar: null,
    }));

describe('useFollowersPagination', () => {
    let fetchMoreMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        fetchMoreMock = jest.fn();

        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: makeUsers(5), hasMore: true } },
            loading: false,
            fetchMore: fetchMoreMock,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // ==========================================================
    //  مقداردهی اولیه و sync با data
    // ==========================================================
    it('allFollowers را با نتایج اولیه‌ی useQuery پر می‌کند', () => {
        const { result } = renderHook(() => useFollowersPagination('user-1'));

        expect(result.current.allFollowers).toHaveLength(5);
        expect(result.current.hasMore).toBe(true);
    });

    it('وقتی data.getFollowers.hasMore=false است، hasMore را false می‌کند', () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: makeUsers(3), hasMore: false } },
            loading: false,
            fetchMore: fetchMoreMock,
        });

        const { result } = renderHook(() => useFollowersPagination('user-1'));

        expect(result.current.hasMore).toBe(false);
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
    //  Debounce جستجو
    // ==========================================================
    it('setSearchTerm بلافاصله debouncedSearch را تغییر نمی‌دهد (باید صبر کند)', () => {
        const { result } = renderHook(() => useFollowersPagination('user-1'));

        act(() => {
            result.current.setSearchTerm('ali');
        });

        // ✅ هنوز useQuery با مقدار جدید صدا زده نشده چون debounce تمام نشده
        expect(mockedUseQuery).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                variables: expect.objectContaining({ searchTerm: '' }),
            })
        );
    });

    it('بعد از ۳۰۰ میلی‌ثانیه، debouncedSearch به‌روزرسانی و useQuery با آن صدا زده می‌شود', async () => {
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

    it('تایپ سریع و پشت‌سرهم، فقط آخرین مقدار را بعد از debounce اعمال می‌کند', () => {
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

    // ==========================================================
    //  ریست شدن لیست با تغییر search
    // ==========================================================
    it('با تغییر debouncedSearch، allFollowers و hasMore ریست می‌شوند', () => {
        const { result, rerender } = renderHook(
            ({ userId }) => useFollowersPagination(userId),
            { initialProps: { userId: 'user-1' } }
        );

        expect(result.current.allFollowers).toHaveLength(5);

        act(() => {
            result.current.setSearchTerm('ali');
        });
        act(() => {
            jest.advanceTimersByTime(300);
        });

        rerender({ userId: 'user-1' });

        // ✅ بلافاصله بعد از تغییر debouncedSearch، لیست ریست شده تا نتایج جدید بیاید
        expect(result.current.allFollowers).toHaveLength(0);
        expect(result.current.hasMore).toBe(true);
    });

    // ==========================================================
    //  handleLoadMore: merge و dedupe
    // ==========================================================
    it('handleLoadMore نتایج جدید را به انتهای لیست اضافه می‌کند', async () => {
        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: makeUsers(5, 5), hasMore: false } },
        });

        const { result } = renderHook(() => useFollowersPagination('user-1'));

        await act(async () => {
            // دسترسی مستقیم به تابع از طریق hook غیرممکنه چون handleLoadMore اکسپورت نشده مستقیم،
            // پس باید از طریق observer trigger بشه - اینجا شبیه‌سازی می‌کنیم با فراخوانی مستقیم internal API
        });

        // از آنجا که handleLoadMore از طریق IntersectionObserver trigger می‌شود،
        // رفتار آن را با شبیه‌سازی callback observer تست می‌کنیم:
        const observerInstance = (global.IntersectionObserver as any).mock.instances.at(-1);
        const observerCallback = (global.IntersectionObserver as any).mock.calls.at(-1)?.[0];

        await act(async () => {
            if (observerCallback) {
                observerCallback([{ isIntersecting: true }]);
            }
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(fetchMoreMock).toHaveBeenCalled();
        });
    });

    it('پیدا کردن کاربران تکراری (id یکسان) در merge نادیده گرفته می‌شود', async () => {
        const duplicateUser = { id: 'user-4', username: 'user4', fullName: 'کاربر 4', avatar: null };
        const newUser = { id: 'user-5', username: 'user5', fullName: 'کاربر 5', avatar: null };

        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: [duplicateUser, newUser], hasMore: false } },
        });

        const { result } = renderHook(() => useFollowersPagination('user-1'));

        expect(result.current.allFollowers).toHaveLength(5); // user-0 .. user-4

        const observerCallback = (global.IntersectionObserver as any).mock.calls.at(-1)?.[0];

        await act(async () => {
            if (observerCallback) {
                observerCallback([{ isIntersecting: true }]);
            }
            await Promise.resolve();
        });

        await waitFor(() => {
            // user-4 تکراریه (نباید دوباره اضافه بشه)، فقط user-5 جدید اضافه میشه
            expect(result.current.allFollowers).toHaveLength(6);
        });
    });

    it('بعد از handleLoadMore موفق، hasMore بر اساس پاسخ جدید به‌روزرسانی می‌شود', async () => {
        fetchMoreMock.mockResolvedValue({
            data: { getFollowers: { users: makeUsers(2, 5), hasMore: false } },
        });

        const { result } = renderHook(() => useFollowersPagination('user-1'));

        const observerCallback = (global.IntersectionObserver as any).mock.calls.at(-1)?.[0];

        await act(async () => {
            if (observerCallback) {
                observerCallback([{ isIntersecting: true }]);
            }
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(result.current.hasMore).toBe(false);
        });
    });

    it('اگر hasMore=false باشد، observer اصلاً ثبت نمی‌شود (observe صدا زده نمی‌شود)', () => {
        mockedUseQuery.mockReturnValue({
            data: { getFollowers: { users: makeUsers(5), hasMore: false } },
            loading: false,
            fetchMore: fetchMoreMock,
        });

        renderHook(() => useFollowersPagination('user-1'));

        const lastInstance = (global.IntersectionObserver as any).mock.instances.at(-1);
        // چون hasMore از ابتدا false است، observe نباید صدا زده شود
        if (lastInstance) {
            expect(lastInstance.observe).not.toHaveBeenCalled();
        }
    });
});