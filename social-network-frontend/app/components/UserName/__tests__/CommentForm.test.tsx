// components/UserName/__tests__/CommentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommentForm } from '../CommentForm';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';

// ماک‌ها
jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

// ماک کامپوننت‌های فرزند
jest.mock('../CommentForm/ReplyHeader', () => ({
    ReplyHeader: ({ onCancel }: any) => (
        <div data-testid="reply-header">
            <span>در حال پاسخ به کامنت...</span>
            <button onClick={onCancel}>لغو</button>
        </div>
    ),
}));

jest.mock('../CommentForm/CommentInput', () => ({
    CommentInput: ({ value, onChange, onSubmit, isSubmitting, isReply }: any) => (
        <form onSubmit={onSubmit} data-testid="comment-input">
            <textarea
                data-testid="textarea"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={isReply ? 'پاسخ خود را بنویسید...' : 'نظر خود را بنویسید...'}
                disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting || !value.trim()}>
                {isSubmitting ? 'loading' : 'send'}
            </button>
        </form>
    ),
}));

describe('CommentForm', () => {
    const mockOnCommentAdded = jest.fn();
    const mockOnCancelReply = jest.fn();
    const mockCommentOnPost = jest.fn();
    const mockReplyToComment = jest.fn();

    const baseProps = {
        postId: 'post-1',
        onCommentAdded: mockOnCommentAdded,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // ✅ ماک هوشمند: بار اول کامنت، بار دوم ریپلای
        let callCount = 0;
        (useMutation as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount % 2 === 1) {
                return [mockCommentOnPost];
            }
            return [mockReplyToComment];
        });
    });

    // ==========================================
    //  تست‌های رندر اولیه
    // ==========================================
    it('1. فرم کامنت معمولی را رندر می‌کند (بدون ReplyHeader)', () => {
        render(<CommentForm {...baseProps} />);

        expect(screen.queryByTestId('reply-header')).not.toBeInTheDocument();
        expect(screen.getByTestId('comment-input')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('نظر خود را بنویسید...')).toBeInTheDocument();
    });

    it('2. در حالت ریپلای، ReplyHeader نمایش داده می‌شود', () => {
        render(<CommentForm {...baseProps} parentCommentId="comment-1" onCancelReply={mockOnCancelReply} />);

        expect(screen.getByTestId('reply-header')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('پاسخ خود را بنویسید...')).toBeInTheDocument();
    });

    it('3. دکمه ارسال وقتی متن خالی است، غیرفعال است', () => {
        render(<CommentForm {...baseProps} />);

        const submitButton = screen.getByRole('button', { name: /send/i });
        expect(submitButton).toBeDisabled();
    });

    // ==========================================
    //  تست‌های ارسال کامنت معمولی
    // ==========================================
    it('4. با ارسال کامنت موفق، onCommentAdded صدا زده می‌شود و فرم پاک می‌شود', async () => {
        mockCommentOnPost.mockResolvedValue({
            data: {
                commentOnPost: {
                    success: true,
                    comment: { id: 'c1', content: 'کامنت تست' },
                },
            },
        });

        render(<CommentForm {...baseProps} />);

        const textarea = screen.getByTestId('textarea');
        fireEvent.change(textarea, { target: { value: 'کامنت تست' } });

        fireEvent.click(screen.getByRole('button', { name: /send/i }));

        await waitFor(() => {
            expect(mockCommentOnPost).toHaveBeenCalledWith({
                variables: { postId: 'post-1', content: 'کامنت تست' },
            });
            expect(mockOnCommentAdded).toHaveBeenCalledWith({ id: 'c1', content: 'کامنت تست' });
            expect(textarea).toHaveValue('');
        });
    });

    it('5. اگر کامنت ناموفق باشد (success: false)، toast.error نمایش داده می‌شود', async () => {
        mockCommentOnPost.mockResolvedValue({
            data: {
                commentOnPost: {
                    success: false,
                    message: 'خطای ثبت کامنت',
                },
            },
        });

        render(<CommentForm {...baseProps} />);

        fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'کامنت تست' } });
        fireEvent.click(screen.getByRole('button', { name: /send/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطای ثبت کامنت');
            expect(mockOnCommentAdded).not.toHaveBeenCalled();
        });
    });

    it('6. اگر خطای GraphQL رخ دهد، toast.error نمایش داده می‌شود و کرش نمی‌کند', async () => {
        mockCommentOnPost.mockResolvedValue({
            error: { message: 'خطای شبکه' },
        });

        render(<CommentForm {...baseProps} />);

        fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'کامنت تست' } });
        fireEvent.click(screen.getByRole('button', { name: /send/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطای شبکه');
            expect(mockOnCommentAdded).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    //  تست‌های ارسال ریپلای
    // ==========================================
    it('7. با ارسال ریپلای موفق، onCommentAdded و onCancelReply صدا زده می‌شوند', async () => {
        mockReplyToComment.mockResolvedValue({
            data: {
                replyToComment: {
                    success: true,
                    comment: { id: 'r1', content: 'ریپلای تست' },
                },
            },
        });

        render(
            <CommentForm
                {...baseProps}
                parentCommentId="comment-1"
                onCancelReply={mockOnCancelReply}
            />
        );

        fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'ریپلای تست' } });
        fireEvent.click(screen.getByRole('button', { name: /send/i }));

        await waitFor(() => {
            expect(mockReplyToComment).toHaveBeenCalledWith({
                variables: { commentId: 'comment-1', content: 'ریپلای تست' },
            });
            expect(mockOnCommentAdded).toHaveBeenCalledWith({ id: 'r1', content: 'ریپلای تست' });
            expect(mockOnCancelReply).toHaveBeenCalled();
        });
    });

    it('8. با کلیک روی دکمه لغو در ReplyHeader، onCancelReply صدا زده می‌شود', () => {
        render(
            <CommentForm
                {...baseProps}
                parentCommentId="comment-1"
                onCancelReply={mockOnCancelReply}
            />
        );

        fireEvent.click(screen.getByText('لغو'));

        expect(mockOnCancelReply).toHaveBeenCalledTimes(1);
    });
});