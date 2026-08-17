import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '@/app/auth/forgot-password/page';
import
{
render,
screen,
waitFor
} from '@testing-library/react';

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

// ==========================================================
// Mock: next/navigation
// ==========================================================
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('ForgotPasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useMutation as jest.Mock).mockReturnValue([
            mockRequestPasswordReset,
            { loading: false },
        ]);
    });

    // ==========================================================
    //  تست ۱: رندر صحیح صفحه
    // ==========================================================
    it('should render correctly', () => {
        render(<ForgotPasswordPage />);

        expect(screen.getByText('فراموشی رمز عبور')).toBeInTheDocument();
        expect(screen.getByText('ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود.')).toBeInTheDocument();
        expect(screen.getByLabelText('ایمیل')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ارسال لینک بازیابی/i })).toBeInTheDocument();
        expect(screen.getByText('بازگشت به صفحه ورود')).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۲: خطا وقتی ایمیل خالی است
    // ==========================================================
    it('should show error when email is empty', async () => {
        const user = userEvent.setup();
        render(<ForgotPasswordPage />);

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ لطفاً ایمیل خود را وارد کنید.');
            expect(mockRequestPasswordReset).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  تست ۳: ارسال موفق درخواست
    // ==========================================================
    it('should submit successfully and show success message', async () => {
        const user = userEvent.setup();
        mockRequestPasswordReset.mockResolvedValue({
            data: {
                requestPasswordReset: {
                    success: true,
                    message: 'لینک بازیابی ارسال شد',
                },
            },
        });

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText('ایمیل');
        await user.type(emailInput, 'test@example.com');

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockRequestPasswordReset).toHaveBeenCalledWith({
                variables: { email: 'test@example.com' },
            });
            expect(toast.success).toHaveBeenCalledWith('✅ لینک بازیابی به ایمیل شما ارسال شد.');
            expect(screen.getByText('ایمیل ارسال شد!')).toBeInTheDocument();
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

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText('ایمیل');
        await user.type(emailInput, 'test@example.com');

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('ایمیل یافت نشد');
        });
    });

    // ==========================================================
    //  تست ۵: خطا در درخواست (exception)
    // ==========================================================
    it('should show error when mutation throws exception', async () => {
        const user = userEvent.setup();
        mockRequestPasswordReset.mockRejectedValue(new Error('خطا در ارتباط با سرور'));

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText('ایمیل');
        await user.type(emailInput, 'test@example.com');

        const submitButton = screen.getByRole('button', { name: /ارسال لینک بازیابی/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطا در ارتباط با سرور');
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

        render(<ForgotPasswordPage />);

        expect(screen.getByText('در حال ارسال...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /در حال ارسال/i })).toBeDisabled();
    });

    // ==========================================================
    //  تست ۷: کلیک روی لینک بازگشت
    // ==========================================================
    it('should have link to login page', () => {
        render(<ForgotPasswordPage />);

        const loginLink = screen.getByText('بازگشت به صفحه ورود');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/auth/login');
    });
});