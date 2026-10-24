// app/profile/__tests__/ProfilePage.test.tsx
'use client';

import ProfilePage from '../page';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ✅ mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// ✅ mock Redux
const mockDispatch = jest.fn();
let mockAuthState: any = { user: null, loading: false };
let mockUiState: any = { isMobileMenuOpen: false };

jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => selector({ auth: mockAuthState, ui: mockUiState }),
}));

jest.mock('@/app/redux/features/authSlice', () => ({
    logout: () => ({ type: 'LOGOUT' }),
}));

jest.mock('@/app/redux/uiSlice', () => ({
    setIsMobileMenuOpen: (open: boolean) => ({ type: 'SET_MOBILE_MENU', payload: open }),
}));

// ✅ mock getAvatarUrl
jest.mock('@/app/lib/utils/avatar', () => ({
    getAvatarUrl: (avatar: string | null) => avatar,
}));

// ✅ mock Apollo
const mockLogoutMutation = jest.fn();
jest.mock('@apollo/client/react', () => ({
    useMutation: () => [mockLogoutMutation],
}));

// ✅ mock toast
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

import toast from 'react-hot-toast';

// ✅ mock sub-components
jest.mock('@/app/components/profile/Sidebar', () => ({
    Sidebar: ({ setActiveTab, handleLogout, onOpenStoryModal }: any) => (
        <div data-testid="sidebar">
            <button onClick={() => setActiveTab('posts')}>sidebar-posts</button>
            <button onClick={handleLogout}>sidebar-logout</button>
            <button onClick={onOpenStoryModal}>sidebar-story</button>
        </div>
    ),
}));

jest.mock('@/app/components/profile/MobileMenu', () => ({
    MobileMenu: ({ setActiveTab, handleLogout, onOpenStoryModal, isOpen }: any) => (
        <div data-testid="mobile-menu" data-open={isOpen}>
            <button onClick={() => setActiveTab('posts')}>mobile-posts</button>
            <button onClick={handleLogout}>mobile-logout</button>
            <button onClick={onOpenStoryModal}>mobile-story</button>
        </div>
    ),
}));

jest.mock('@/app/components/profile/ProfileContent', () => ({
    ProfileContent: ({ activeTab }: any) => (
        <div data-testid="profile-content" data-tab={activeTab} />
    ),
}));

jest.mock('@/app/components/story/CreateStoryModal', () => ({
    CreateStoryModal: ({ isOpen, onClose, onSuccess }: any) =>
        isOpen ? (
            <div data-testid="story-modal">
                <button onClick={onClose}>close</button>
                <button onClick={onSuccess}>success</button>
            </div>
        ) : null,
}));

// ===================================================================
// Tests
// ===================================================================
describe('ProfilePage', () => {
    const mockUser = {
        id: 'user-1',
        fullName: 'علی رضایی',
        username: 'ali',
        avatar: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthState = { user: mockUser, loading: false };
        mockUiState = { isMobileMenuOpen: false };
        mockLogoutMutation.mockResolvedValue({
            data: { logout: { success: true } },
        });
    });

    // ===============================================================
    // Render
    // ===============================================================
    it('renders Sidebar, ProfileContent, MobileMenu', () => {
        render(<ProfilePage />);

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('profile-content')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    it('passes activeTab to ProfileContent', () => {
        render(<ProfilePage />);

        expect(screen.getByTestId('profile-content')).toHaveAttribute('data-tab', 'profile');
    });

    it('does not render CreateStoryModal by default', () => {
        render(<ProfilePage />);

        expect(screen.queryByTestId('story-modal')).not.toBeInTheDocument();
    });

    // ===============================================================
    // Tab change
    // ===============================================================
    it('changes activeTab via Sidebar', () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('sidebar-posts'));

        expect(screen.getByTestId('profile-content')).toHaveAttribute('data-tab', 'posts');
    });

    it('changes activeTab via MobileMenu AND dispatches close', () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('mobile-posts'));

        expect(screen.getByTestId('profile-content')).toHaveAttribute('data-tab', 'posts');
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MOBILE_MENU',
            payload: false,
        });
    });

    // ===============================================================
    // Story modal
    // ===============================================================
    it('opens story modal via Sidebar story button', () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('sidebar-story'));

        expect(screen.getByTestId('story-modal')).toBeInTheDocument();
    });

    it('opens story modal via MobileMenu story button AND closes menu', () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('mobile-story'));

        expect(screen.getByTestId('story-modal')).toBeInTheDocument();
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MOBILE_MENU',
            payload: false,
        });
    });

    it('closes story modal via onClose', () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('sidebar-story'));
        fireEvent.click(screen.getByText('close'));

        expect(screen.queryByTestId('story-modal')).not.toBeInTheDocument();
    });

    it('shows success toast on story success', () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('sidebar-story'));
        fireEvent.click(screen.getByText('success'));

        expect(toast.success).toHaveBeenCalledWith('استوری شما فعال شد!');
    });

    // ===============================================================
    // MobileMenu isOpen
    // ===============================================================
    it('passes isMobileMenuOpen from Redux to MobileMenu', () => {
        mockUiState = { isMobileMenuOpen: true };

        render(<ProfilePage />);

        expect(screen.getByTestId('mobile-menu')).toHaveAttribute('data-open', 'true');
    });

    // ===============================================================
    // handleLogout (via useLogout)
    // ===============================================================
    describe('handleLogout', () => {
        it('calls logoutMutation, dispatches logout, redirects', async () => {
            render(<ProfilePage />);

            fireEvent.click(screen.getByText('sidebar-logout'));

            await waitFor(() => {
                expect(mockLogoutMutation).toHaveBeenCalledTimes(1);
            });

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
            expect(toast.success).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith('/auth/login');
        });

        it('shows error toast when logout fails', async () => {
            mockLogoutMutation.mockRejectedValue(new Error('Network error'));

            render(<ProfilePage />);

            fireEvent.click(screen.getByText('sidebar-logout'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('❌ خطا در خروج از حساب');
            });
        });

        it('shows error toast when logout returns success=false', async () => {
            mockLogoutMutation.mockResolvedValue({
                data: { logout: { success: false } },
            });

            render(<ProfilePage />);

            fireEvent.click(screen.getByText('sidebar-logout'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('❌ خطا در خروج از حساب');
            });
        });
    });
});