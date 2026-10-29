import { render, screen, fireEvent } from '@testing-library/react';
import { FollowButton } from '../FollowButton';

const mockHandleClick = jest.fn();
const mockOnFollowChange = jest.fn();
let mockState: 'not-following' | 'pending' | 'following' = 'not-following';
let mockIsLoading = false;

jest.mock('../FollowButton/useFollowButton', () => ({
    useFollowButton: (props: any) => {
        // ✅ ذخیره پراپ برای بررسی
        if (props.onFollowChange) mockOnFollowChange.mockImplementation(props.onFollowChange);
        return {
            state: mockState,
            isLoading: mockIsLoading,
            handleClick: mockHandleClick,
        };
    },
}));

describe('FollowButton (UI)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockState = 'not-following';
        mockIsLoading = false;
    });

    it.each([
        ['not-following', 'دنبال کردن'],
        ['pending', 'در انتظار تأیید'],
        ['following', 'دنبال می‌کنید'],
    ] as const)('renders text for %s', (state, text) => {
        mockState = state;
        render(<FollowButton userId="u1" initialIsFollowing={false} />);

        expect(screen.getByTestId('follow-button')).toHaveAttribute('data-state', state);
        expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('shows loader when isLoading', () => {
        mockIsLoading = true;
        const { container } = render(<FollowButton userId="u1" initialIsFollowing={false} />);

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('calls handleClick on click', () => {
        render(<FollowButton userId="u1" initialIsFollowing={false} />);

        fireEvent.click(screen.getByTestId('follow-button'));

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when isLoading', () => {
        mockIsLoading = true;
        render(<FollowButton userId="u1" initialIsFollowing={false} />);

        expect(screen.getByTestId('follow-button')).toBeDisabled();
    });
});