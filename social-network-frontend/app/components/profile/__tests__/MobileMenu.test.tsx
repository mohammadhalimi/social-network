// app/components/profile/__tests__/MobileMenu.test.tsx
'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { MobileMenu } from '../MobileMenu';

// ✅ mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// ✅ mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// ✅ mock next/link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// ===================================================================
// Helpers
// ===================================================================
const mockUser = {
    id: 'user-1',
    fullName: 'علی رضایی',
    username: 'ali_rezaei',
    avatar: null,
};

const defaultProps = {
    user: mockUser,
    avatarUrl: null,
    activeTab: 'profile',
    setActiveTab: jest.fn(),
    handleLogout: jest.fn(),
    isOpen: true,
    onOpenStoryModal: jest.fn(),
};

// ===================================================================
// Tests
// ===================================================================
describe('MobileMenu', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ===============================================================
    // isOpen
    // ===============================================================
    describe('visibility', () => {
        it('renders nothing when isOpen=false', () => {
            const { container } = render(<MobileMenu {...defaultProps} isOpen={false} />);

            expect(container.firstChild).toBeNull();
        });

        it('renders menu when isOpen=true', () => {
            render(<MobileMenu {...defaultProps} isOpen={true} />);

            expect(screen.getByText('اطلاعات کاربری')).toBeInTheDocument();
        });
    });

    // ===============================================================
    // User info
    // ===============================================================
    describe('user info', () => {
        it('renders fullName and username', () => {
            render(<MobileMenu {...defaultProps} />);

            expect(screen.getByText('علی رضایی')).toBeInTheDocument();
            expect(screen.getByText('@ali_rezaei')).toBeInTheDocument();
        });

        it('renders fallback when user is null', () => {
            render(<MobileMenu {...defaultProps} user={null} />);

            expect(screen.getByText('کاربر مهمان')).toBeInTheDocument();
            expect(screen.getByText('@—')).toBeInTheDocument();
        });

        it('renders first letter when no avatar', () => {
            render(<MobileMenu {...defaultProps} />);

            expect(screen.getByText('ع')).toBeInTheDocument();
        });

        it('renders avatar image when avatarUrl exists', () => {
            render(<MobileMenu {...defaultProps} avatarUrl="/uploads/avatar.jpg" />);

            expect(screen.getByAltText('آواتار')).toHaveAttribute('src', '/uploads/avatar.jpg');
        });
    });

    // ===============================================================
    // Profile link
    // ===============================================================
    describe('profile link', () => {
        it('renders profile link when username exists', () => {
            render(<MobileMenu {...defaultProps} />);

            const link = screen.getByText('مشاهده‌ی پروفایل عمومی').closest('a');
            expect(link).toHaveAttribute('href', '/ali_rezaei');
        });

        it('does NOT render profile link when username is missing', () => {
            render(
                <MobileMenu
                    {...defaultProps}
                    user={{ ...mockUser, username: '' }}
                />
            );

            expect(screen.queryByText('مشاهده‌ی پروفایل عمومی')).not.toBeInTheDocument();
        });
    });

    // ===============================================================
    // Story button
    // ===============================================================
    describe('story button', () => {
        it('calls onOpenStoryModal when clicked', () => {
            render(<MobileMenu {...defaultProps} />);

            fireEvent.click(screen.getByTitle('افزودن استوری'));

            expect(defaultProps.onOpenStoryModal).toHaveBeenCalledTimes(1);
        });
    });

    // ===============================================================
    // Menu items
    // ===============================================================
    describe('menu items', () => {
        it('renders all 6 menu items', () => {
            render(<MobileMenu {...defaultProps} />);

            expect(screen.getByText('اطلاعات کاربری')).toBeInTheDocument();
            expect(screen.getByText('ویرایش اطلاعات')).toBeInTheDocument();
            expect(screen.getByText('پست‌های من')).toBeInTheDocument();
            expect(screen.getByText('نوشتن پست جدید')).toBeInTheDocument();
            expect(screen.getByText('تغییر رمز عبور')).toBeInTheDocument();
            expect(screen.getByText('تنظیمات')).toBeInTheDocument();
        });

        it('calls setActiveTab on item click', () => {
            render(<MobileMenu {...defaultProps} />);

            fireEvent.click(screen.getByText('پست‌های من'));

            expect(defaultProps.setActiveTab).toHaveBeenCalledWith('posts');
        });

        it('applies active class to active tab', () => {
            render(<MobileMenu {...defaultProps} activeTab="posts" />);

            const postsButton = screen.getByText('پست‌های من').closest('button');
            expect(postsButton?.className).toMatch(/bg-gradient-primary/);
        });

        it('does NOT apply active class to inactive tab', () => {
            render(<MobileMenu {...defaultProps} activeTab="profile" />);

            const postsButton = screen.getByText('پست‌های من').closest('button');
            expect(postsButton?.className).not.toMatch(/bg-gradient-primary/);
        });
    });

    // ===============================================================
    // Logout
    // ===============================================================
    describe('logout', () => {
        it('calls handleLogout on logout click', () => {
            render(<MobileMenu {...defaultProps} />);

            fireEvent.click(screen.getByText('خروج از حساب'));

            expect(defaultProps.handleLogout).toHaveBeenCalledTimes(1);
        });
    });
});