// app/components/modals/__tests__/PostModalRenderer.test.tsx (یا مسیر واقعی)

import { useQuery } from '@apollo/client/react';
import { PostModalRenderer } from '../PostModalRenderer';
import {
    render,
    screen,
    fireEvent
} from '@testing-library/react';

// ✅ mock Redux
const mockDispatch = jest.fn();
let mockPostId: string | null = null;

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => selector({ ui: { postModalId: mockPostId } }),
}));

jest.mock('@/app/redux/uiSlice', () => ({
    closePostModal: () => ({ type: 'CLOSE_POST_MODAL' }),
}));

// ✅ mock Apollo useQuery
let mockQueryReturn: any = { data: null, loading: false, error: null };

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(() => mockQueryReturn),
}));

// ✅ mock ViewPostModal
jest.mock('@/app/components/profile/posts/ViewPostModal', () => ({
    ViewPostModal: ({ children, onClose }: any) => (
        <div data-testid="view-post-modal">
            <button onClick={onClose}>close-view</button>
            {children({ postId: 'p1', onCommentAdded: jest.fn() })}
        </div>
    ),
}));

// ✅ mock CommentForm
jest.mock('@/app/components/UserName/CommentForm', () => ({
    CommentForm: () => <div data-testid="comment-form" />,
}));

describe('PostModalRenderer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPostId = null;
        mockQueryReturn = { data: null, loading: false, error: null };
    });

    it('renders nothing when postId is null', () => {
        const { container } = render(<PostModalRenderer />);
        expect(container.firstChild).toBeNull();
    });

    it('skips query when postId is null', () => {
        render(<PostModalRenderer />);
        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ skip: true })
        );
    });

    it('renders loading state when loading=true', () => {
        mockPostId = 'p1';
        mockQueryReturn = { loading: true, data: null, error: null };

        render(<PostModalRenderer />);
        expect(screen.getByTestId('modal-loading')).toBeInTheDocument();
    });

    it('renders error state when query has error', () => {
        mockPostId = 'p1';
        mockQueryReturn = { loading: false, data: null, error: { message: 'Network error' } };

        render(<PostModalRenderer />);
        expect(screen.getByTestId('modal-error')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('renders error state when data.getPost is null', () => {
        mockPostId = 'p1';
        mockQueryReturn = { loading: false, data: { getPost: null }, error: null };

        render(<PostModalRenderer />);
        expect(screen.getByTestId('modal-error')).toBeInTheDocument();
        expect(screen.getByText('این پست حذف شده یا در دسترس نیست.')).toBeInTheDocument();
    });

    it('dispatches closePostModal when close button is clicked', () => {
        mockPostId = 'p1';
        mockQueryReturn = { loading: false, data: null, error: null };

        render(<PostModalRenderer />);
        fireEvent.click(screen.getByTestId('modal-close-btn'));

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_POST_MODAL' });
    });

    it('renders ViewPostModal and CommentForm when post exists', () => {
        mockPostId = 'p1';
        mockQueryReturn = { 
            loading: false, 
            data: { getPost: { id: 'p1', content: 'test' } }, 
            error: null 
        };

        render(<PostModalRenderer />);
        
        expect(screen.getByTestId('view-post-modal')).toBeInTheDocument();
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    });

    it('dispatches closePostModal when ViewPostModal triggers onClose', () => {
        mockPostId = 'p1';
        mockQueryReturn = { 
            loading: false, 
            data: { getPost: { id: 'p1' } }, 
            error: null 
        };

        render(<PostModalRenderer />);
        fireEvent.click(screen.getByText('close-view'));

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_POST_MODAL' });
    });
});