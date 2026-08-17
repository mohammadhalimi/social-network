import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ForgotPasswordForm } from '@/app/components/auth/forgot-password/ForgotPasswordForm';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';

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
    //  تست ۲: خطا وقتی ایمیل خالی است
    // ==========================================================
    it('should show error when email is empty', async () => {
        const user = userEvent.setup();
        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ لطفاً ایمیل خود را وارد کنید.');
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

    // ==========================================================
    //  تست ۴: خطا در ارسال درخواست (از سرور)
    // ==========================================================
    it('should show error when request fails', async () => {
        const user = userEvent.setup();
        mockRequestPasswordReset.mockResolvedValue({
            data: {
                requestPasswordReset: {
                    success: false,
                    message: 'ایمیل یافت نشد',
                },
            },
        });

        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        const emailInput = screen.getByLabelText('ایمیل');
        await user.type(emailInput, 'test@example.com');

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('ایمیل یافت نشد');
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۵: خطا در درخواست (exception)
    // ==========================================================
    it('should show error when mutation throws exception', async () => {
        const user = userEvent.setup();
        mockRequestPasswordReset.mockRejectedValue(new Error('خطا در ارتباط با سرور'));

        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        const emailInput = screen.getByLabelText('ایمیل');
        await user.type(emailInput, 'test@example.com');

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطا در ارتباط با سرور');
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۶: نمایش حالت لودینگ
    // ==========================================================
    it('should show loading state', () => {
        (useMutation as jest.Mock).mockReturnValue([
            mockRequestPasswordReset,
            { loading: true },
        ]);

        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        expect(screen.getByText('در حال ارسال...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /در حال ارسال/i })).toBeDisabled();
    });

    // ==========================================================
    //  تست ۷: لینک بازگشت به صفحه ورود
    // ==========================================================
    it('should have link to login page', () => {
        render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

        const loginLink = screen.getByText('بازگشت به صفحه ورود');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/auth/login');
    });
});