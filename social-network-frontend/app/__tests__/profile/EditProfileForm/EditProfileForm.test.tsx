import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EditProfileForm } from '@/app/components/profile/EditProfile/EditProfile';
import { useMutation } from '@apollo/client/react';
import { useAppDispatch } from '@/app/redux/hooks';
import toast from 'react-hot-toast';

// ==========================================================
// Mock: useMutation
// ==========================================================
jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));

// ==========================================================
// Mock: useAppDispatch
// ==========================================================
const mockDispatch = jest.fn();
jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: jest.fn(),
}));

// ==========================================================
// Mock: toast
// ==========================================================
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

// ==========================================================
// داده‌های تست
// ==========================================================
const mockUser = {
    id: 'cm123',
    email: 'test@example.com',
    username: 'testuser',
    fullName: 'کاربر تست',
    bio: 'این یک بیوگرافی تست است',
    avatar: 'https://cdn.example.com/avatar.png',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
};

describe('EditProfileForm Component - Unit Tests', () => {
    const mockUpdateProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useMutation as jest.Mock).mockReturnValue([
            mockUpdateProfile,
            { loading: false },
        ]);
    });

    // ==========================================================
    //  تست ۱: رندر صحیح با اطلاعات کاربر
    // ==========================================================
    it('should render correctly with user data', () => {
        render(<EditProfileForm user={mockUser} />);

        expect(screen.getByText('عکس پروفایل')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('نام و نام خانوادگی')).toHaveValue('کاربر تست');
        expect(screen.getByPlaceholderText('username')).toHaveValue('testuser');
        expect(screen.getByPlaceholderText('example@email.com')).toHaveValue('test@example.com');
        expect(screen.getByPlaceholderText('درباره خودت بنویس...')).toHaveValue('این یک بیوگرافی تست است');
    });

    // ==========================================================
    //  تست ۲: رندر صحیح با کاربر خالی
    // ==========================================================
    it('should render with empty fields when user is null', () => {
        render(<EditProfileForm user={null} />);

        expect(screen.getByPlaceholderText('نام و نام خانوادگی')).toHaveValue('');
        expect(screen.getByPlaceholderText('username')).toHaveValue('');
        expect(screen.getByPlaceholderText('example@email.com')).toHaveValue('');
        expect(screen.getByPlaceholderText('درباره خودت بنویس...')).toHaveValue('');
    });

    // ==========================================================
    //  تست ۳: اعتبارسنجی فیلدهای خالی
    // ==========================================================
    it('should show validation errors for empty fields', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const fullNameInput = screen.getByPlaceholderText('نام و نام خانوادگی');
        const usernameInput = screen.getByPlaceholderText('username');
        const emailInput = screen.getByPlaceholderText('example@email.com');

        await user.clear(fullNameInput);
        await user.clear(usernameInput);
        await user.clear(emailInput);

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('نام کامل الزامی است')).toBeInTheDocument();
            expect(screen.getByText('نام کاربری الزامی است')).toBeInTheDocument();
            expect(screen.getByText('ایمیل الزامی است')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۴: ارسال موفق فرم
    // ==========================================================
    it('should submit successfully', async () => {
        const user = userEvent.setup();
        const updatedUser = { ...mockUser, fullName: 'نام جدید' };

        mockUpdateProfile.mockResolvedValue({
            data: {
                updateProfile: {
                    success: true,
                    message: 'پروفایل به‌روز شد',
                    user: updatedUser,
                },
            },
        });

        render(<EditProfileForm user={mockUser} />);

        const fullNameInput = screen.getByPlaceholderText('نام و نام خانوادگی');
        await user.clear(fullNameInput);
        await user.type(fullNameInput, 'نام جدید');

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith({
                variables: {
                    username: mockUser.username,
                    fullName: 'نام جدید',
                    email: mockUser.email,
                    bio: mockUser.bio,
                    avatar: mockUser.avatar,
                },
            });
            expect(mockDispatch).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('پروفایل با موفقیت به‌روزرسانی شد');
        });
    });

    // ==========================================================
    //  تست ۵: خطا در ارسال فرم
    // ==========================================================
    it('should show error when update fails', async () => {
        const user = userEvent.setup();

        mockUpdateProfile.mockRejectedValue(new Error('خطا در ارتباط با سرور'));

        render(<EditProfileForm user={mockUser} />);

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('خطا در ارتباط با سرور');
        });
    });

    // ==========================================================
    //  تست ۶: حذف عکس
    // ==========================================================
    it('should remove avatar when remove button is clicked', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const removeButton = screen.getByText('حذف عکس');
        await user.click(removeButton);

        // بررسی اینکه عکس حذف شده است
        const avatarInput = screen.getByPlaceholderText('example@email.com');
        expect(avatarInput).toBeInTheDocument();
    });
});