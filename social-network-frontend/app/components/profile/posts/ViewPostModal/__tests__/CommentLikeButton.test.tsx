import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { CommentLikeButton } from '../CommentLikeButton';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ماک‌ها
jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

// ماک کردن lucide-react
jest.mock('lucide-react', () => ({
    Heart: ({ className }: any) => <svg data-testid="heart-icon" className={className} />,
}));

describe('CommentLikeButton', () => {
    const mockLikeComment = jest.fn();
    const mockUnlikeComment = jest.fn();

    const baseProps = {
        commentId: 'comment-1',
        initialIsLiked: false,
        initialLikesCount: 3,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // ماک useMutation: اولی for likeComment، دومی for unlikeComment
        let callCount = 0;
        (useMutation as jest.Mock).mockReset();
        (useMutation as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount % 2 === 1) {
                return [mockLikeComment];
            }
            return [mockUnlikeComment];
        });
    });

    // ==========================================
    //  تست‌های رندر اولیه
    // ==========================================
    it('1. وقتی isLiked=false باشد، آیکون Heart بدون fill و رنگ پیش‌فرض است', () => {
        render(<CommentLikeButton {...baseProps} />);

        const heart = screen.getByTestId('heart-icon');
        expect(heart).toBeInTheDocument();
        expect(heart).not.toHaveClass('fill-red-500');
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('2. وقتی isLiked=true باشد، آیکون Heart با fill-red-500 نمایش داده می‌شود', () => {
        render(<CommentLikeButton {...baseProps} initialIsLiked={true} />);

        const heart = screen.getByTestId('heart-icon');
        expect(heart).toHaveClass('fill-red-500');
    });

    it('3. وقتی likesCount=0 باشد، عدد نمایش داده نمی‌شود', () => {
        render(<CommentLikeButton {...baseProps} initialLikesCount={0} />);

        // عدد 0 نباید نمایش داده شود
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('4. وقتی likesCount>0 باشد، عدد نمایش داده می‌شود', () => {
        render(<CommentLikeButton {...baseProps} initialLikesCount={5} />);

        expect(screen.getByText('5')).toBeInTheDocument();
    });

    // ==========================================
    //  تست‌های لایک کردن
    // ==========================================
    it('5. با کلیک روی دکمه، isLiked=true و likesCount+1 می‌شود و LIKE_COMMENT صدا زده می‌شود', async () => {
        mockLikeComment.mockResolvedValue({ data: { likeComment: { success: true } } });

        render(<CommentLikeButton {...baseProps} />);

        fireEvent.click(screen.getByRole('button'));

        // ✅ Optimistic Update
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByTestId('heart-icon')).toHaveClass('fill-red-500');

        // ✅ فراخوانی Mutation
        await waitFor(() => {
            expect(mockLikeComment).toHaveBeenCalledWith({
                variables: { commentId: 'comment-1' },
            });
        });
    });

    it('6. با کلیک روی دکمه‌ای که قبلاً لایک شده، unlikeComment صدا زده می‌شود', async () => {
        mockUnlikeComment.mockResolvedValue({ data: { unlikeComment: { success: true } } });

        render(<CommentLikeButton {...baseProps} initialIsLiked={true} initialLikesCount={5} />);

        fireEvent.click(screen.getByRole('button'));

        // ✅ Optimistic Update
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByTestId('heart-icon')).not.toHaveClass('fill-red-500');

        // ✅ فراخوانی Mutation
        await waitFor(() => {
            expect(mockUnlikeComment).toHaveBeenCalledWith({
                variables: { commentId: 'comment-1' },
            });
        });
    });

    // ==========================================
    //  تست‌های مدیریت خطا (Rollback)
    // ==========================================
    it('7. اگر likeComment خطا بدهد، وضعیت قبلی برگردانده می‌شود', async () => {
        mockLikeComment.mockResolvedValue({
            error: { message: 'خطای لایک' },
        });

        render(<CommentLikeButton {...baseProps} />);

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            // ✅ بازگردانی به حالت قبلی: likesCount=3 و isLiked=false
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByTestId('heart-icon')).not.toHaveClass('fill-red-500');
        });

        expect(toast.error).toHaveBeenCalledWith('خطای لایک');
    });

    it('8. اگر unlikeComment خطا بدهد، وضعیت قبلی برگردانده می‌شود', async () => {
        mockUnlikeComment.mockResolvedValue({
            error: { message: 'خطای آنلایک' },
        });

        render(<CommentLikeButton {...baseProps} initialIsLiked={true} initialLikesCount={5} />);

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            // ✅ بازگردانی به حالت قبلی: likesCount=5 و isLiked=true
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByTestId('heart-icon')).toHaveClass('fill-red-500');
        });

        expect(toast.error).toHaveBeenCalledWith('خطای آنلایک');
    });

    it('9. اگر خطای شبکه‌ای رخ دهد (Promise Reject)، وضعیت قبلی برگردانده می‌شود', async () => {
        mockLikeComment.mockRejectedValue(new Error('Network Error'));

        render(<CommentLikeButton {...baseProps} />);

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByTestId('heart-icon')).not.toHaveClass('fill-red-500');
        });

        expect(toast.error).toHaveBeenCalledWith('Network Error');
    });

    it('10. اگر likesCount صفر باشد و آنلایک کنیم، تعداد منفی نمی‌شود', () => {
        render(<CommentLikeButton {...baseProps} initialIsLiked={true} initialLikesCount={0} />);

        fireEvent.click(screen.getByRole('button'));

        // ✅ Math.max(0, 0 - 1) = 0
        expect(screen.queryByText('-1')).not.toBeInTheDocument();
        expect(screen.queryByText('0')).not.toBeInTheDocument(); // عدد 0 نمایش داده نمی‌شود
    });
});