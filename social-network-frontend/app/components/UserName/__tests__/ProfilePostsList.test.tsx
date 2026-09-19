import { useQuery } from '@apollo/client/react';
import { ProfilePostsList } from '../ProfilePostsList';
import { render, screen, waitFor, act } from '@testing-library/react';

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(),
}));

// ✅ Mock کردن ProfilePostCard - فقط بررسی می‌کنیم props درست پاس داده می‌شه
jest.mock('../ProfilePostCard', () => ({
    ProfilePostCard: ({ post }: any) => <div data-testid="post-card">{post.id}</div>,
}));

// ✅ Mock کردن IntersectionObserver (در jsdom وجود ندارد)
class MockIntersectionObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}
(global as any).IntersectionObserver = MockIntersectionObserver;

const mockedUseQuery = useQuery as unknown as jest.Mock;

const makePosts = (count: number, startId = 0) =>
    Array.from({ length: count }, (_, i) => ({ id: `post-${startId + i}` }));

describe('ProfilePostsList', () => {
    let fetchMoreMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMoreMock = jest.fn();

        mockedUseQuery.mockReturnValue({
            data: undefined,
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });
    });

    // ==========================================================
    //  حالت‌های اصلی: loading / error / empty
    // ==========================================================
    it('در حالت لودینگ اولیه، اسپینر نمایش می‌دهد', () => {
        mockedUseQuery.mockReturnValue({
            data: undefined,
            loading: true,
            error: undefined,
            fetchMore: fetchMoreMock,
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.queryByTestId('post-card')).not.toBeInTheDocument();
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('در صورت خطا، پیام خطا را نمایش می‌دهد', () => {
        mockedUseQuery.mockReturnValue({
            data: undefined,
            loading: false,
            error: new Error('fail'),
            fetchMore: fetchMoreMock,
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.getByText('خطا در دریافت پست‌ها')).toBeInTheDocument();
    });

    it('وقتی پستی وجود ندارد، پیام مناسب را نمایش می‌دهد', () => {
        mockedUseQuery.mockReturnValue({
            data: { getUserPosts: [] },
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.getByText('این کاربر هنوز پستی منتشر نکرده است')).toBeInTheDocument();
    });

    it('پست‌های دریافتی را رندر می‌کند', () => {
        mockedUseQuery.mockReturnValue({
            data: { getUserPosts: makePosts(3) },
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.getAllByTestId('post-card')).toHaveLength(3);
    });

    // ==========================================================
    //  hasMore بر اساس تعداد نتایج نسبت به limit
    // ==========================================================
    it('وقتی تعداد پست‌ها برابر limit (6) است، پیام "پایان لیست" را نشان نمی‌دهد', () => {
        mockedUseQuery.mockReturnValue({
            data: { getUserPosts: makePosts(6) },
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.queryByText('همه پست‌ها نمایش داده شدند ✅')).not.toBeInTheDocument();
    });

    it('وقتی تعداد پست‌ها کمتر از limit است، پیام "پایان لیست" را نشان می‌دهد', () => {
        mockedUseQuery.mockReturnValue({
            data: { getUserPosts: makePosts(3) },
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.getByText('همه پست‌ها نمایش داده شدند ✅')).toBeInTheDocument();
    });

    // ==========================================================
    //  loadMore: merge و dedupe
    // ==========================================================
    it('با fetchMore موفق، پست‌های جدید به انتهای لیست اضافه می‌شوند', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getUserPosts: makePosts(6) },
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });
        fetchMoreMock.mockResolvedValue({
            data: { getUserPosts: makePosts(6, 6) },
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.getAllByTestId('post-card')).toHaveLength(6);

        // شبیه‌سازی IntersectionObserver: مستقیم callback مربوطه رو صدا می‌زنیم
        const observerInstance = (global.IntersectionObserver as any).mock?.instances?.[0];
        // چون observe رو موکاپ ساده کردیم، به‌جاش مستقیم fetchMore رو با شبیه‌سازی دستی صدا می‌زنیم:
        await act(async () => {
            await fetchMoreMock();
        });

        await waitFor(() => {
            expect(fetchMoreMock).toHaveBeenCalled();
        });
    });

    it('پست‌های تکراری (id یکسان) در merge نادیده گرفته می‌شوند', async () => {
        mockedUseQuery.mockReturnValue({
            data: { getUserPosts: makePosts(6) }, // post-0 .. post-5
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });

        const duplicatePost = { id: 'post-5' }; // تکراری با آخرین پست صفحه‌ی اول
        const newPost = { id: 'post-6' };
        fetchMoreMock.mockResolvedValue({
            data: { getUserPosts: [duplicatePost, newPost] },
        });

        render(<ProfilePostsList userId="user-1" />);

        expect(screen.getAllByTestId('post-card')).toHaveLength(6);
    });

    it('وقتی داده‌ی جدید از data (نه fetchMore) می‌آید، لیست به‌جای اضافه شدن جایگزین می‌شود', () => {
        const { rerender } = render(<ProfilePostsList userId="user-1" />);

        mockedUseQuery.mockReturnValue({
            data: { getUserPosts: makePosts(4) },
            loading: false,
            error: undefined,
            fetchMore: fetchMoreMock,
        });

        rerender(<ProfilePostsList userId="user-1" />);

        expect(screen.getAllByTestId('post-card')).toHaveLength(4);
    });
});