import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/auth/register/page';
import { render, screen, waitFor } from '@testing-library/react';

// ✅ Mock کردن toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// ✅ Mock کردن framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// ✅ Mock کردن useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// ✅ یک mock ثابت برای mutation که چه توی کامپوننت چه توی تست، همیشه همینه
const mockRegisterMutation = jest.fn().mockResolvedValue({
  data: {
    register: {
      success: true,
      message: 'ثبت‌ نام موفق',
      user: { id: '1', email: 'test@example.com', username: 'testuser', fullName: 'کاربر تست' },
    },
  },
});

// ✅ Mock کردن useMutation از Apollo — همیشه همون mockRegisterMutation رو برمی‌گردونه
jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(() => [
    mockRegisterMutation, // 👈 دیگه jest.fn() جدید نمی‌سازه، رفرنس ثابت رو برمی‌گردونه
    { loading: false },
  ]),
}));

// ✅ Mock کردن useAppDispatch از Redux
jest.mock('@/app/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegisterMutation.mockClear(); // 👈 بین تست‌ها پاک بشه که تست‌ها به هم اثر نذارن
  });

  it('should render register page correctly', () => {
    render(<RegisterPage />);

    expect(screen.getByText(/خوش آمدید/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ایمیل/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/نام کاربری/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/نام کامل/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/رمز عبور/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ثبت‌نام/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const submitButton = screen.getByRole('button', { name: /ثبت‌نام/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ایمیل الزامی است/i)).toBeInTheDocument();
      expect(screen.getByText(/نام کاربری الزامی است/i)).toBeInTheDocument();
      expect(screen.getByText(/نام کامل الزامی است/i)).toBeInTheDocument();
      expect(screen.getByText(/رمز عبور الزامی است/i)).toBeInTheDocument();
    });
  });

  it('should show password validation error for weak password', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/ایمیل/i), 'test@example.com');
    await user.type(screen.getByLabelText(/نام کاربری/i), 'testuser');
    await user.type(screen.getByLabelText(/نام کامل/i), 'کاربر تست');
    await user.type(screen.getByLabelText(/رمز عبور/i), '12345');

    const submitButton = screen.getByRole('button', { name: /ثبت‌نام/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/رمز عبور باید حداقل ۸ کاراکتر باشد/i)).toBeInTheDocument();
    });
  });

  it('should call register mutation with correct data', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/ایمیل/i), 'test@example.com');
    await user.type(screen.getByLabelText(/نام کاربری/i), 'testuser');
    await user.type(screen.getByLabelText(/نام کامل/i), 'کاربر تست');
    await user.type(screen.getByLabelText(/رمز عبور/i), 'Test@1234');

    const submitButton = screen.getByRole('button', { name: /ثبت‌نام/i });
    await user.click(submitButton);

    // ✅ حالا مستقیم از همون رفرنس ثابت استفاده می‌کنیم، نه صدا زدن دوباره useMutation
    await waitFor(() => {
      expect(mockRegisterMutation).toHaveBeenCalledWith({
        variables: {
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'کاربر تست',
          password: 'Test@1234',
        },
      });
    });
  });
});