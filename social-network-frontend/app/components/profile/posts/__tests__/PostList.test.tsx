import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostList } from '../PostList';
import { useQuery, useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(),
    useMutation: jest.fn(),
}));

jest.mock('../PostItem', () => ({
    PostItem: ({ post, onDelete, onEdit, onView }: any) => (
        <div>
            <span>{post.id}</span>
            <button onClick={() => onDelete(post.id)}>حذف</button>
            <button onClick={() => onEdit(post)}>ویرایش</button>
            <button onClick={() => onView(post)}>مشاهده</button>
        </div>
    ),
}));

describe('PostList', () => {
    const mockRefetch = jest.fn();
    const mockFetchMore = jest.fn();
    const mockDeletePost = jest.fn();

    const mockPosts = [
        { id: '1', content: '{}' },
        { id: '2', content: '{}' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // جلوگیری از شلوغ شدن کنسول
        jest.spyOn(console, 'error').mockImplementation(() => { });

        (useQuery as unknown as jest.Mock).mockReturnValue({
            data: { getUserPosts: mockPosts },
            error: null,
            refetch: mockRefetch,
            fetchMore: mockFetchMore,
        });

        (useMutation as unknown as jest.Mock).mockReturnValue([mockDeletePost]);
    });

    it('1. لیست پست‌ها را رندر می‌کند', () => {
        render(
            <PostList
                userId="user-1"
                onEdit={jest.fn()}
                onView={jest.fn()}
            />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('2. هنگام خطا، پیام خطا و دکمه تلاش مجدد نمایش داده می‌شود', async () => {
        (useQuery as unknown as jest.Mock).mockReturnValue({
            // ⚠️ تغییر: به جای data: null، از data خالی استفاده کنید
            data: { getUserPosts: [] },
            error: { message: 'Network Error' },
            refetch: mockRefetch,
            fetchMore: mockFetchMore,
        });

        render(
            <PostList
                userId="user-1"
                onEdit={jest.fn()}
                onView={jest.fn()}
            />
        );

        // حالا useEffect اجرا می‌شود و setIsLoading(false) صدا زده می‌شود
        expect(await screen.findByText('خطا در دریافت پست‌ها')).toBeInTheDocument();
        expect(screen.getByText('Network Error')).toBeInTheDocument();

        fireEvent.click(screen.getByText('تلاش مجدد'));
        expect(mockRefetch).toHaveBeenCalled();
    });

    it('3. اگر پستی نباشد، پیام خالی نمایش داده می‌شود', () => {
        (useQuery as unknown as jest.Mock).mockReturnValue({
            data: { getUserPosts: [] },
            error: null,
            refetch: mockRefetch,
            fetchMore: mockFetchMore,
        });

        render(
            <PostList
                userId="user-1"
                onEdit={jest.fn()}
                onView={jest.fn()}
            />
        );

        expect(screen.getByText('هنوز پستی منتشر نشده است')).toBeInTheDocument();
    });

    it('4. با کلیک روی دکمه حذف در آیتم، پست از لیست حذف می‌شود و toast.success نمایش داده می‌شود', async () => {
        mockDeletePost.mockResolvedValue({
            data: { deletePost: { success: true, message: 'حذف شد' } },
        });

        render(
            <PostList
                userId="user-1"
                onEdit={jest.fn()}
                onView={jest.fn()}
            />
        );

        fireEvent.click(screen.getAllByText('حذف')[0]);

        await waitFor(() => {
            expect(mockDeletePost).toHaveBeenCalledWith({
                variables: { postId: '1' },
            });
            expect(toast.success).toHaveBeenCalledWith('پست حذف شد');
            expect(screen.queryByText('1')).not.toBeInTheDocument();
        });
    });

    it('5. خطای حذف باعث بازگردانی پست و نمایش toast.error می‌شود', async () => {
        mockDeletePost.mockRejectedValue(new Error('خطای شبکه'));

        render(
            <PostList
                userId="user-1"
                onEdit={jest.fn()}
                onView={jest.fn()}
            />
        );

        fireEvent.click(screen.getAllByText('حذف')[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطای شبکه');
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });
});