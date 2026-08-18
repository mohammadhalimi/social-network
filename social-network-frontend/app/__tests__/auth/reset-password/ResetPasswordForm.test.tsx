import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import userEvent from '@testing-library/user-event';
import
{
render,
screen,
waitFor
} from '@testing-library/react';
import { ResetPasswordForm } from '@/app/components/auth/reset-password/ResetPasswordForm';

// ==========================================================
// Mock: next/navigation (رفع خطای useRouter)
// ==========================================================
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
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

// ==========================================================
// Mock: framer-motion
// ==========================================================
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
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
    //  تست ۲: نمایش خطا وقتی رمز عبور با تکرار آن مطابقت ندارد
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
            // ✅ خطا توسط react-hook-form در فرم نمایش داده می‌شود
            expect(screen.getByText('رمز عبور با تکرار آن مطابقت ندارد')).toBeInTheDocument();
            expect(mockResetPassword).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۳: ارسال موفق و فراخوانی onSuccess
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
});