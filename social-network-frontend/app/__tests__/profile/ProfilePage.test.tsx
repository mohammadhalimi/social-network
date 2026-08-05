import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ==========================================================
// Mock: next/navigation
// ==========================================================
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// ==========================================================
// Mock: authSlice -> فقط action creator رو نیاز داریم
// ==========================================================
jest.mock('@/app/redux/features/authSlice', () => ({
    logout: jest.fn(() => ({ type: 'auth/logout' })),
}));
import { logout } from '@/app/redux/features/authSlice';

// ==========================================================
// Mock: redux hooks
// ==========================================================
const mockDispatch = jest.fn();
let mockAuthState: { user: any; loading: boolean } = { user: null, loading: true };

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => selector({ auth: mockAuthState }),
}));

// ==========================================================
// Mock: کامپوننت‌های فرزند
// فقط پراپ‌های مهم رو به شکل قابل‌مشاهده رندر می‌کنیم، پیاده‌سازی
// داخلی هرکدوم باید تو فایل تست خودشون بررسی بشه، نه اینجا.
// ==========================================================
jest.mock('../../components/profile/ProfileHeader', () => ({
    ProfileHeader: ({ isMobileMenuOpen, setIsMobileMenuOpen, handleLogout }: any) => (
        <div data-testid="profile-header">
            <span data-testid="header-menu-open">{String(isMobileMenuOpen)}</span>
            <button onClick={() => setIsMobileMenuOpen(true)}>open-menu</button>
            <button onClick={handleLogout}>header-logout</button>
        </div>
    ),
}));

jest.mock('../../components/profile/Sidebar', () => ({
    Sidebar: ({ user, avatarUrl, activeTab, setActiveTab, handleLogout }: any) => (
        <div data-testid="sidebar">
            <span data-testid="sidebar-user-id">{user?.id ?? 'none'}</span>
            <span data-testid="sidebar-avatar-url">{avatarUrl ?? 'none'}</span>
            <span data-testid="sidebar-active-tab">{activeTab}</span>
            <button onClick={() => setActiveTab('settings')}>sidebar-set-tab</button>
            <button onClick={handleLogout}>sidebar-logout</button>
        </div>
    ),
}));

jest.mock('../../components/profile/MobileMenu', () => ({
    MobileMenu: ({ isOpen, activeTab }: any) => (
        <div data-testid="mobile-menu">
            <span data-testid="mobile-menu-open">{String(isOpen)}</span>
            <span data-testid="mobile-menu-active-tab">{activeTab}</span>
        </div>
    ),
}));

jest.mock('../../components/profile/ProfileContent', () => ({
    ProfileContent: ({ user, loading, activeTab }: any) => (
        <div data-testid="profile-content">
            <span data-testid="content-loading">{String(loading)}</span>
            <span data-testid="content-active-tab">{activeTab}</span>
            <span data-testid="content-user-id">{user?.id ?? 'none'}</span>
        </div>
    ),
}));

// باید بعد از jest.mock ها import بشه
import ProfilePage from '../../profile/page';

const mockUser = {
    id: 'cm123',
    email: 'test@example.com',
    username: 'testuser',
    fullName: 'کاربر تست',
    bio: null,
    avatar: null,
};

describe('ProfilePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthState = { user: null, loading: true };
    });

    it('renders all child sections and passes loading/user state down', () => {
        mockAuthState = { user: mockUser, loading: false };

        render(<ProfilePage />);

        expect(screen.getByTestId('profile-header')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
        expect(screen.getByTestId('profile-content')).toBeInTheDocument();

        expect(screen.getByTestId('sidebar-user-id')).toHaveTextContent('cm123');
        expect(screen.getByTestId('content-user-id')).toHaveTextContent('cm123');
        expect(screen.getByTestId('content-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('sidebar-active-tab')).toHaveTextContent('profile');
        expect(screen.getByTestId('content-active-tab')).toHaveTextContent('profile');
    });

    it('shows loading state when auth is still loading', () => {
        mockAuthState = { user: null, loading: true };

        render(<ProfilePage />);

        expect(screen.getByTestId('content-loading')).toHaveTextContent('true');
        expect(screen.getByTestId('sidebar-user-id')).toHaveTextContent('none');
    });

    // ==========================================================
    //  getAvatarUrl
    // ==========================================================
    describe('avatar URL resolution', () => {
        it('is null when the user has no avatar', () => {
            mockAuthState = { user: { ...mockUser, avatar: null }, loading: false };
            render(<ProfilePage />);
            expect(screen.getByTestId('sidebar-avatar-url')).toHaveTextContent('none');
        });

        it('is null when there is no user at all', () => {
            mockAuthState = { user: null, loading: false };
            render(<ProfilePage />);
            expect(screen.getByTestId('sidebar-avatar-url')).toHaveTextContent('none');
        });

        it('is left unchanged when it is already a full http(s) URL', () => {
            mockAuthState = {
                user: { ...mockUser, avatar: 'https://cdn.example.com/avatar.png' },
                loading: false,
            };
            render(<ProfilePage />);
            expect(screen.getByTestId('sidebar-avatar-url')).toHaveTextContent(
                'https://cdn.example.com/avatar.png'
            );
        });

        it('is prefixed with the API host when it starts with /uploads/', () => {
            mockAuthState = {
                user: { ...mockUser, avatar: '/uploads/avatar123.png' },
                loading: false,
            };
            render(<ProfilePage />);
            expect(screen.getByTestId('sidebar-avatar-url')).toHaveTextContent(
                'http://localhost:4000/uploads/avatar123.png'
            );
        });

        it('is expanded to the full /uploads/ path when it is a bare filename', () => {
            mockAuthState = {
                user: { ...mockUser, avatar: 'avatar123.png' },
                loading: false,
            };
            render(<ProfilePage />);
            expect(screen.getByTestId('sidebar-avatar-url')).toHaveTextContent(
                'http://localhost:4000/uploads/avatar123.png'
            );
        });
    });

    // ==========================================================
    //  handleLogout
    // ==========================================================
    describe('logout', () => {
        it('dispatches logout() and redirects to /auth/login when triggered from the header', () => {
            mockAuthState = { user: mockUser, loading: false };
            render(<ProfilePage />);

            fireEvent.click(screen.getByText('header-logout'));

            expect(logout).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/logout' });
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });

        it('dispatches logout() and redirects to /auth/login when triggered from the sidebar', () => {
            mockAuthState = { user: mockUser, loading: false };
            render(<ProfilePage />);

            fireEvent.click(screen.getByText('sidebar-logout'));

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/logout' });
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });
    });

    // ==========================================================
    //  Mobile menu behavior
    // ==========================================================
    describe('mobile menu', () => {
        it('closes the mobile menu whenever the active tab changes', () => {
            mockAuthState = { user: mockUser, loading: false };
            render(<ProfilePage />);

            // باز کردن منو از طریق هدر
            fireEvent.click(screen.getByText('open-menu'));
            expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('true');

            // تغییر تب از طریق سایدبار
            fireEvent.click(screen.getByText('sidebar-set-tab'));

            expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('false');
            expect(screen.getByTestId('sidebar-active-tab')).toHaveTextContent('settings');
            expect(screen.getByTestId('content-active-tab')).toHaveTextContent('settings');
        });
    });
});
