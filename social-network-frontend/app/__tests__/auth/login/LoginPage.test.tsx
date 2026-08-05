import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginPage from '@/app/auth/login/page';
import { authStart, loginSuccess, authFailure } from '@/app/redux/features/authSlice';

// ----------------------
// Mock: next/navigation
// ----------------------
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: mockPush })),
}));

// ----------------------
// Mock: framer-motion
// ----------------------
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => {
            const { initial, animate, transition, ...rest } = props;
            return <div {...rest}>{children}</div>;
        },
        form: ({ children, ...props }: any) => {
            const { initial, animate, transition, ...rest } = props;
            return <form {...rest}>{children}</form>;
        },
        button: ({ children, ...props }: any) => {
            const { whileHover, whileTap, initial, animate, transition, ...rest } = props;
            return <button {...rest}>{children}</button>;
        },
    },
}));

// ----------------------
// Mock: Apollo useMutation
// ----------------------
jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(),
}));
import { useMutation } from '@apollo/client/react';

// ----------------------
// Mock: react-hot-toast
// ----------------------
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: { error: jest.fn(), success: jest.fn() },
}));
import toast from 'react-hot-toast';

// ----------------------
// Mock: redux dispatch (اکشن‌های واقعی authSlice استفاده می‌شن، فقط dispatch mock می‌شه)
// ----------------------
const mockDispatch = jest.fn();
jest.mock('@/app/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
}));

// ----------------------
// Helpers
// ----------------------
const fillAndSubmit = async (email: string, password: string) => {
    const user = userEvent.setup();
    if (email) await user.type(screen.getByPlaceholderText(/example@email.com/i), email);
    if (password) await user.type(screen.getByPlaceholderText(/••••••••/i), password);
    await user.click(screen.getByRole('button', { name: /^ورود/i }));
    return user;
};

const successResult = {
    data: {
        login: {
            success: true,
            message: '',
            user: {
                id: 'cm123',
                email: 'test@example.com',
                username: 'testuser',
                fullName: 'کاربر تست',
                bio: null,
                avatar: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            },
            token: 'fake-jwt-token',
        },
    },
};

