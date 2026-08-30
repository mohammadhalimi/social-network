import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ==========================================================
// Mock: toast
// ==========================================================
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        loading: jest.fn(() => 'toast-id'),
        success: jest.fn(),
        error: jest.fn(),
        dismiss: jest.fn(),
    },
}));
import toast from 'react-hot-toast';

// ==========================================================
// Mock: Apollo useMutation
// ==========================================================
const mockCreatePost = jest.fn();
let mockOnCompleted: (() => void) | undefined;
let mockOnError: ((error: any) => void) | undefined;

jest.mock('@apollo/client/react', () => ({
    useMutation: (_mutation: any, options: any) => {
        mockOnCompleted = options?.onCompleted;
        mockOnError = options?.onError;
        return [mockCreatePost];
    },
}));

jest.mock('@/app/graphql/post.queries', () => ({
    CREATE_POST: 'CREATE_POST_MOCK',
}));

// ==========================================================
// Mock: child components
// ==========================================================
jest.mock('../CreatePostHeader', () => ({
    CreatePostHeader: ({ onAddBlock }: any) => (
        <div data-testid="create-post-header">
            <button onClick={() => onAddBlock('image')}>add-image-block</button>
            <button onClick={() => onAddBlock('text')}>add-text-block</button>
        </div>
    ),
}));

jest.mock('../CreatePostBlocks', () => ({
    CreatePostBlocks: ({ blocks, onUpdateBlock, onRemoveBlock, onError }: any) => (
        <div data-testid="create-post-blocks">
            <span data-testid="blocks-length">{blocks.length}</span>
            <button onClick={() => onUpdateBlock(0, 'content', 'عنوان تستی')}>
                set-header-content
            </button>
            <button onClick={() => onUpdateBlock(1, 'content', 'متن تستی')}>
                set-text-content
            </button>
            <button onClick={() => onRemoveBlock(0)}>remove-first-block</button>
            <button onClick={() => onError('خطای آپلود')}>trigger-error</button>
        </div>
    ),
}));

jest.mock('../CreatePostActions', () => ({
    CreatePostActions: ({ blocksCount, contentCount, isSubmitting, onSubmit, onCancel }: any) => (
        <div data-testid="create-post-actions">
            <span data-testid="actions-blocks-count">{blocksCount}</span>
            <span data-testid="actions-content-count">{contentCount}</span>
            <span data-testid="actions-is-submitting">{String(isSubmitting)}</span>
            <button onClick={onSubmit}>submit</button>
            <button onClick={onCancel}>cancel</button>
        </div>
    ),
}));

import { CreatePost } from '../CreatePost';

