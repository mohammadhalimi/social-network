import toast from 'react-hot-toast';
import { PostActions } from '../PostActions';
import { MockedProvider } from '@apollo/client/testing/react';
import { LIKE_POST, UNLIKE_POST } from '@/app/graphql/post.queries';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ✅ Mock کردن toast تا فراخوانی‌هاش رو بررسی کنیم
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

const defaultProps = {
    postId: 'post-1',
    isLiked: false,
    likesCount: 5,
    commentsCount: 3,
    onCommentClick: jest.fn(),
};

// ✅ کمک‌کننده برای رندر با MockedProvider (چون useMutation نیاز به Apollo context داره)
const renderWithMocks = (props = {}, mocks: any[] = []) => {
    return render(
        <MockedProvider mocks={mocks}>
            <PostActions {...defaultProps} {...props} />
        </MockedProvider>
    );
};

describe('PostActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================
    //  رندر پایه
    // ==========================================================
    it('تعداد لایک و کامنت را نمایش می‌دهد', () => {
        renderWithMocks();

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('با کلیک روی دکمه‌ی کامنت، onCommentClick صدا زده می‌شود', () => {
        const onCommentClick = jest.fn();
        renderWithMocks({ onCommentClick });

        fireEvent.click(screen.getByText('3'));

        expect(onCommentClick).toHaveBeenCalledTimes(1);
    });

    // ==========================================================
    //  لایک کردن (optimistic update)
    // ==========================================================
    it('با کلیک روی لایک، بلافاصله isLiked و likesCount را افزایش می‌دهد (optimistic)', async () => {
        const mocks = [
            {
                request: { query: LIKE_POST, variables: { postId: 'post-1' } },
                result: { data: { likePost: { success: true, message: 'ok', isLiked: true } } },
            },
        ];
        renderWithMocks({}, mocks);

        fireEvent.click(screen.getByText('5'));

        // ✅ باید فوراً (قبل از resolve شدن mutation) عدد جدید نمایش داده بشه
        expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('onLikeUpdate را با مقادیر جدید صدا می‌زند', async () => {
        const onLikeUpdate = jest.fn();
        const mocks = [
            {
                request: { query: LIKE_POST, variables: { postId: 'post-1' } },
                result: { data: { likePost: { success: true, message: 'ok', isLiked: true } } },
            },
        ];
        renderWithMocks({ onLikeUpdate }, mocks);

        fireEvent.click(screen.getByText('5'));

        expect(onLikeUpdate).toHaveBeenCalledWith(true, 6);

        await waitFor(() => {
            expect(screen.getByText('6')).toBeInTheDocument();
        });
    });

    it('وقتی از قبل لایک شده، با کلیک، unlikePost صدا زده و شمارنده کم می‌شود', async () => {
        const mocks = [
            {
                request: { query: UNLIKE_POST, variables: { postId: 'post-1' } },
                result: { data: { unlikePost: { success: true, message: 'ok', isLiked: false } } },
            },
        ];
        renderWithMocks({ isLiked: true, likesCount: 5 }, mocks);

        fireEvent.click(screen.getByText('5'));

        expect(screen.getByText('4')).toBeInTheDocument();
    });

    // ==========================================================
    //  ⚠️ تست‌های rollback در صورت خطای GraphQL
    //  این تست‌ها باگ فعلی کد را آشکار می‌کنند (احتمالاً با کد فعلی fail می‌شوند)
    // ==========================================================
    it('در صورت خطای GraphQL هنگام لایک، likesCount به مقدار قبلی برمی‌گردد', async () => {
        const mocks = [
            {
                request: { query: LIKE_POST, variables: { postId: 'post-1' } },
                result: {
                    errors: [{ message: 'خطای سرور' } as any],
                },
            },
        ];
        renderWithMocks({ likesCount: 5 }, mocks);

        fireEvent.click(screen.getByText('5'));

        // ابتدا optimistic update: 6
        expect(screen.getByText('6')).toBeInTheDocument();

        // بعد از خطا باید به 5 برگردد
        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    it('در صورت خطای GraphQL، toast.error نمایش داده می‌شود', async () => {
        const mocks = [
            {
                request: { query: LIKE_POST, variables: { postId: 'post-1' } },
                result: {
                    errors: [{ message: 'خطای سرور' } as any],
                },
            },
        ];
        renderWithMocks({}, mocks);

        fireEvent.click(screen.getByText('5'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });

    it('⚠️ در صورت خطا، آیکون قلب باید به حالت "لایک‌نشده" برگردد (باگ شناخته‌شده)', async () => {
        const mocks = [
            {
                request: { query: LIKE_POST, variables: { postId: 'post-1' } },
                result: {
                    errors: [{ message: 'خطای سرور' } as any],
                },
            },
        ];
        renderWithMocks({ isLiked: false }, mocks);

        const likeButton = screen.getByText('5').closest('button')!;
        fireEvent.click(likeButton);

        const classListAfterClick = likeButton.className.split(/\s+/);
        expect(classListAfterClick).toContain('text-red-500');

        await waitFor(() => {
            const classListAfterRollback = likeButton.className.split(/\s+/);
            expect(classListAfterRollback).not.toContain('text-red-500');
        });
    });

    it('در صورت خطا، onLikeUpdate با مقادیر اصلی (قبل از تغییر) دوباره صدا زده می‌شود', async () => {
        const onLikeUpdate = jest.fn();
        const mocks = [
            {
                request: { query: LIKE_POST, variables: { postId: 'post-1' } },
                result: {
                    errors: [{ message: 'خطای سرور' } as any],
                },
            },
        ];
        renderWithMocks({ isLiked: false, likesCount: 5, onLikeUpdate }, mocks);

        fireEvent.click(screen.getByText('5'));

        await waitFor(() => {
            // اولین صدا: optimistic (true, 6) - دومین صدا باید rollback باشه: (false, 5)
            expect(onLikeUpdate).toHaveBeenLastCalledWith(false, 5);
        });
    });

    // ==========================================================
    //  اشتراک‌گذاری
    // ==========================================================
    it('وقتی navigator.share موجود است، از آن استفاده می‌کند', () => {
        const shareMock = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'share', {
            value: shareMock,
            configurable: true,
        });

        renderWithMocks();

        const shareButton = screen.getAllByRole('button')[2];
        fireEvent.click(shareButton);

        expect(shareMock).toHaveBeenCalledWith({
            title: 'مشاهده پست',
            url: window.location.href,
        });

        // @ts-ignore
        delete navigator.share;
    });

    it('وقتی navigator.share موجود نیست، لینک را کپی می‌کند و toast.success نشان می‌دهد', () => {
        // @ts-ignore
        delete navigator.share;

        const writeTextMock = jest.fn();
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: writeTextMock },
            configurable: true,
        });

        renderWithMocks();

        const shareButton = screen.getAllByRole('button')[2];
        fireEvent.click(shareButton);

        expect(writeTextMock).toHaveBeenCalledWith(window.location.href);
        expect(toast.success).toHaveBeenCalledWith('لینک کپی شد!');
    });
});