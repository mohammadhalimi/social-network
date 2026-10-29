// app/user/[username]/components/__tests__/UserProfileContent.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfileContent } from '../UserProfileContent';

// ✅ mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

// ✅ mock Redux
const mockDispatch = jest.fn();
let mockCurrentUser: any = { id: 'owner-1' };
jest.mock('@/app/redux/hooks', () => ({
    useAppSelector: (selector: any) => selector({ auth: { user: mockCurrentUser } }),
    useAppDispatch: () => mockDispatch,
}));

// ✅ mock Apollo useQuery
const mockRefetch = jest.fn();
jest.mock('@apollo/client/react', () => ({
    useQuery: jest.fn(() => ({ refetch: mockRefetch })),
}));

// ✅ mock کامپوننت‌ها
jest.mock('../ProfileHeader', () => ({
    ProfileHeader: ({ onFollowChange }: any) => (
        <div data-testid="profile-header">
            <button data-testid="mock-follow" onClick={() => onFollowChange('pending')}>
                Follow
            </button>
            <button data-testid="mock-cancel" onClick={() => onFollowChange('not-following')}>
                Cancel
            </button>
        </div>
    ),
}));

jest.mock('../ProfileInfo', () => ({
    ProfileInfo: () => <div data-testid="profile-info" />,
}));

jest.mock('@/app/components/UserName/ProfilePostsList', () => ({
    ProfilePostsList: () => <div data-testid="posts-list" />,
}));

jest.mock('../PrivateProfileMessage', () => ({
    PrivateProfileMessage: ({ isFollowRequestPending }: any) => (
        <div data-testid="private-message">
            {isFollowRequestPending ? 'PENDING' : 'PRIVATE'}
        </div>
    ),
}));

jest.mock('../FollowListModal', () => ({
    FollowListModal: () => <div data-testid="follow-list-modal" />,
}));

jest.mock('../ImagePreviewModal', () => ({
    ImagePreviewModal: () => <div data-testid="image-preview-modal" />,
}));

jest.mock('../../story/CreateStoryModal', () => ({
    CreateStoryModal: () => <div data-testid="create-story-modal" />,
}));

const mockUser = {
    id: 'u1',
    username: 'ali',
    fullName: 'علی رضایی',
    isPrivate: true,
    isFollowing: false,
    isFollowRequestPending: false,
    followersCount: 10,
    followingCount: 5,
};

describe('UserProfileContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentUser = { id: 'owner-1' }; // کاربر لاگین شده
    });

    it('shows PrivateProfileMessage with "PRIVATE" initially', () => {
        render(<UserProfileContent user={mockUser as any} avatarUrl={null} />);
        
        expect(screen.getByTestId('private-message')).toHaveTextContent('PRIVATE');
    });

    it('updates to "PENDING" immediately when follow request is sent', async () => {
        render(<UserProfileContent user={mockUser as any} avatarUrl={null} />);
        
        // کلیک روی دکمه‌ای که در ProfileHeader mock شده
        fireEvent.click(screen.getByTestId('mock-follow'));

        // ✅ چک می‌کنیم که بدون رفرش، پیام به PENDING تغییر کرده
        await waitFor(() => {
            expect(screen.getByTestId('private-message')).toHaveTextContent('PENDING');
        });
    });

    it('updates back to "PRIVATE" when follow request is cancelled', async () => {
        render(<UserProfileContent user={mockUser as any} avatarUrl={null} />);
        
        // اول درخواست رو می‌فرستیم
        fireEvent.click(screen.getByTestId('mock-follow'));
        await waitFor(() => {
            expect(screen.getByTestId('private-message')).toHaveTextContent('PENDING');
        });

        // بعد لغو می‌کنیم
        fireEvent.click(screen.getByTestId('mock-cancel'));
        await waitFor(() => {
            expect(screen.getByTestId('private-message')).toHaveTextContent('PRIVATE');
        });
    });

    it('shows posts when canViewContent (owner)', () => {
        mockCurrentUser = { id: 'u1' }; // خود کاربر
        render(<UserProfileContent user={mockUser as any} avatarUrl={null} />);
        
        expect(screen.getByTestId('posts-list')).toBeInTheDocument();
        expect(screen.queryByTestId('private-message')).not.toBeInTheDocument();
    });
});