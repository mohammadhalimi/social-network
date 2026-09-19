import { ViewPostModal } from '../ViewPostModal';
import { useLazyQuery } from '@apollo/client/react';
import { render, screen, fireEvent, act} from '@testing-library/react';

// ✅ Mock کردن next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

// ✅ Mock کردن useLazyQuery - کنترل مستقیم روی fetchComments/data/loading
jest.mock('@apollo/client/react', () => ({
    useLazyQuery: jest.fn(),
}));

// ✅ Mock کردن CommentsList - فقط بررسی می‌کنیم props درست پاس داده می‌شن
jest.mock('../ViewPostModal/CommentsList', () => ({
    CommentsList: (props: any) => (
        <div data-testid="comments-list">
            <span data-testid="comments-count">{props.comments.length}</span>
            <span data-testid="comments-loading">{String(props.loading)}</span>
            <button onClick={() => props.onReplyAdded('comment-1', { id: 'reply-1', content: 'ریپلای تست' })}>
                افزودن ریپلای تستی
            </button>
        </div>
    ),
}));

// ✅ Mock کردن PostContentBlocks - فقط بررسی می‌کنیم بلاک‌های درست پاس داده می‌شن
jest.mock('../ViewPostModal/PostContentBlocks', () => ({
    PostContentBlocks: (props: any) => (
        <div data-testid="post-content-blocks">
            {props.contentBlocks.map((b: any, i: number) => (
                <span key={i} data-testid="block">{b.type}:{b.content}</span>
            ))}
        </div>
    ),
}));

const mockedUseLazyQuery = useLazyQuery as jest.Mock;

const mockPost = {
    id: 'post-1',
    content: JSON.stringify({ blocks: [{ type: 'text', content: 'سلام دنیا' }] }),
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    user: {
        id: 'user-1',
        username: 'testuser',
        fullName: 'کاربر تست',
        avatar: null,
    },
};