describe('CreatePost', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreatePost.mockResolvedValue(undefined);
    });

    it('renders header, blocks and actions with the initial two blocks', () => {
        render(<CreatePost />);

        expect(screen.getByTestId('create-post-header')).toBeInTheDocument();
        expect(screen.getByTestId('create-post-blocks')).toBeInTheDocument();
        expect(screen.getByTestId('create-post-actions')).toBeInTheDocument();
        expect(screen.getByTestId('blocks-length')).toHaveTextContent('2');
        expect(screen.getByTestId('actions-blocks-count')).toHaveTextContent('2');
    });

    it('adds a new block when onAddBlock is triggered from the header', () => {
        render(<CreatePost />);

        fireEvent.click(screen.getByText('add-image-block'));

        expect(screen.getByTestId('blocks-length')).toHaveTextContent('3');
    });

    it('removes a block when onRemoveBlock is triggered', () => {
        render(<CreatePost />);

        fireEvent.click(screen.getByText('add-text-block')); // 3 بلوک می‌شه
        fireEvent.click(screen.getByText('remove-first-block'));

        expect(screen.getByTestId('blocks-length')).toHaveTextContent('2');
    });

    it('does not remove the last remaining block', () => {
        // با کلیک مکرر روی remove-first-block بلوک‌ها رو کم می‌کنیم تا به ۱ برسه
        render(<CreatePost />);

        fireEvent.click(screen.getByText('remove-first-block')); // از 2 -> 1
        expect(screen.getByTestId('blocks-length')).toHaveTextContent('1');

        fireEvent.click(screen.getByText('remove-first-block')); // باید همون 1 بمونه
        expect(screen.getByTestId('blocks-length')).toHaveTextContent('1');
    });

    it('updates contentCount as header/text content is filled in', () => {
        render(<CreatePost />);

        expect(screen.getByTestId('actions-content-count')).toHaveTextContent('0');

        fireEvent.click(screen.getByText('set-header-content'));
        expect(screen.getByTestId('actions-content-count')).toHaveTextContent('1');

        fireEvent.click(screen.getByText('set-text-content'));
        expect(screen.getByTestId('actions-content-count')).toHaveTextContent('2');
    });

    it('shows an error toast when CreatePostBlocks reports an upload error', () => {
        render(<CreatePost />);

        fireEvent.click(screen.getByText('trigger-error'));

        expect(toast.error).toHaveBeenCalledWith('خطای آپلود', expect.any(Object));
    });

    describe('handleSubmit validation', () => {
        it('shows a warning toast and does not call createPost when header/text are empty', () => {
            render(<CreatePost />);

            fireEvent.click(screen.getByText('submit'));

            expect(toast.error).toHaveBeenCalledWith(
                'لطفاً حداقل یک عنوان و یک متن وارد کنید',
                expect.any(Object)
            );
            expect(mockCreatePost).not.toHaveBeenCalled();
        });

        it('calls createPost with the serialized content when header and text are filled', async () => {
            render(<CreatePost />);

            fireEvent.click(screen.getByText('set-header-content'));
            fireEvent.click(screen.getByText('set-text-content'));
            fireEvent.click(screen.getByText('submit'));

            await waitFor(() => {
                expect(mockCreatePost).toHaveBeenCalledTimes(1);
            });

            const callArg = mockCreatePost.mock.calls[0][0];
            const parsedContent = JSON.parse(callArg.variables.content);

            expect(parsedContent.blocks).toEqual([
                { type: 'header', content: 'عنوان تستی' },
                { type: 'text', content: 'متن تستی' },
            ]);
        });

        it('shows isSubmitting=true while the request is pending', async () => {
            let resolvePromise: () => void;
            mockCreatePost.mockReturnValueOnce(
                new Promise<void>((resolve) => {
                    resolvePromise = resolve;
                })
            );

            render(<CreatePost />);

            fireEvent.click(screen.getByText('set-header-content'));
            fireEvent.click(screen.getByText('set-text-content'));
            fireEvent.click(screen.getByText('submit'));

            await waitFor(() => {
                expect(screen.getByTestId('actions-is-submitting')).toHaveTextContent('true');
            });

            resolvePromise!();
        });
    });

    describe('Apollo onCompleted / onError callbacks', () => {
        it('shows a success toast and resets the form on onCompleted', () => {
            render(<CreatePost />);

            fireEvent.click(screen.getByText('set-header-content'));
            fireEvent.click(screen.getByText('set-text-content'));

            act(() => {
                mockOnCompleted?.();
            });

            expect(toast.success).toHaveBeenCalledWith(
                'پست شما با موفقیت منتشر شد! 🎉',
                expect.any(Object)
            );
            expect(screen.getByTestId('actions-is-submitting')).toHaveTextContent('false');
            expect(screen.getByTestId('actions-content-count')).toHaveTextContent('0');
        });

        it('shows a generic error toast for unrelated errors', () => {
            render(<CreatePost />);

            act(() => {
                mockOnError?.({ message: 'خطای سرور' });
            });

            expect(toast.error).toHaveBeenCalledWith('خطای سرور', expect.any(Object));
        });

        it('shows an auth-specific error message when the error mentions login/token/auth', () => {
            render(<CreatePost />);

            act(() => {
                mockOnError?.({ message: 'توکن نامعتبر است' });
            });

            expect(toast.error).toHaveBeenCalledWith(
                'لطفاً ابتدا وارد حساب کاربری خود شوید.',
                expect.any(Object)
            );
        });

        it('sets isSubmitting to false when onError fires', () => {
            render(<CreatePost />);

            fireEvent.click(screen.getByText('set-header-content'));
            fireEvent.click(screen.getByText('set-text-content'));

            act(() => {
                mockOnError?.({ message: 'خطا' });
            });

            expect(screen.getByTestId('actions-is-submitting')).toHaveTextContent('false');
        });
    });

    it('resets the form when onCancel is triggered', () => {
        render(<CreatePost />);

        fireEvent.click(screen.getByText('add-image-block')); // 3 بلوک
        fireEvent.click(screen.getByText('set-header-content'));

        fireEvent.click(screen.getByText('cancel'));

        expect(screen.getByTestId('blocks-length')).toHaveTextContent('2');
        expect(screen.getByTestId('actions-content-count')).toHaveTextContent('0');
    });
});