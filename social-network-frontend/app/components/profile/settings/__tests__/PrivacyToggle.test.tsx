// app/components/profile/settings/__tests__/PrivacyToggle.test.tsx
'use client';

import { PrivacyToggle } from '../PrivacyToggle';
import {
    render,
    screen,
    fireEvent,
    waitFor
} from '@testing-library/react';

// ✅ mock Apollo
const mockUpdatePrivacy = jest.fn();
let mockQueryData: any = null;
let mockQueryLoading = false;

jest.mock('@apollo/client/react', () => ({
    useQuery: () => ({ data: mockQueryData, loading: mockQueryLoading }),
    useMutation: () => [mockUpdatePrivacy, { loading: false }],   // ← loading از mutation
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

// ===================================================================
// Tests
// ===================================================================
describe('PrivacyToggle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockQueryData = { me: { isPrivate: false } };
        mockQueryLoading = false;
    });

    // ===============================================================
    // Loading state
    // ===============================================================
    it('shows loader when loading', () => {
        mockQueryLoading = true;

        const { container } = render(<PrivacyToggle />);

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    // ===============================================================
    // Public account (isPrivate=false)
    // ===============================================================
    describe('when account is public', () => {
        it('shows Globe icon', () => {
            render(<PrivacyToggle />);

            expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
        });

        it('shows "حساب عمومی" text', () => {
            render(<PrivacyToggle />);

            expect(screen.getByText('حساب عمومی')).toBeInTheDocument();
        });

        it('shows public description', () => {
            render(<PrivacyToggle />);

            expect(screen.getByText(/همه می‌توانند پست‌ها و استوری‌های شما را ببینند/)).toBeInTheDocument();
        });

        it('toggle has data-private="false"', () => {
            render(<PrivacyToggle />);

            expect(screen.getByTestId('privacy-toggle')).toHaveAttribute('data-private', 'false');
        });
    });

    // ===============================================================
    // Private account (isPrivate=true)
    // ===============================================================
    describe('when account is private', () => {
        beforeEach(() => {
            mockQueryData = { me: { isPrivate: true } };
        });

        it('shows Lock icon', () => {
            render(<PrivacyToggle />);

            expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
        });

        it('shows "حساب خصوصی" text', () => {
            render(<PrivacyToggle />);

            expect(screen.getByText('حساب خصوصی')).toBeInTheDocument();
        });

        it('shows private description', () => {
            render(<PrivacyToggle />);

            expect(screen.getByText(/فقط دنبال‌کنندگان تأییدشده/)).toBeInTheDocument();
        });

        it('toggle has data-private="true"', () => {
            render(<PrivacyToggle />);

            expect(screen.getByTestId('privacy-toggle')).toHaveAttribute('data-private', 'true');
        });
    });

    // ===============================================================
    // Toggle click
    // ===============================================================
    describe('toggle click', () => {
        it('calls updatePrivacy with opposite value (public → private)', async () => {
            mockQueryData = { me: { isPrivate: false } };
            mockUpdatePrivacy.mockResolvedValue({
                data: { updatePrivacy: { success: true, message: 'وضعیت تغییر کرد' } },
            });

            render(<PrivacyToggle />);

            fireEvent.click(screen.getByTestId('privacy-toggle'));

            await waitFor(() => {
                expect(mockUpdatePrivacy).toHaveBeenCalledWith({
                    variables: { isPrivate: true },
                });
            });
        });

        it('calls updatePrivacy with opposite value (private → public)', async () => {
            mockQueryData = { me: { isPrivate: true } };
            mockUpdatePrivacy.mockResolvedValue({
                data: { updatePrivacy: { success: true, message: 'وضعیت تغییر کرد' } },
            });

            render(<PrivacyToggle />);

            fireEvent.click(screen.getByTestId('privacy-toggle'));

            await waitFor(() => {
                expect(mockUpdatePrivacy).toHaveBeenCalledWith({
                    variables: { isPrivate: false },
                });
            });
        });

        it('shows success toast on success', async () => {
            mockUpdatePrivacy.mockResolvedValue({
                data: { updatePrivacy: { success: true, message: 'وضعیت تغییر کرد' } },
            });

            render(<PrivacyToggle />);
            fireEvent.click(screen.getByTestId('privacy-toggle'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('وضعیت تغییر کرد');
            });
        });

        it('shows error toast when mutation returns error', async () => {
            mockUpdatePrivacy.mockResolvedValue({
                error: { message: 'خطای شبکه' },
            });

            render(<PrivacyToggle />);
            fireEvent.click(screen.getByTestId('privacy-toggle'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('خطای شبکه');
            });
        });

        it('shows error toast when success=false', async () => {
            mockUpdatePrivacy.mockResolvedValue({
                data: { updatePrivacy: { success: false, message: 'خطا' } },
            });

            render(<PrivacyToggle />);
            fireEvent.click(screen.getByTestId('privacy-toggle'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('خطا');
            });
        });

        it('handles thrown error gracefully', async () => {
            mockUpdatePrivacy.mockRejectedValue(new Error('Network error'));

            render(<PrivacyToggle />);
            fireEvent.click(screen.getByTestId('privacy-toggle'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Network error');
            });
        });
    });
});