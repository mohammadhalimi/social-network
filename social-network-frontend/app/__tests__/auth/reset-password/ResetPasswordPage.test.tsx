import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordPage from '@/app/auth/reset-password/page';
import {
    render,
    screen,
    waitFor
} from '@testing-library/react';

// ==========================================================
// Mock: next/navigation
// ==========================================================
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(() => mockSearchParams),
    useRouter: jest.fn(() => ({ push: jest.fn() })),
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
// Mock: framer-motion
// ==========================================================
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// ==========================================================
// Mock: toast
// ==========================================================
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

describe('ResetPasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams.set('token', 'valid-token');
        (useMutation as jest.Mock).mockReturnValue([
            mockResetPassword,
            { loading: false },
        ]);
    });

    // ==========================================================
    //  تست ۱: رندر صحیح صفحه با توکن معتبر
    // ==========================================================
    it('should render the form when token is valid', () => {
        render(<ResetPasswordPage />);

        expect(screen.getByText('تنظیم رمز عبور جدید')).toBeInTheDocument();
        expect(screen.getByText('رمز عبور جدید خود را وارد کنید.')).toBeInTheDocument();
        expect(screen.getByLabelText('رمز عبور جدید')).toBeInTheDocument();
        expect(screen.getByLabelText('تکرار رمز عبور جدید')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /تغییر رمز عبور/i })).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۲: نمایش InvalidTokenMessage وقتی توکن وجود ندارد
    // ==========================================================
    it('should show InvalidTokenMessage when token is missing', () => {
        mockSearchParams.delete('token');
        render(<ResetPasswordPage />);

        expect(screen.getByText('لینک نامعتبر')).toBeInTheDocument();
        expect(screen.getByText('لینک بازنشانی رمز عبور نامعتبر یا منقضی شده است.')).toBeInTheDocument();
        expect(screen.getByText('درخواست مجدد')).toBeInTheDocument();
        expect(screen.queryByText('تنظیم رمز عبور جدید')).not.toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۳: نمایش SuccessMessage بعد از submit موفق
    // ==========================================================
    it('should show SuccessMessage after successful submission', async () => {
        const user = userEvent.setup();
        mockResetPassword.mockResolvedValue({
            data: {
                resetPassword: {
                    success: true,
                    message: 'رمز عبور تغییر یافت',
                },
            },
        });

        render(<ResetPasswordPage />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@1234');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('رمز عبور تغییر یافت!')).toBeInTheDocument();
            expect(screen.getByText('رمز عبور شما با موفقیت تغییر یافت. در حال انتقال به صفحه ورود...')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۴: خطا در بازنشانی رمز (فرم باقی می‌ماند)
    // ==========================================================
    it('should stay on form when reset fails', async () => {
        const user = userEvent.setup();
        mockResetPassword.mockResolvedValue({
            data: {
                resetPassword: {
                    success: false,
                    message: 'توکن نامعتبر است',
                },
            },
        });

        render(<ResetPasswordPage />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@1234');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('تنظیم رمز عبور جدید')).toBeInTheDocument();
            expect(screen.queryByText('رمز عبور تغییر یافت!')).not.toBeInTheDocument();
            expect(toast.error).toHaveBeenCalledWith('توکن نامعتبر است');
        });
    });

    // ==========================================================
    //  تست ۵: اعتبارسنجی رمز عبور (کمتر از ۸ کاراکتر)
    // ==========================================================
    it('should show validation error for short password', async () => {
        const user = userEvent.setup();
        render(<ResetPasswordPage />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test12');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('رمز عبور باید حداقل ۸ کاراکتر باشد')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۶: خطا وقتی رمز عبور با تکرار آن مطابقت ندارد
    // ==========================================================
    it('should show error when passwords do not match', async () => {
        const user = userEvent.setup();
        render(<ResetPasswordPage />);

        const passwordInput = screen.getByLabelText('رمز عبور جدید');
        await user.type(passwordInput, 'Test@1234');

        const confirmInput = screen.getByLabelText('تکرار رمز عبور جدید');
        await user.type(confirmInput, 'Test@5678');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ رمز عبور با تکرار آن مطابقت ندارد.');
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

        render(<ResetPasswordPage />);

        expect(screen.getByText('در حال تغییر...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /در حال تغییر/i })).toBeDisabled();
    });
});