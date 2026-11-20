// app/components/layout/__tests__/Header.test.tsx
'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';

// ✅ mock next/navigation
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
}));

// ✅ mock Redux
const mockDispatch = jest.fn();
let mockAuthState: any = { user: null };
let mockUiState: any = { isMobileMenuOpen: false };

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => selector({ auth: mockAuthState, ui: mockUiState }),
}));

jest.mock('@/app/redux/uiSlice', () => ({
    toggleMobileMenu: () => ({ type: 'TOGGLE_MOBILE_MENU' }),
}));

// ✅ mock getAvatarUrl
jest.mock('@/app/lib/utils/avatar', () => ({
    getAvatarUrl: (avatar: string | null) => avatar,
}));

// ✅ mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// ✅ mock next/link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

// ✅ mock NotificationBell
jest.mock('../../notification/NotificationBell', () => ({
    NotificationBell: () => <div data-testid="notification-bell">Bell</div>,
}));

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue('/');
        mockAuthState = { user: null };
        mockUiState = { isMobileMenuOpen: false };
    });

    // ===============================================================
    // Auth pages
    // ===============================================================
    describe('when on auth pages', () => {
        it('does NOT render header on /auth/login', () => {
            mockUsePathname.mockReturnValue('/auth/login');
            const { container } = render(<Header />);
            expect(container.firstChild).toBeNull();
        });

        it('does NOT render header on /auth/register', () => {
            mockUsePathname.mockReturnValue('/auth/register');
            const { container } = render(<Header />);
            expect(container.firstChild).toBeNull();
        });
    });

    // ===============================================================
    // Guest (no user)
    // ===============================================================
    describe('when user is not logged in', () => {
        it('renders login/register button', () => {
            render(<Header />);

            const loginLink = screen.getByRole('link', { name: /ورود \/ ثبت‌نام/ });
            expect(loginLink).toHaveAttribute('href', '/auth/login');
        });

        it('does NOT render NotificationBell', () => {
            render(<Header />);

            expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
        });

        it('does NOT render profile link', () => {
            render(<Header />);

            expect(screen.queryByRole('link', { name: /profile/i })).not.toBeInTheDocument();
        });

        it('does NOT render mobile menu button', () => {
            render(<Header />);

            expect(screen.queryByLabelText(/منوی موبایل/i)).not.toBeInTheDocument();
        });
    });

    // ===============================================================
    // Logged in user
    // ===============================================================
    describe('when user is logged in', () => {
        beforeEach(() => {
            mockAuthState = {
                user: {
                    id: 'user-1',
                    fullName: 'علی رضایی',
                    avatar: null,
                },
            };
        });

        it('renders NotificationBell', () => {
            render(<Header />);

            expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
        });

        it('renders profile link with first letter when no avatar', () => {
            render(<Header />);

            const profileLink = screen.getByRole('link', { name: 'ع' });
            expect(profileLink).toHaveAttribute('href', '/profile');
            expect(profileLink).toHaveTextContent('ع');
        });

        it('renders avatar image when avatar exists', () => {
            mockAuthState = {
                user: {
                    id: 'user-1',
                    fullName: 'علی رضایی',
                    avatar: '/uploads/avatar.jpg',
                },
            };

            render(<Header />);

            expect(screen.getByAltText('علی رضایی')).toHaveAttribute('src', '/uploads/avatar.jpg');
        });

        it('renders Home and Search navigation links', () => {
            render(<Header />);

            // ✅ حالا با aria-label پیدا می‌شن
            expect(screen.getByRole('link', { name: 'خانه' })).toHaveAttribute('href', '/');
            expect(screen.getByRole('link', { name: 'جستجو' })).toHaveAttribute('href', '/search');
        });

        it('highlights active Home link', () => {
            mockUsePathname.mockReturnValue('/');
            render(<Header />);

            const homeLink = screen.getByRole('link', { name: 'خانه' });
            expect(homeLink.className).toContain('text-primary');
        });

        it('highlights active Search link', () => {
            mockUsePathname.mockReturnValue('/search');
            render(<Header />);

            const searchLink = screen.getByRole('link', { name: 'جستجو' });
            expect(searchLink.className).toContain('text-primary');
        });
    });

    // ===============================================================
    // Mobile menu button
    // ===============================================================
    describe('mobile menu button', () => {
        beforeEach(() => {
            mockAuthState = {
                user: {
                    id: 'user-1',
                    fullName: 'علی رضایی',
                    avatar: null,
                },
            };
        });

        it('renders mobile menu button when on /profile', () => {
            mockUsePathname.mockReturnValue('/profile');
            render(<Header />);

            expect(screen.getByLabelText(/منوی موبایل/i)).toBeInTheDocument();
        });

        it('does NOT render mobile menu button when NOT on /profile', () => {
            mockUsePathname.mockReturnValue('/');
            render(<Header />);

            expect(screen.queryByLabelText(/منوی موبایل/i)).not.toBeInTheDocument();
        });

        it('does NOT render mobile menu button when user is null', () => {
            mockAuthState = { user: null };
            mockUsePathname.mockReturnValue('/profile');
            render(<Header />);

            expect(screen.queryByLabelText(/منوی موبایل/i)).not.toBeInTheDocument();
        });

        it('shows Menu icon when mobile menu is closed', () => {
            mockUsePathname.mockReturnValue('/profile');
            mockUiState = { isMobileMenuOpen: false };
            render(<Header />);

            const svg = screen.getByLabelText(/منوی موبایل/i).querySelector('svg');
            expect(svg).toHaveClass('lucide-menu');
        });

        it('shows X icon when mobile menu is open', () => {
            mockUsePathname.mockReturnValue('/profile');
            mockUiState = { isMobileMenuOpen: true };
            render(<Header />);

            const svg = screen.getByLabelText(/منوی موبایل/i).querySelector('svg');
            expect(svg).toHaveClass('lucide-x');
        });

        it('dispatches toggleMobileMenu on click', () => {
            mockUsePathname.mockReturnValue('/profile');
            render(<Header />);

            fireEvent.click(screen.getByLabelText(/منوی موبایل/i));
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_MOBILE_MENU' });
        });
    });

    // ===============================================================
    // Home link (logo)
    // ===============================================================
    describe('home link (logo)', () => {
        it('links to /', () => {
            render(<Header />);

            const homeLink = screen.getByRole('link', { name: /پنل کاربری/i });
            expect(homeLink).toHaveAttribute('href', '/');
        });
    });
});