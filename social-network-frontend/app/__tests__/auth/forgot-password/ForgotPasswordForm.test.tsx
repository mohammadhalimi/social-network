import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@apollo/client/react';
import { render, screen, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '@/app/components/auth/forgot-password/ForgotPasswordForm';

// ==========================================================
// Mock: Apollo useMutation
// ==========================================================
const mockRequestPasswordReset = jest.fn();
jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(() => [
        mockRequestPasswordReset,
        { loading: false },
    ]),
}));

// ==========================================================
// Mock: toast
// ==========================================================
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

// ==========================================================
// Mock: framer-motion
// ==========================================================
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

describe('ForgotPasswordForm', () => {
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useMutation as jest.Mock).mockReturnValue([
            mockRequestPasswordReset,
            { loading: false },
        ]);
    });

    // ==========================================================
    //  تست ۱: رندر صحیح کامپوننت
    // ==========================================================
    it('should render correctly', () => {
        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        expect(screen.getByLabelText('ایمیل')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ارسال لینک بازیابی/i })).toBeInTheDocument();
        expect(screen.getByText('بازگشت به صفحه ورود')).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۲: نمایش خطای اعتبارسنجی وقتی ایمیل خالی است
    // ==========================================================
    it('should show validation error when email is empty', async () => {
        const user = userEvent.setup();
        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        // ✅ خطا توسط react-hook-form در فرم نمایش داده می‌شود
        await waitFor(() => {
            expect(screen.getByText('ایمیل الزامی است')).toBeInTheDocument();
            expect(mockRequestPasswordReset).not.toHaveBeenCalled();
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۳: ارسال موفق درخواست
    // ==========================================================
    it('should call onSuccess after successful submission', async () => {
        const user = userEvent.setup();
        mockRequestPasswordReset.mockResolvedValue({
            data: {
                requestPasswordReset: {
                    success: true,
                    message: 'لینک بازیابی ارسال شد',
                },
            },
        });

        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        const emailInput = screen.getByLabelText('ایمیل');
        await user.type(emailInput, 'test@example.com');

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockRequestPasswordReset).toHaveBeenCalledWith({
                variables: { email: 'test@example.com' },
            });
            expect(toast.success).toHaveBeenCalledWith('✅ لینک بازیابی به ایمیل شما ارسال شد.');
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });
});