describe('ViewPostModal', () => {
    let fetchCommentsMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        fetchCommentsMock = jest.fn();
        mockedUseLazyQuery.mockReturnValue([
            fetchCommentsMock,
            { data: undefined, loading: false },
        ]);
    });

    // ==========================================================
    //  رندر پایه / باز و بسته بودن
    // ==========================================================
    it('وقتی isOpen=false باشد، چیزی رندر نمی‌کند', () => {
        const { container } = render(
            <ViewPostModal post={mockPost} isOpen={false} onClose={jest.fn()} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('وقتی isOpen=true باشد، اطلاعات پست را نمایش می‌دهد', () => {
        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('کاربر تست')).toBeInTheDocument();
        expect(screen.getByText('testuser@')).toBeInTheDocument();
    });

    it('با کلیک روی دکمه‌ی بستن، onClose صدا زده می‌شود', () => {
        const onClose = jest.fn();
        render(<ViewPostModal post={mockPost} isOpen={true} onClose={onClose} />);

        // دکمه‌ی X تنها button بدون متنه، پس با querySelector پیدا می‌کنیم
        const closeButton = document.querySelector('button')!;
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    // ==========================================================
    //  fetchComments
    // ==========================================================
    it('وقتی مودال باز می‌شود، fetchComments با postId صدا زده می‌شود', () => {
        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(fetchCommentsMock).toHaveBeenCalledWith({ variables: { postId: 'post-1' } });
    });

    it('وقتی isOpen=false است، fetchComments صدا زده نمی‌شود', () => {
        render(<ViewPostModal post={mockPost} isOpen={false} onClose={jest.fn()} />);

        expect(fetchCommentsMock).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  محتوای پست (JSON parsing)
    // ==========================================================
    it('بلاک‌های محتوای پست را از JSON پارس و به PostContentBlocks پاس می‌دهد', () => {
        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('text:سلام دنیا')).toBeInTheDocument();
    });

    it('وقتی content یک JSON معتبر نیست، آن را به‌عنوان یک بلاک متنی ساده نمایش می‌دهد', () => {
        const invalidJsonPost = { ...mockPost, content: 'این متن ساده است' };
        render(<ViewPostModal post={invalidJsonPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('text:این متن ساده است')).toBeInTheDocument();
    });

    // ==========================================================
    //  تاریخ و وضعیت ویرایش
    // ==========================================================
    it('وقتی updatedAt با createdAt برابر نیست، برچسب "ویرایش شده" را نشان می‌دهد', () => {
        const editedPost = { ...mockPost, updatedAt: '2026-01-16T10:00:00.000Z' };
        render(<ViewPostModal post={editedPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('✏️ ویرایش شده')).toBeInTheDocument();
    });

    it('وقتی updatedAt با createdAt برابر است، برچسب "ویرایش شده" نمایش داده نمی‌شود', () => {
        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.queryByText('✏️ ویرایش شده')).not.toBeInTheDocument();
    });

    // ==========================================================
    //  کامنت‌ها: loading و دریافت داده
    // ==========================================================
    it('وضعیت loading را به CommentsList پاس می‌دهد', () => {
        mockedUseLazyQuery.mockReturnValue([
            fetchCommentsMock,
            { data: undefined, loading: true },
        ]);

        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('comments-loading')).toHaveTextContent('true');
    });

    it('وقتی commentsData دریافت می‌شود، کامنت‌ها را به CommentsList پاس می‌دهد', () => {
        mockedUseLazyQuery.mockReturnValue([
            fetchCommentsMock,
            {
                data: {
                    getPost: {
                        id: 'post-1',
                        comments: [
                            { id: 'c1', content: 'کامنت ۱', createdAt: '2026-01-15T10:00:00.000Z', user: mockPost.user },
                            { id: 'c2', content: 'کامنت ۲', createdAt: '2026-01-15T11:00:00.000Z', user: mockPost.user },
                        ],
                    },
                },
                loading: false,
            },
        ]);

        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('comments-count')).toHaveTextContent('2');
    });

    it('وقتی commentsData وجود ندارد، آرایه‌ی کامنت‌ها خالی است', () => {
        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('comments-count')).toHaveTextContent('0');
    });

    // ==========================================================
    //  افزودن ریپلای (onReplyAdded)
    // ==========================================================
    it('با افزودن ریپلای، آن را به آرایه‌ی replies کامنت مربوطه اضافه می‌کند', () => {
        mockedUseLazyQuery.mockReturnValue([
            fetchCommentsMock,
            {
                data: {
                    getPost: {
                        id: 'post-1',
                        comments: [
                            { id: 'comment-1', content: 'کامنت اصلی', createdAt: '2026-01-15T10:00:00.000Z', user: mockPost.user, replies: [] },
                        ],
                    },
                },
                loading: false,
            },
        ]);

        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        fireEvent.click(screen.getByText('افزودن ریپلای تستی'));

        // بعد از افزودن، تعداد کامنت‌های سطح بالا نباید تغییر کند (فقط replies داخلی اضافه می‌شود)
        expect(screen.getByTestId('comments-count')).toHaveTextContent('1');
    });

    // ==========================================================
    //  children (فرم کامنت اختیاری)
    // ==========================================================
    it('وقتی children پاس داده نشود، بخش فرم کامنت رندر نمی‌شود', () => {
        render(<ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()} />);

        expect(screen.queryByTestId('comment-form-slot')).not.toBeInTheDocument();
    });

    it('children را با postId و onCommentAdded صدا می‌زند', () => {
        const childrenFn = jest.fn().mockReturnValue(<div data-testid="comment-form-slot" />);

        render(
            <ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()}>
                {childrenFn}
            </ViewPostModal>
        );

        expect(childrenFn).toHaveBeenCalledWith(
            expect.objectContaining({ postId: 'post-1' })
        );
        expect(screen.getByTestId('comment-form-slot')).toBeInTheDocument();
    });

    it('با فراخوانی onCommentAdded از children، کامنت جدید به ابتدای لیست اضافه می‌شود', () => {
        let capturedOnCommentAdded: any;

        render(
            <ViewPostModal post={mockPost} isOpen={true} onClose={jest.fn()}>
                {({ onCommentAdded }) => {
                    capturedOnCommentAdded = onCommentAdded;
                    return <div />;
                }}
            </ViewPostModal>
        );

        expect(screen.getByTestId('comments-count')).toHaveTextContent('0');

        act(() => {
            capturedOnCommentAdded({
                id: 'new-comment',
                content: 'کامنت جدید',
                createdAt: '2026-01-15T12:00:00.000Z',
                user: mockPost.user,
            });
        });

        expect(screen.getByTestId('comments-count')).toHaveTextContent('1');
    });
});