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
    //  تست ۲: اعتبارسنجی نام کاربری - حداقل ۳ کاراکتر
    // ==========================================================
    it('should show error when username is less than 3 characters', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'ab');

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('نام کاربری حداقل ۳ کاراکتر')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۳: نام کاربری معتبر (حروف انگلیسی و اعداد)
    // ==========================================================
    it('should accept valid username (English letters and numbers)', async () => {
        const user = userEvent.setup();
        const validUsername = 'testuser123';

        mockUpdateProfile.mockResolvedValue({
            data: {
                updateProfile: {
                    success: true,
                    message: 'پروفایل به‌روز شد',
                    user: { ...mockUser, username: validUsername },
                },
            },
        });

        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        await user.type(usernameInput, validUsername);

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith({
                variables: {
                    username: validUsername,
                    fullName: mockUser.fullName,
                    email: mockUser.email,
                    bio: mockUser.bio,
                    avatar: mockUser.avatar,
                },
            });
            expect(toast.success).toHaveBeenCalledWith('پروفایل با موفقیت به‌روزرسانی شد');
        });
    });

    // ==========================================================
    //  تست ۴: جلوگیری از تایپ کاراکترهای غیرمجاز در لحظه
    // ==========================================================
    it('should prevent typing invalid characters in username field', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        
        // ✅ تایپ کاراکتر فارسی
        await user.type(usernameInput, 'ت');

        // ✅ کاراکتر غیرمجاز تایپ نمی‌شود
        expect(usernameInput).toHaveValue('');
    });

    // ==========================================================
    //  تست ۵: نمایش toast error هنگام تایپ کاراکتر غیرمجاز
    // ==========================================================
    it('should show toast error when typing invalid character in username', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        
        // تایپ کاراکتر غیرمجاز (فارسی)
        await user.type(usernameInput, 'ت');

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ فقط حروف انگلیسی و اعداد مجاز هستند');
        });
    });

    // ==========================================================
    //  تست ۶: پاک کردن خودکار کاراکترهای غیرمجاز
    // ==========================================================
    it('should automatically remove invalid characters from username', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        
        // تایپ ترکیبی از مجاز و غیرمجاز
        await user.type(usernameInput, 'testکاربر123');

        // ✅ کاراکترهای غیرمجاز حذف می‌شوند
        expect(usernameInput).toHaveValue('test123');
    });

    // ==========================================================
    //  تست ۷: وقتی نام کاربری فقط کاراکتر غیرمجاز باشد، خطای الزامی نمایش داده می‌شود
    // ==========================================================
    it('should show required error when username has only invalid characters', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'کاربرتست');

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            // ✅ چون کاراکترهای غیرمجاز حذف می‌شوند، فیلد خالی می‌شود و خطای الزامی نمایش داده می‌شود
            expect(screen.getByText('نام کاربری الزامی است')).toBeInTheDocument();
        });
    });
});