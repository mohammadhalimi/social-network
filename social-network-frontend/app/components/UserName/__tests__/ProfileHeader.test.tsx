// app/user/[username]/components/ProfileHeader/__tests__/index.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileHeader } from '../ProfileHeader';

// ✅ mock useProfileHeader
const mockUseProfileHeader = jest.fn();
jest.mock('../ProfileHeader/useProfileHeader', () => ({
    useProfileHeader: (props: any) => mockUseProfileHeader(props),
}));

// ✅ mock StoryViewerModal
jest.mock('../../story/StoryViewerModal', () => ({
    StoryViewerModal: ({ onClose }: any) => (
        <div data-testid="story-viewer">
            <button onClick={onClose}>close</button>
        </div>
    ),
}));

// ✅ mock FollowButton
jest.mock('@/app/components/UserName/FollowButton', () => ({
    FollowButton: ({ onFollowChange }: any) => (
        <button data-testid="follow-button" onClick={() => onFollowChange('following', 42)}>
            follow
        </button>
    ),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

const mockUser = {
    id: 'u1',
    fullName: 'علی رضایی',
    username: 'ali',
    createdAt: '2024-01-01',
    isFollowing: false,
    isFollowRequestPending: false,
};

const defaultProps = {
    user: mockUser as any,
    avatarUrl: '/a.jpg',
    isOwner: false,
    canViewContent: true,
    displayedFollowersCount: 10,
    displayedFollowingCount: 5,
    onFollowersClick: jest.fn(),
    onFollowingClick: jest.fn(),
    onFollowChange: jest.fn(),
    onCreateStory: jest.fn(),
};

describe('ProfileHeader (integration)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseProfileHeader.mockReturnValue({
            viewerOpen: false,
            isLongPressing: false,
            stories: [],
            hasStories: false,
            hasUnviewedStory: false,
            initialIndex: 0,
            refetch: jest.fn(),
            handlePressStart: jest.fn(),
            handlePressEnd: jest.fn(),
            handlePressCancel: jest.fn(),
            closeViewer: jest.fn(),
        });
    });

    it('passes onFollowChange to FollowButton correctly', () => {
        render(<ProfileHeader {...defaultProps} />);
        
        fireEvent.click(screen.getByTestId('follow-button'));
        
        // ✅ چک کن که onFollowChange با status فراخوانی شده
        expect(defaultProps.onFollowChange).toHaveBeenCalledWith('following', 42);
    });
    
    it('renders user info + counts', () => {
        render(<ProfileHeader {...defaultProps} />);
        expect(screen.getByText('علی رضایی')).toBeInTheDocument();
        expect(screen.getByText('@ali')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders FollowButton when not owner', () => {
        render(<ProfileHeader {...defaultProps} />);
        expect(screen.getByTestId('follow-button')).toBeInTheDocument();
    });

    it('does NOT render FollowButton when owner', () => {
        render(<ProfileHeader {...defaultProps} isOwner />);
        expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument();
    });

    it('calls onFollowersClick / onFollowingClick', () => {
        render(<ProfileHeader {...defaultProps} />);
        fireEvent.click(screen.getByText('دنبال‌کننده'));
        expect(defaultProps.onFollowersClick).toHaveBeenCalled();

        fireEvent.click(screen.getByText('دنبال‌شونده'));
        expect(defaultProps.onFollowingClick).toHaveBeenCalled();
    });

    it('renders StoryViewerModal when viewerOpen + hasStories', () => {
        mockUseProfileHeader.mockReturnValue({
            viewerOpen: true,
            isLongPressing: false,
            stories: [{ id: 's1' }],
            hasStories: true,
            hasUnviewedStory: false,
            initialIndex: 0,
            refetch: jest.fn(),
            handlePressStart: jest.fn(),
            handlePressEnd: jest.fn(),
            handlePressCancel: jest.fn(),
            closeViewer: jest.fn(),
        });

        render(<ProfileHeader {...defaultProps} />);
        expect(screen.getByTestId('story-viewer')).toBeInTheDocument();
    });
});