import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen,
    waitFor
} from '@testing-library/react';
import { EditProfileForm } from '@/app/components/profile/EditProfile/EditProfile';

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
    //  تست ۲: اعتبارسنجی نام کاربری - حداقل ۴ کاراکتر
    // ==========================================================
    it('should show error when username is less than 4 characters', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'abc');

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('نام کاربری باید حداقل ۴ کاراکتر باشد')).toBeInTheDocument();
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
    //  تست ۴: نمایش خطا هنگام تایپ کاراکتر غیرمجاز (فارسی) - بدون بلاک کردن تایپ
    // ==========================================================
    it('should show validation error (not block typing) for Persian characters', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);

        // کاراکتر فارسی باید واقعاً وارد اینپوت بشه
        await user.type(usernameInput, 'ت');

        expect(usernameInput).toHaveValue('ت');

        // و پیام خطای مناسب زیر اینپوت نمایش داده بشه
        await waitFor(() => {
            expect(
                screen.getByText('نام کاربری فقط باید شامل حروف انگلیسی و اعداد باشد')
            ).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۵: نام کاربری با ترکیب فارسی و انگلیسی همچنان نامعتبر است
    // ==========================================================
    it('should keep mixed Persian/English username invalid (no auto-stripping)', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);

        await user.type(usernameInput, 'testکاربر123');

        // دیگه کاراکترها حذف نمی‌شن، مقدار کامل باقی می‌مونه
        expect(usernameInput).toHaveValue('testکاربر123');

        await waitFor(() => {
            expect(
                screen.getByText('نام کاربری فقط باید شامل حروف انگلیسی و اعداد باشد')
            ).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۶: نام کاربری کاملاً فارسی خطای "فقط انگلیسی" می‌دهد نه خطای الزامی
    // ==========================================================
    it('should show "only English" error (not required error) for fully Persian username', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'کاربرتست');

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText('نام کاربری فقط باید شامل حروف انگلیسی و اعداد باشد')
            ).toBeInTheDocument();
            expect(screen.queryByText('نام کاربری الزامی است')).not.toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۷: نام کاربری خالی خطای الزامی می‌دهد
    // ==========================================================
    it('should show required error when username is empty', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('نام کاربری الزامی است')).toBeInTheDocument();
        });
    });

    // ==========================================================
    //  تست ۸: نام کاربری که با عدد شروع می‌شود خطای مناسب می‌دهد
    // ==========================================================
    it('should show error when username starts with a number', async () => {
        const user = userEvent.setup();
        render(<EditProfileForm user={mockUser} />);

        const usernameInput = screen.getByPlaceholderText('username');
        await user.clear(usernameInput);
        await user.type(usernameInput, '1testuser');

        const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('نام کاربری نباید با عدد شروع شود')).toBeInTheDocument();
        });
    });
});