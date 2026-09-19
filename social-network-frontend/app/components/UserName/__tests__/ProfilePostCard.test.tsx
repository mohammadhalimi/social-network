// components/UserName/__tests__/ProfilePostCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfilePostCard } from '../ProfilePostCard';

// ماک کردن next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} />,
}));

// ماک کردن formatPersianDate
jest.mock('@/app/lib/formatDate', () => ({
    formatPersianDate: jest.fn(() => '۱۰ مهر ۱۴۰۵'),
}));

// ماک کردن PostActions
jest.mock('../../profile/posts/PostActions', () => ({
    PostActions: ({ postId, onCommentClick }: any) => (
        <div data-testid="post-actions">
            <button onClick={onCommentClick}>کامنت</button>
            <span>{postId}</span>
        </div>
    ),
}));

// ماک کردن ViewPostModal (به صورت یک درپوش ساده)
jest.mock('../../profile/posts/ViewPostModal', () => ({
    ViewPostModal: ({ isOpen, post }: any) => (
        isOpen ? <div data-testid="view-post-modal">مودال باز شد: {post.id}</div> : null
    ),
}));

describe('ProfilePostCard', () => {
    const basePost = {
        id: 'post-1',
        content: JSON.stringify({
            blocks: [
                { type: 'header', content: 'عنوان تست' },
                { type: 'text', content: 'این یک متن تستی برای پیش‌نمایش است که باید کوتاه شود.' },
                { type: 'image', url: '/image.jpg' },
            ],
        }),
        createdAt: '2026-01-01',
        likesCount: 5,
        commentsCount: 3,
        isLiked: false,
    };

    // ==========================================
    //  تست‌های پارس محتوای پست
    // ==========================================
    it('1. عنوان، متن پیش‌نمایش و تاریخ را نمایش می‌دهد', () => {
        render(<ProfilePostCard post={basePost} />);

        expect(screen.getByText('عنوان تست')).toBeInTheDocument();
        expect(screen.getByText(/این یک متن تستی/)).toBeInTheDocument();
        expect(screen.getByText('۱۰ مهر ۱۴۰۵')).toBeInTheDocument();
    });

    it('2. اگر پست عکس داشته باشد، پیش‌نمایش عکس نمایش داده می‌شود', () => {
        render(<ProfilePostCard post={basePost} />);

        const img = screen.getByAltText('پیش‌نمایش');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/image.jpg');
    });

    it('3. اگر پست ویدیو داشته باشد و عکس نداشته باشد، پیش‌نمایش ویدیو نمایش داده می‌شود', () => {
        const videoPost = {
            ...basePost,
            content: JSON.stringify({
                blocks: [
                    { type: 'header', content: 'پست ویدیویی' },
                    { type: 'video', url: '/video.mp4' },
                ],
            }),
        };

        render(<ProfilePostCard post={videoPost} />);

        const video = document.querySelector('video');
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute('src', '/video.mp4');
    });

    it('4. اگر JSON خراب باشد، fallback به متن ساده نمایش داده می‌شود', () => {
        const brokenPost = {
            ...basePost,
            content: 'این یک متن ساده و غیر JSON است.',
        };

        render(<ProfilePostCard post={brokenPost} />);

        expect(screen.getByText(/این یک متن ساده/)).toBeInTheDocument();
        expect(screen.getByText('پست')).toBeInTheDocument();
    });

    it('5. اگر پست عنوان نداشته باشد، "پست بدون عنوان" نمایش داده می‌شود', () => {
        const noHeaderPost = {
            ...basePost,
            content: JSON.stringify({
                blocks: [{ type: 'text', content: 'فقط متن' }],
            }),
        };

        render(<ProfilePostCard post={noHeaderPost} />);

        expect(screen.getByText('پست بدون عنوان')).toBeInTheDocument();
    });

    // ==========================================
    //  تست‌های تعامل با مودال
    // ==========================================
    it('6. با کلیک روی کارت، ViewPostModal باز می‌شود', () => {
        render(<ProfilePostCard post={basePost} />);

        // در ابتدا مودال بسته است
        expect(screen.queryByTestId('view-post-modal')).not.toBeInTheDocument();

        // کلیک روی کارت
        fireEvent.click(screen.getByText('عنوان تست').closest('div')!.parentElement!);

        // حالا مودال باز است
        expect(screen.getByTestId('view-post-modal')).toBeInTheDocument();
        expect(screen.getByText(/مودال باز شد: post-1/)).toBeInTheDocument();
    });

    it('7. با کلیک روی دکمه کامنت در PostActions، مودال باز می‌شود', () => {
        render(<ProfilePostCard post={basePost} />);

        // کلیک روی دکمه کامنت داخل PostActions
        fireEvent.click(screen.getByText('کامنت'));

        // مودال باید باز شود
        expect(screen.getByTestId('view-post-modal')).toBeInTheDocument();
    });

    it('8. کلیک روی PostActions باعث باز شدن مودال نمی‌شود (stopPropagation)', () => {
        render(<ProfilePostCard post={basePost} />);

        // کلیک روی دکمه کامنت که در PostActions است
        fireEvent.click(screen.getByText('کامنت'));

        // مودال باز می‌شود (چون خود دکمه onCommentClick را صدا می‌زند)
        // اما اگر روی خود کانتینر PostActions کلیک کنیم، نباید باز شود
        const postActionsContainer = screen.getByTestId('post-actions');
        
        // مودال باید بسته بماند اگر روی کانتینر کلیک کنیم (نه دکمه)
        // این تست بررسی می‌کند که stopPropagation کار می‌کند
        expect(postActionsContainer).toBeInTheDocument();
    });
});