import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen,
    waitFor
} from '@testing-library/react';
import ChangePassword from '@/app/components/profile/ChangePassword';

// ==========================================================
// Mock: useMutation
// ==========================================================
jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

// ==========================================================
// Mock: toast
// ==========================================================
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

describe('ChangePassword Component - Unit Tests', () => {
    const mockChangePassword = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useMutation as jest.Mock).mockReturnValue([
            mockChangePassword,
            { loading: false },
        ]);
    });

    // ==========================================================
    //  تست ۱: رندر صحیح کامپوننت
    // ==========================================================
    it('should render correctly', () => {
        render(<ChangePassword />);

        expect(screen.getByText('🔒 تغییر رمز عبور')).toBeInTheDocument();
        // ✅ استفاده از getAllByPlaceholderText
        const inputs = screen.getAllByPlaceholderText('••••••••');
        expect(inputs).toHaveLength(3);
        expect(screen.getByRole('button', { name: /تغییر رمز عبور/i })).toBeInTheDocument();
    });

    // ==========================================================
    //  تست ۲: اعتبارسنجی فیلدهای خالی
    // ==========================================================
    it('should show validation errors for empty fields', async () => {
        const user = userEvent.setup();
        render(<ChangePassword />);

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('رمز عبور فعلی الزامی است')).toBeInTheDocument();
            expect(screen.getByText('رمز عبور جدید الزامی است')).toBeInTheDocument();
            expect(screen.getByText('تکرار رمز عبور الزامی است')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۳: اعتبارسنجی رمز عبور جدید (حداقل ۸ کاراکتر)
    // ==========================================================
    it('should validate new password length', async () => {
        const user = userEvent.setup();
        render(<ChangePassword />);

        const inputs = screen.getAllByPlaceholderText('••••••••');
        const newPasswordInput = inputs[1]; // دومین input

        await user.type(newPasswordInput, '1234567');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            // ✅ پیدا کردن آیتم خطا در لیست قوانین
            const errorItem = screen.getByText('حداقل ۸ کاراکتر');
            expect(errorItem).toBeInTheDocument();
            expect(errorItem).toHaveClass('text-red-500');
        });
    });

    // ==========================================================
    //  تست ۴: تطابق رمز عبور جدید با تکرار آن
    // ==========================================================
    it('should show error when passwords do not match', async () => {
        const user = userEvent.setup();
        render(<ChangePassword />);

        const inputs = screen.getAllByPlaceholderText('••••••••');
        const newPasswordInput = inputs[1];
        const confirmPasswordInput = inputs[2];

        await user.type(newPasswordInput, 'Test@1234');
        await user.type(confirmPasswordInput, 'Test@5678');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('رمز عبور با تکرار آن مطابقت ندارد')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۵: تغییر موفق رمز عبور
    // ==========================================================
    it('should change password successfully', async () => {
        const user = userEvent.setup();
        mockChangePassword.mockResolvedValue({
            data: {
                changePassword: { success: true, message: 'رمز عبور تغییر یافت' },
            },
        });

        render(<ChangePassword />);

        const inputs = screen.getAllByPlaceholderText('••••••••');
        const oldPasswordInput = inputs[0];
        const newPasswordInput = inputs[1];
        const confirmPasswordInput = inputs[2];

        await user.type(oldPasswordInput, 'OldPass123!');
        await user.type(newPasswordInput, 'NewPass123!');
        await user.type(confirmPasswordInput, 'NewPass123!');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockChangePassword).toHaveBeenCalledWith({
                variables: {
                    oldPassword: 'OldPass123!',
                    newPassword: 'NewPass123!',
                },
            });
            expect(toast.success).toHaveBeenCalledWith('✅ رمز عبور با موفقیت تغییر یافت');
        });
    });

    // ==========================================================
    //  تست ۶: خطا در تغییر رمز عبور
    // ==========================================================
    it('should show error when change password fails', async () => {
        const user = userEvent.setup();
        mockChangePassword.mockRejectedValue(new Error('رمز عبور فعلی اشتباه است'));

        render(<ChangePassword />);

        const inputs = screen.getAllByPlaceholderText('••••••••');
        const oldPasswordInput = inputs[0];
        const newPasswordInput = inputs[1];
        const confirmPasswordInput = inputs[2];

        await user.type(oldPasswordInput, 'WrongPass123!');
        await user.type(newPasswordInput, 'NewPass123!');
        await user.type(confirmPasswordInput, 'NewPass123!');

        const submitButton = screen.getByRole('button', { name: /تغییر رمز عبور/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ رمز عبور فعلی اشتباه است');
        });
    });

    // ==========================================================
    //  تست ۷: نمایش/پنهان کردن رمز عبور
    // ==========================================================
    it('should toggle password visibility', async () => {
        const user = userEvent.setup();
        render(<ChangePassword />);

        const inputs = screen.getAllByPlaceholderText('••••••••');
        const passwordInput = inputs[1];

        expect(passwordInput).toHaveAttribute('type', 'password');

        const eyeButton = passwordInput.parentElement?.querySelector('button');
        expect(eyeButton).toBeInTheDocument();

        if (eyeButton) {
            await user.click(eyeButton);
            expect(passwordInput).toHaveAttribute('type', 'text');
        }
    });
});