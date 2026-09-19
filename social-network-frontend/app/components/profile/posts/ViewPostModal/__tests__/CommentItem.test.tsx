import type { PostComment } from '../types';
import { CommentItem } from '../CommentItem';
import { render, screen, fireEvent } from '@testing-library/react';

// ✅ Mock کردن next/image (چون در محیط تست به بک‌اند Next.js دسترسی نداریم)
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

// ✅ Mock کردن CommentForm - فقط رفتار CommentItem رو تست می‌کنیم، نه خود فرم
jest.mock('../../../../UserName/CommentForm', () => ({
    CommentForm: ({ onCommentAdded, onCancelReply }: any) => (
        <div data-testid="comment-form">
            <button onClick={() => onCommentAdded({ id: 'reply-1', content: 'پاسخ تست' })}>
                ارسال پاسخ تستی
            </button>
            <button onClick={onCancelReply}>لغو</button>
        </div>
    ),
}));

// ✅ Mock کردن ReplyItem - فقط بررسی می‌کنیم رندر می‌شه یا نه
jest.mock('../ReplyItem', () => ({
    ReplyItem: ({ reply }: any) => <div data-testid="reply-item">{reply.content}</div>,
}));

const mockComment: PostComment = {
    id: 'comment-1',
    content: 'این یک کامنت تستی است',
    createdAt: '2026-01-15T10:00:00.000Z',
    user: {
        id: 'user-1',
        username: 'testuser',
        fullName: 'کاربر تست',
        avatar: null,
    },
    replies: [],
};

