// app/user/[username]/components/ProfileHeader/__tests__/ProfileAvatar.test.tsx

import { ProfileAvatar } from '../ProfileAvatar';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

const defaultProps = {
    avatarUrl: '/uploads/a.jpg',
    fullName: 'علی رضایی',
    isOwner: false,
    hasStories: false,
    hasUnviewedStory: false,
    onCreateStory: jest.fn(),
    onPressStart: jest.fn(),
    onPressEnd: jest.fn(),
    onPressCancel: jest.fn(),
};

describe('ProfileAvatar', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders avatar image', () => {
        render(<ProfileAvatar {...defaultProps} />);
        expect(screen.getByAltText('علی رضایی')).toHaveAttribute('src', '/uploads/a.jpg');
    });

    it('renders first letter when no avatar', () => {
        render(<ProfileAvatar {...defaultProps} avatarUrl={null} />);
        expect(screen.getByText('ع')).toBeInTheDocument();
    });

    it('applies gradient ring when hasStories + unviewed', () => {
        render(<ProfileAvatar {...defaultProps} hasStories hasUnviewedStory />);
        expect(screen.getByTestId('avatar-container').className).toMatch(/bg-gradient-to-tr/);
    });

    it('applies border ring when hasStories + viewed', () => {
        render(<ProfileAvatar {...defaultProps} hasStories hasUnviewedStory={false} />);
        expect(screen.getByTestId('avatar-container').className).toMatch(/bg-border/);
    });

    it('renders Plus button only when isOwner', () => {
        const { rerender } = render(<ProfileAvatar {...defaultProps} isOwner />);
        expect(screen.getByTestId('add-story-button')).toBeInTheDocument();

        rerender(<ProfileAvatar {...defaultProps} isOwner={false} />);
        expect(screen.queryByTestId('add-story-button')).not.toBeInTheDocument();
    });

    it('calls onCreateStory on Plus click', () => {
        render(<ProfileAvatar {...defaultProps} isOwner />);
        fireEvent.click(screen.getByTestId('add-story-button'));
        expect(defaultProps.onCreateStory).toHaveBeenCalledTimes(1);
    });

    it('calls press handlers', () => {
        render(<ProfileAvatar {...defaultProps} />);
        const el = screen.getByTestId('avatar-container');

        fireEvent.mouseDown(el);
        expect(defaultProps.onPressStart).toHaveBeenCalled();

        fireEvent.mouseUp(el);
        expect(defaultProps.onPressEnd).toHaveBeenCalled();

        fireEvent.mouseLeave(el);
        expect(defaultProps.onPressCancel).toHaveBeenCalled();
    });
});