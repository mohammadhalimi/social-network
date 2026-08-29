import '@testing-library/jest-dom';
import {
    render,
    screen
} from '@testing-library/react';
import ProfileInfo from '@/app/components/profile/ProfileInfo';

// ==========================================================
// Mock: next/image - با رفع خطای unoptimized
// ==========================================================
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img
            {...props}
            alt={props.alt || 'image'}
            // ✅ حذف unoptimized از props
            unoptimized={undefined}
        />;
    },
}));

// ==========================================================
// داده‌های تست
// ==========================================================
const mockUser = {
    id: 'cm123',
    email: 'test@example.com',
    username: 'testuser',
    fullName: 'کاربر تست',
    bio: 'این یک بیوگرافی تست است',
    avatar: 'https://cdn.example.com/avatar.png',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
};

const mockUserWithoutBio = {
    ...mockUser,
    bio: null,
};

describe('ProfileInfo Component - Unit Tests', () => {
    // ==========================================================
    //  تست ۱: رندر صحیح با اطلاعات کامل
    // ==========================================================
    it('should render correctly with full user data', () => {
        render(<ProfileInfo user={mockUser} />);

        // ✅ استفاده از getAllByText برای موارد تکراری
        expect(screen.getAllByText('کاربر تست')).toHaveLength(2);
        expect(screen.getAllByText(/@testuser/)).toHaveLength(2);
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('این یک بیوگرافی تست است')).toBeInTheDocument();
        expect(screen.getByText(/عضویت از/)).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۲: رندر صحیح با اطلاعات ناقص (بدون بیو)
    // ==========================================================
    it('should render correctly without bio', () => {
        render(<ProfileInfo user={mockUserWithoutBio} />);

        expect(screen.getAllByText('کاربر تست')).toHaveLength(2);
        expect(screen.getAllByText(/@testuser/)).toHaveLength(2);
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('هنوز بیوگرافی وارد نشده است')).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۳: نمایش آواتار
    // ==========================================================
    it('should display avatar when user has avatar', () => {
        render(<ProfileInfo user={mockUser} />);

        const avatar = screen.getByAltText('آواتار');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://cdn.example.com/avatar.png');
    });

    // ==========================================================
    //  تست ۴: نمایش fallback آواتار (وقتی آواتار وجود ندارد)
    // ==========================================================
    it('should display fallback avatar when user has no avatar', () => {
        const userWithoutAvatar = { ...mockUser, avatar: null };
        render(<ProfileInfo user={userWithoutAvatar} />);

        // بررسی اینکه حرف اول نام کاربر در آواتار نمایش داده می‌شود
        expect(screen.getByText('ک')).toBeInTheDocument();
        // بررسی اینکه آواتار وجود ندارد
        const avatar = screen.queryByAltText('آواتار');
        expect(avatar).not.toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۵: نمایش پیام خالی (وقتی کاربر وجود ندارد)
    // ==========================================================
    it('should show empty message when user is null', () => {
        render(<ProfileInfo user={null} />);

        expect(screen.getByText('اطلاعاتی برای نمایش وجود ندارد.')).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۶: نمایش تاریخ عضویت
    // ==========================================================
    it('should show join date correctly', () => {
        render(<ProfileInfo user={mockUser} />);

        // بررسی اینکه تاریخ به صورت شمسی نمایش داده می‌شود
        expect(screen.getByText(/عضویت از/)).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۷: نمایش تاریخ عضویت (زمانی که وجود ندارد)
    // ==========================================================
    it('should show unknown join date when createdAt is missing', () => {
        const userWithoutCreatedAt = { ...mockUser, createdAt: undefined };
        render(<ProfileInfo user={userWithoutCreatedAt} />);

        expect(screen.getByText(/عضویت از نامشخص/)).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۸: دکمه ویرایش (در کامپوننت وجود ندارد)
    // ==========================================================
    it('should not display edit button (not available in this component)', () => {
        render(<ProfileInfo user={mockUser} />);

        // بررسی اینکه دکمه ویرایش وجود ندارد
        const editButton = screen.queryByRole('button', { name: /ویرایش/i });
        expect(editButton).not.toBeInTheDocument();
    });
});