describe('LoginPage / LoginForm', () => {
    let mockLoginMutation: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLoginMutation = jest.fn().mockResolvedValue(successResult);
        (useMutation as jest.Mock).mockReturnValue([mockLoginMutation, { loading: false }]);
    });

    // ----------------------
    // Render
    // ----------------------
    it('renders the page heading and the login form', () => {
        render(<LoginPage />);

        expect(screen.getByText(/خوش برگشتی/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/example@email.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^ورود/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /ثبت‌نام کنید/i })).toBeInTheDocument();
    });

    // ----------------------
    // Validation - required fields
    // (فقط required چک می‌شه؛ فرمت ایمیل هیچ pattern-ای نداره)
    // ----------------------
    describe('validation', () => {
        it('shows required errors when submitting empty fields', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.click(screen.getByRole('button', { name: /^ورود/i }));

            expect(await screen.findByText('ایمیل الزامی است')).toBeInTheDocument();
            expect(await screen.findByText('رمز عبور الزامی است')).toBeInTheDocument();
            expect(mockLoginMutation).not.toHaveBeenCalled();
        });

        it('shows a min-length error for short passwords', async () => {
            render(<LoginPage />);

            await fillAndSubmit('test@example.com', '123');

            expect(await screen.findByText('رمز عبور حداقل ۶ کاراکتر')).toBeInTheDocument();
            expect(mockLoginMutation).not.toHaveBeenCalled();
        });

        // ⚠️ نکته: فعلاً هیچ pattern-validation برای فرمت ایمیل وجود نداره
        // (import شده تو LoginSchema.ts ولی هیچ‌جا صدا زده نمی‌شه)، بنابراین
        // ایمیل با فرمت اشتباه هم از اعتبارسنجی رد می‌شه و mutation صدا زده می‌شه.
        // این تست رفتار فعلی رو مستند می‌کنه؛ اگه validation فرمت ایمیل رو اضافه
        // کردید، این تست باید عوض بشه.
        it('does NOT reject malformed emails yet (documents current gap)', async () => {
            render(<LoginPage />);

            await fillAndSubmit('invalid-email', '123456');

            await waitFor(() => {
                expect(mockLoginMutation).toHaveBeenCalledWith({
                    variables: { email: 'invalid-email', password: '123456' },
                });
            });
        });
    });

    // ----------------------
    // Successful login
    // ----------------------
    describe('successful login', () => {
        it('calls the mutation with the entered credentials', async () => {
            render(<LoginPage />);

            await fillAndSubmit('test@example.com', 'Test@1234');

            await waitFor(() => {
                expect(mockLoginMutation).toHaveBeenCalledWith({
                    variables: { email: 'test@example.com', password: 'Test@1234' },
                });
            });
        });

        it('dispatches authStart then loginSuccess with the mapped user and token', async () => {
            render(<LoginPage />);

            await fillAndSubmit('test@example.com', 'Test@1234');

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(authStart());
            });
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    loginSuccess({
                        user: successResult.data.login.user,
                        token: successResult.data.login.token,
                    })
                );
            });
        });

        it('shows a success toast and redirects to /profile', async () => {
            render(<LoginPage />);

            await fillAndSubmit('test@example.com', 'Test@1234');

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('✅ خوش آمدید کاربر تست!');
            });
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/profile');
            });
        });
    });

    // ----------------------
    // Login rejected by the server (success: false)
    // ----------------------
    describe('server-side login failure (success: false)', () => {
        it('dispatches authFailure, shows the message inline, and shows an error toast', async () => {
            const failResult = {
                data: {
                    login: {
                        success: false,
                        message: 'رمز عبور اشتباه است.',
                        user: null,
                        token: '',
                    },
                },
            };
            (useMutation as jest.Mock).mockReturnValue([
                jest.fn().mockResolvedValue(failResult),
                { loading: false },
            ]);

            render(<LoginPage />);
            await fillAndSubmit('test@example.com', 'Test@1234');

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(authFailure('رمز عبور اشتباه است.'));
            });
            expect(await screen.findByText('رمز عبور اشتباه است.')).toBeInTheDocument();
            expect(toast.error).toHaveBeenCalledWith('❌ رمز عبور اشتباه است.');
            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    // ----------------------
    // Mutation throws (network / GraphQL error)
    // نکته: هیچ mapping برای پیام‌های دوستانه‌تر وجود نداره؛
    // پیام خام backend عیناً با پیشوند ❌ نشون داده می‌شه.
    // ----------------------
    describe('mutation throws an error', () => {
        it('shows the raw backend error message via toast (no friendly mapping)', async () => {
            (useMutation as jest.Mock).mockReturnValue([
                jest.fn().mockRejectedValue(new Error('کاربری با این ایمیل یافت نشد')),
                { loading: false },
            ]);

            render(<LoginPage />);
            await fillAndSubmit('notfound@example.com', 'Test@1234');

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('❌ کاربری با این ایمیل یافت نشد');
            });
            expect(mockDispatch).toHaveBeenCalledWith(authFailure('کاربری با این ایمیل یافت نشد'));
        });

        it('falls back to a generic message when the error has no message', async () => {
            (useMutation as jest.Mock).mockReturnValue([
                jest.fn().mockRejectedValue(new Error('')),
                { loading: false },
            ]);

            render(<LoginPage />);
            await fillAndSubmit('test@example.com', 'Test@1234');

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('❌ خطا در ورود');
            });
        });
    });

    // ----------------------
    // data.login missing entirely (unexpected server response shape)
    // ----------------------
    it('shows a fallback error when the response has no `login` field', async () => {
        (useMutation as jest.Mock).mockReturnValue([
            jest.fn().mockResolvedValue({ data: {} }),
            { loading: false },
        ]);

        render(<LoginPage />);
        await fillAndSubmit('test@example.com', 'Test@1234');

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ پاسخی از سرور دریافت نشد.');
        });
    });

    // ----------------------
    // Loading state
    // ----------------------
    it('disables the submit button and shows the loading label while submitting', async () => {
        (useMutation as jest.Mock).mockReturnValue([
            jest.fn().mockImplementation(() => new Promise(() => {})), // هیچ‌وقت resolve نمی‌شه
            { loading: false },
        ]);

        render(<LoginPage />);
        await fillAndSubmit('test@example.com', 'Test@1234');

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /در حال ورود/i });
            expect(submitButton).toBeDisabled();
        });
    });
});
