// app/user/[username]/components/__tests__/PrivateProfileMessage.test.tsx

import { render, screen } from '@testing-library/react';
import { PrivateProfileMessage } from '../PrivateProfileMessage';

const defaultProps = {
    isPrivate: true,
    isFollowing: false,
    isFollowRequestPending: false,
    isOwner: false,
};

describe('PrivateProfileMessage', () => {
    // ===============================================================
    // Hidden states (return null)
    // ===============================================================
    it('renders nothing when isOwner=true', () => {
        const { container } = render(<PrivateProfileMessage {...defaultProps} isOwner={true} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when isPrivate=false (public account)', () => {
        const { container } = render(<PrivateProfileMessage {...defaultProps} isPrivate={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when isFollowing=true', () => {
        const { container } = render(<PrivateProfileMessage {...defaultProps} isFollowing={true} />);
        expect(container.firstChild).toBeNull();
    });

    // ===============================================================
    // Pending state (Clock)
    // ===============================================================
    it('renders pending state when isFollowRequestPending=true', () => {
        render(<PrivateProfileMessage {...defaultProps} isFollowRequestPending={true} />);

        expect(screen.getByTestId('private-message-pending')).toBeInTheDocument();
        expect(screen.getByTestId('icon-clock')).toBeInTheDocument();
        expect(screen.getByText('درخواست شما در انتظار تأیید است')).toBeInTheDocument();
        expect(screen.queryByTestId('private-message-locked')).not.toBeInTheDocument();
    });

    // ===============================================================
    // Locked state (Lock)
    // ===============================================================
    it('renders locked state by default (private, not following, not pending)', () => {
        render(<PrivateProfileMessage {...defaultProps} />);

        expect(screen.getByTestId('private-message-locked')).toBeInTheDocument();
        expect(screen.getByTestId('icon-lock')).toBeInTheDocument();
        expect(screen.getByText('این حساب خصوصی است')).toBeInTheDocument();
        expect(screen.queryByTestId('private-message-pending')).not.toBeInTheDocument();
    });
});