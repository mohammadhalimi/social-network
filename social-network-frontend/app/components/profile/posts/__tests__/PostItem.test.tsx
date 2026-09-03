import '@testing-library/jest-dom';
import { PostItem } from '../PostItem';
import {
    render,
    screen,
    fireEvent,
    waitFor
} from '@testing-library/react';

// ماک‌ها
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // حذف unoptimized از props
        const { unoptimized, ...rest } = props;
        return <img {...rest} />;
    },
}));

jest.mock('@/app/lib/formatDate', () => ({
    formatPersianDate: jest.fn(() => '۱۰ مهر ۱۴۰۵'),
}));

jest.mock('@apollo/client/react', () => ({
    useLazyQuery: jest.fn(),
}));

// ماک ConfirmModal برای ساده‌سازی تست (بدون نیاز به تست داخلی آن)
jest.mock('../ConfirmModal', () => ({
    ConfirmModal: ({ isOpen, onConfirm, onCancel, message }: any) =>
        isOpen ? (
            <div>
                <p>{message}</p>
                <button onClick={onConfirm}>تایید حذف</button>
                <button onClick={onCancel}>انصراف</button>
            </div>
        ) : null,
}));

import { useLazyQuery } from '@apollo/client/react';

describe('PostItem', () => {
    const mockOnDelete = jest.fn();
    const mockOnEdit = jest.fn();
    const mockOnView = jest.fn();
    const mockFetchComments = jest.fn();

    const basePost = {
        id: 'post-1',
        content: JSON.stringify({
            blocks: [
                { type: 'header', content: 'عنوان تست' },
                { type: 'text', content: 'متن تست برای پیش‌نمایش' },
                { type: 'image', url: '/image.jpg' },
            ],
        }),
        createdAt: '2026-01-01',
        likesCount: 5,
        commentsCount: 2,
        isLiked: false,
        user: { fullName: 'کاربر تست' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useLazyQuery as jest.Mock).mockReturnValue([
            mockFetchComments,
            { data: null, loading: false },
        ]);
    });

    it('1. عنوان، متن و تاریخ را نمایش می‌دهد', () => {
        render(
            <PostItem
                post={basePost}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
                onView={mockOnView}
            />
        );

        expect(screen.getByText('عنوان تست')).toBeInTheDocument();
        expect(screen.getByText('متن تست برای پیش‌نمایش')).toBeInTheDocument();
        expect(screen.getByText('۱۰ مهر ۱۴۰۵')).toBeInTheDocument();
    });

    it('2. پیش‌نمایش عکس را نمایش می‌دهد و ویدیو را مخفی می‌کند', () => {
        render(
            <PostItem
                post={basePost}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
                onView={mockOnView}
            />
        );

        expect(screen.getByAltText('پیش‌نمایش')).toBeInTheDocument();
        expect(document.querySelector('video')).not.toBeInTheDocument();
    });

    it('3. دکمه مشاهده، ویرایش و حذف را صدا می‌زند', () => {
        render(
            <PostItem
                post={basePost}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
                onView={mockOnView}
            />
        );

        fireEvent.click(screen.getByTitle('مشاهده کامل'));
        expect(mockOnView).toHaveBeenCalledWith(basePost);

        fireEvent.click(screen.getByTitle('ویرایش'));
        expect(mockOnEdit).toHaveBeenCalledWith(basePost);

        fireEvent.click(screen.getByTitle('حذف'));
        // مودال تایید باز می‌شود
        expect(screen.getByText('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟ این عملیات قابل بازگشت نیست.')).toBeInTheDocument();
    });

    it('4. با تایید حذف در مودال، onDelete صدا زده می‌شود', () => {
        render(
            <PostItem
                post={basePost}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
                onView={mockOnView}
            />
        );

        fireEvent.click(screen.getByTitle('حذف'));
        fireEvent.click(screen.getByText('تایید حذف'));

        expect(mockOnDelete).toHaveBeenCalledWith('post-1');
    });

    it('5. با کلیک روی دکمه کامنت، کوئری کامنت‌ها اجرا می‌شود', async () => {
        // شبیه‌سازی رفتار واقعی: بار اول null، بار دوم کامنت‌ها
        let callCount = 0;

        (useLazyQuery as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return [mockFetchComments, { data: null, loading: false }];
            }
            return [
                mockFetchComments,
                {
                    data: {
                        getPost: {
                            comments: [
                                { id: 'c1', content: 'این یک کامنت تست است', user: { fullName: 'کاربر تست' } }
                            ]
                        }
                    },
                    loading: false,
                },
            ];
        });

        render(
            <PostItem
                post={basePost}
                onDelete={mockOnDelete}
                onEdit={mockOnEdit}
                onView={mockOnView}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /2/i }));

        expect(mockFetchComments).toHaveBeenCalledWith({
            variables: { postId: 'post-1' },
        });

        await waitFor(() => {
            expect(screen.getByText('این یک کامنت تست است')).toBeInTheDocument();
            expect(screen.getByText('کاربر تست')).toBeInTheDocument();
        });
    });
});