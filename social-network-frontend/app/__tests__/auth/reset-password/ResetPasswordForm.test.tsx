import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/app/components/auth/reset-password/ResetPasswordForm';

// ==========================================================
// Mock: next/navigation
// ==========================================================
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: mockPush })),
}));

// ==========================================================
// Mock: Apollo useMutation
// ==========================================================
const mockResetPassword = jest.fn();
jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(() => [
        mockResetPassword,
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

describe('ResetPasswordForm', () => {
    const mockOnSuccess = jest.fn();
    const validToken = 'valid-token';

    beforeEach(() => {
        jest.clearAllMocks();
        (useMutation as jest.Mock).mockReturnValue([
            mockResetPassword,
            { loading: false },
        ]);
    });

    // ==========================================================
    //  تست ۱: رندر صحیح کامپوننت
    // ==========================================================
    it('should render correctly', () => {
        render(<ResetPasswordForm token={validToken} onSuccess={mockOnSuccess} />);

        expect(screen.getByLabelText('رمز عبور جدید')).toBeInTheDocument();
        expect(screen.getByLabelText('تکرار رمز عبور جدید')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /تغییر رمز عبور/i })).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۲: خطا وقتی رمز عبور با تکرار آن مطابقت ندارد
    // ==========================================================
    it('should show error when passwords do not match', async () => {
        const user = userEvent.setup();
        render(<ResetPasswordForm token={validToken} onSuccess={mockOnSuccess} />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@5678');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ رمز عبور با تکرار آن مطابقت ندارد.');
            expect(mockResetPassword).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۳: اعتبارسنجی رمز عبور (کمتر از ۸ کاراکتر)
    // ==========================================================
    it('should show validation error for short password', async () => {
        const user = userEvent.setup();
        render(<ResetPasswordForm token={validToken} onSuccess={mockOnSuccess} />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test12');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('رمز عبور باید حداقل ۸ کاراکتر باشد')).toBeInTheDocument();
            expect(mockResetPassword).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۴: ارسال موفق و فراخوانی onSuccess
    // ==========================================================
    it('should call onSuccess after successful submission', async () => {
        const user = userEvent.setup();
        mockResetPassword.mockResolvedValue({
            data: {
                resetPassword: {
                    success: true,
                    message: 'رمز عبور تغییر یافت',
                },
            },
        });

        render(<ResetPasswordForm token={validToken} onSuccess={mockOnSuccess} />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@1234');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith({
                variables: { token: validToken, newPassword: 'Test@1234' },
            });
            expect(toast.success).toHaveBeenCalledWith('✅ رمز عبور با موفقیت تغییر یافت!');
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۵: خطا در بازنشانی رمز (از سرور)
    // ==========================================================
    it('should show error when reset fails', async () => {
        const user = userEvent.setup();
        mockResetPassword.mockResolvedValue({
            data: {
                resetPassword: {
                    success: false,
                    message: 'توکن نامعتبر است',
                },
            },
        });

        render(<ResetPasswordForm token={validToken} onSuccess={mockOnSuccess} />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@1234');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('توکن نامعتبر است');
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۶: خطا در درخواست (exception)
    // ==========================================================
    it('should show error when mutation throws exception', async () => {
        const user = userEvent.setup();
        mockResetPassword.mockRejectedValue(new Error('خطا در ارتباط با سرور'));

        render(<ResetPasswordForm token={validToken} onSuccess={mockOnSuccess} />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@1234');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطا در ارتباط با سرور');
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۷: نمایش حالت لودینگ
    // ==========================================================
    it('should show loading state', () => {
        (useMutation as jest.Mock).mockReturnValue([
            mockResetPassword,
            { loading: true },
        ]);

        render(<ResetPasswordForm token={validToken} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('در حال تغییر...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /در حال تغییر/i })).toBeDisabled();
    });

    // ==========================================================
    //  تست ۸: خطا وقتی توکن خالی است
    // ==========================================================
    it('should show error when token is empty', async () => {
        const user = userEvent.setup();
        render(<ResetPasswordForm token="" onSuccess={mockOnSuccess} />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@1234');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ لینک نامعتبر است.');
            expect(mockResetPassword).not.toHaveBeenCalled();
        });
    });
});