describe('CommentItem', () => {
    const defaultProps = {
        comment: mockComment,
        postId: 'post-1',
        replyingTo: null,
        setReplyingTo: jest.fn(),
        onReplyAdded: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================
    //  رندر پایه
    // ==========================================================
    it('نام کاربر و متن کامنت را نمایش می‌دهد', () => {
        render(<CommentItem {...defaultProps} />);

        expect(screen.getByText('کاربر تست')).toBeInTheDocument();
        expect(screen.getByText('این یک کامنت تستی است')).toBeInTheDocument();
    });

    it('وقتی کاربر avatar ندارد، حرف اول fullName را نمایش می‌دهد', () => {
        render(<CommentItem {...defaultProps} />);

        expect(screen.getByText('ک')).toBeInTheDocument();
    });

    it('وقتی fullName خالی باشد، username را نمایش می‌دهد', () => {
        const commentWithoutName: PostComment = {
            ...mockComment,
            user: { ...mockComment.user, fullName: '' },
        };
        render(<CommentItem {...defaultProps} comment={commentWithoutName} />);

        expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('تاریخ فرمت‌شده کامنت را نمایش می‌دهد', () => {
        render(<CommentItem {...defaultProps} />);

        // formatPersianDate واقعی صدا زده می‌شود، پس فقط بررسی می‌کنیم چیزی رندر شده و خالی نیست
        const dateElements = screen.getAllByText(/.+/, { selector: 'span.text-\\[11px\\]' });
        expect(dateElements.length).toBeGreaterThan(0);
    });

    // ==========================================================
    //  دکمه‌ی پاسخ و فرم ریپلای
    // ==========================================================
    it('با کلیک روی دکمه‌ی پاسخ، setReplyingTo را با کامنت فعلی صدا می‌زند', () => {
        const setReplyingTo = jest.fn();
        render(<CommentItem {...defaultProps} setReplyingTo={setReplyingTo} />);

        fireEvent.click(screen.getByText('پاسخ'));

        expect(setReplyingTo).toHaveBeenCalledWith(mockComment);
    });

    it('وقتی روی کامنتی که در حال پاسخ به آن هستیم دوباره کلیک شود، replyingTo را null می‌کند', () => {
        const setReplyingTo = jest.fn();
        render(
            <CommentItem
                {...defaultProps}
                replyingTo={mockComment}
                setReplyingTo={setReplyingTo}
            />
        );

        fireEvent.click(screen.getByText('پاسخ'));

        expect(setReplyingTo).toHaveBeenCalledWith(null);
    });

    it('وقتی replyingTo.id با comment.id برابر نیست، فرم پاسخ نمایش داده نمی‌شود', () => {
        const otherComment: PostComment = { ...mockComment, id: 'other-comment' };
        render(<CommentItem {...defaultProps} replyingTo={otherComment} />);

        expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
    });

    it('وقتی replyingTo.id با comment.id برابر است، فرم پاسخ نمایش داده می‌شود', () => {
        render(<CommentItem {...defaultProps} replyingTo={mockComment} />);

        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    });

    it('با ارسال موفق پاسخ، onReplyAdded با شناسه‌ی کامنت والد و پاسخ جدید صدا زده می‌شود', () => {
        const onReplyAdded = jest.fn();
        render(
            <CommentItem
                {...defaultProps}
                replyingTo={mockComment}
                onReplyAdded={onReplyAdded}
            />
        );

        fireEvent.click(screen.getByText('ارسال پاسخ تستی'));

        expect(onReplyAdded).toHaveBeenCalledWith('comment-1', {
            id: 'reply-1',
            content: 'پاسخ تست',
        });
    });

    it('با کلیک روی لغو در فرم پاسخ، setReplyingTo با null صدا زده می‌شود', () => {
        const setReplyingTo = jest.fn();
        render(
            <CommentItem
                {...defaultProps}
                replyingTo={mockComment}
                setReplyingTo={setReplyingTo}
            />
        );

        fireEvent.click(screen.getByText('لغو'));

        expect(setReplyingTo).toHaveBeenCalledWith(null);
    });

    // ==========================================================
    //  نمایش/پنهان کردن پاسخ‌ها
    // ==========================================================
    it('وقتی پاسخی وجود ندارد، دکمه‌ی نمایش پاسخ‌ها رندر نمی‌شود', () => {
        render(<CommentItem {...defaultProps} comment={{ ...mockComment, replies: [] }} />);

        expect(screen.queryByText(/نمایش.*پاسخ/)).not.toBeInTheDocument();
    });

    it('وقتی پاسخ وجود دارد، دکمه‌ی "نمایش N پاسخ" را نشان می‌دهد', () => {
        const commentWithReplies: PostComment = {
            ...mockComment,
            replies: [
                { id: 'reply-1', content: 'پاسخ ۱', createdAt: '2026-01-15T11:00:00.000Z', user: mockComment.user },
                { id: 'reply-2', content: 'پاسخ ۲', createdAt: '2026-01-15T12:00:00.000Z', user: mockComment.user },
            ],
        };
        render(<CommentItem {...defaultProps} comment={commentWithReplies} />);

        expect(screen.getByText(/نمایش 2 پاسخ/)).toBeInTheDocument();
    });

    it('پاسخ‌ها ابتدا مخفی هستند (ReplyItem رندر نمی‌شود)', () => {
        const commentWithReplies: PostComment = {
            ...mockComment,
            replies: [
                { id: 'reply-1', content: 'پاسخ ۱', createdAt: '2026-01-15T11:00:00.000Z', user: mockComment.user },
            ],
        };
        render(<CommentItem {...defaultProps} comment={commentWithReplies} />);

        expect(screen.queryByTestId('reply-item')).not.toBeInTheDocument();
    });

    it('با کلیک روی دکمه‌ی نمایش، پاسخ‌ها ظاهر و متن دکمه به "پنهان کردن" تغییر می‌کند', () => {
        const commentWithReplies: PostComment = {
            ...mockComment,
            replies: [
                { id: 'reply-1', content: 'پاسخ ۱', createdAt: '2026-01-15T11:00:00.000Z', user: mockComment.user },
            ],
        };
        render(<CommentItem {...defaultProps} comment={commentWithReplies} />);

        fireEvent.click(screen.getByText(/نمایش 1 پاسخ/));

        expect(screen.getAllByTestId('reply-item')).toHaveLength(1);
        expect(screen.getByText(/پنهان کردن 1 پاسخ/)).toBeInTheDocument();
    });

    it('با کلیک دوباره روی دکمه، پاسخ‌ها دوباره پنهان می‌شوند', () => {
        const commentWithReplies: PostComment = {
            ...mockComment,
            replies: [
                { id: 'reply-1', content: 'پاسخ ۱', createdAt: '2026-01-15T11:00:00.000Z', user: mockComment.user },
            ],
        };
        render(<CommentItem {...defaultProps} comment={commentWithReplies} />);

        const toggleButton = screen.getByText(/نمایش 1 پاسخ/);
        fireEvent.click(toggleButton);
        fireEvent.click(screen.getByText(/پنهان کردن 1 پاسخ/));

        expect(screen.queryByTestId('reply-item')).not.toBeInTheDocument();
        expect(screen.getByText(/نمایش 1 پاسخ/)).toBeInTheDocument();
    });

    it('همه‌ی پاسخ‌ها را با ReplyItem جداگانه رندر می‌کند', () => {
        const commentWithReplies: PostComment = {
            ...mockComment,
            replies: [
                { id: 'reply-1', content: 'پاسخ اول', createdAt: '2026-01-15T11:00:00.000Z', user: mockComment.user },
                { id: 'reply-2', content: 'پاسخ دوم', createdAt: '2026-01-15T12:00:00.000Z', user: mockComment.user },
            ],
        };
        render(<CommentItem {...defaultProps} comment={commentWithReplies} />);

        fireEvent.click(screen.getByText(/نمایش 2 پاسخ/));

        expect(screen.getByText('پاسخ اول')).toBeInTheDocument();
        expect(screen.getByText('پاسخ دوم')).toBeInTheDocument();
    });
});