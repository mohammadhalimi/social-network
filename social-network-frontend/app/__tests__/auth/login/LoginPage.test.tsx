import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/auth/login/page';
import '@testing-library/jest-dom';

// ----------------------
// ✅ ۱. Mock کردن next/navigation
// ----------------------
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

// ----------------------
// ✅ ۲. Mock کردن framer-motion (کامل)
// ----------------------
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // حذف propsهای اضافی که React نمی‌شناسد
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
// ✅ ۳. Mock کردن Apollo
// ----------------------
jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({
      data: {
        login: {
          success: true,
          user: { fullName: 'کاربر تست' },
        },
      },
    }),
    { loading: false },
  ]),
}));

// ----------------------
// ✅ ۴. Mock کردن react-hot-toast
// ----------------------
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// ----------------------
// ✅ ۵. Mock کردن Redux
// ----------------------
jest.mock('@/app/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
}));

// ----------------------
// 🧪 TESTS
// ----------------------
describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------
  // ✅ render test
  // ----------------------
  it('should render login page correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText(/خوش برگشتی/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/example@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ورود/i })).toBeInTheDocument();
  });

  // ----------------------
  // ❌ validation test
  // ----------------------
  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText(/example@email.com/i),
      'invalid-email'
    );

    await user.type(
      screen.getByPlaceholderText(/••••••••/i),
      '123456'
    );

    await user.click(
      screen.getByRole('button', { name: /ورود/i })
    );

    expect(
      await screen.findByText('ایمیل نامعتبر است')
    ).toBeInTheDocument();
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText(/example@email.com/i),
      'test@test.com'
    );

    await user.type(
      screen.getByPlaceholderText(/••••••••/i),
      '123'
    );

    await user.click(
      screen.getByRole('button', { name: /ورود/i })
    );

    expect(
      await screen.findByText('رمز عبور حداقل ۶ کاراکتر')
    ).toBeInTheDocument();
  });

  // ----------------------
  // 🚀 mutation success
  // ----------------------
  it('should call login mutation with correct data', async () => {
    const user = userEvent.setup();

    const mockData = {
      email: 'test@example.com',
      password: 'Test@1234',
    };

    const mockMutation = jest.fn().mockResolvedValue({
      data: {
        login: {
          success: true,
          user: { fullName: 'کاربر تست' },
        },
      },
    });

    const { useMutation } = require('@apollo/client/react');
    useMutation.mockReturnValue([mockMutation, { loading: false }]);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/example@email.com/i), mockData.email);
    await user.type(screen.getByPlaceholderText(/••••••••/i), mockData.password);
    await user.click(screen.getByRole('button', { name: /ورود/i }));

    await waitFor(() => {
      expect(mockMutation).toHaveBeenCalledWith({
        variables: mockData,
      });
    });
  });

  it('should redirect to profile on successful login', async () => {
    const user = userEvent.setup();

    const mockMutation = jest.fn().mockResolvedValue({
      data: {
        login: {
          success: true,
          user: { fullName: 'کاربر تست' },
        },
      },
    });

    const { useMutation } = require('@apollo/client/react');
    useMutation.mockReturnValue([mockMutation, { loading: false }]);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/example@email.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /ورود/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  // ----------------------
  // ❌ mutation error
  // ----------------------
  it('should show error toast when login fails', async () => {
    const user = userEvent.setup();

    const mockMutation = jest.fn().mockRejectedValue(new Error('Login failed'));

    const { useMutation } = require('@apollo/client/react');
    useMutation.mockReturnValue([mockMutation, { loading: false }]);

    const toast = require('react-hot-toast');

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/example@email.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /ورود/i }));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalled();
    });
  });

  it('should show specific error for unregistered user', async () => {
    const user = userEvent.setup();
    const errorMessage = 'کاربری با این ایمیل یافت نشد';

    const mockMutation = jest.fn().mockRejectedValue(new Error(errorMessage));

    const { useMutation } = require('@apollo/client/react');
    useMutation.mockReturnValue([mockMutation, { loading: false }]);

    const toast = require('react-hot-toast');

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/example@email.com/i), 'notfound@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /ورود/i }));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith(
        '❌ کاربری با این ایمیل ثبت‌نام نکرده است. لطفاً ابتدا ثبت‌نام کنید.'
      );
    });
  });

  // ----------------------
  // ⏳ loading state
  // ----------------------
  it('should show loading state on submit', async () => {
    const user = userEvent.setup();

    const mockMutation = jest.fn().mockImplementation(() => new Promise(() => { }));

    const { useMutation } = require('@apollo/client/react');
    useMutation.mockReturnValue([mockMutation, { loading: false }]);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/example@email.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'Test@1234');
    await user.click(screen.getByRole('button', { name: /ورود/i }));

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /در حال ورود/i });
      expect(submitButton).toBeDisabled();
    });
  });
});