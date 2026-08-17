import { AuthService } from '../../../modules/auth/auth.service';

// چون auth.resolvers.ts در سطح ماژول یک instance از AuthService می‌سازه،
// باید مطمئن بشیم هر new AuthService() (چه در resolver چه در تست) همون یک object رو برگردونه.
jest.mock('../../../modules/auth/auth.service', () => {
    const mockAuthServiceInstance = {
        register: jest.fn(),
        login: jest.fn(),
        logout: jest.fn(),
        requestPasswordReset: jest.fn(),
        resetPassword: jest.fn(),
    };
    return {
        AuthService: jest.fn(() => mockAuthServiceInstance),
    };
});

// import کردن resolver بعد از mock، تا از همون instance مشترک استفاده کنه
import { authResolvers } from '../auth.resolvers';

const createMockRes = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
});

describe('authResolvers', () => {
    let mockAuthService: jest.Mocked<AuthService>;
    let mockContext: { res: ReturnType<typeof createMockRes>; req: any; user: any };

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        mockAuthService = new AuthService() as jest.Mocked<AuthService>;
        mockContext = { req: {}, res: createMockRes(), user: null };
        jest.clearAllMocks();
    });

    // =============================================
    //  register
    // =============================================
    describe('register', () => {
        const mockArgs = {
            email: 'test@example.com',
            username: 'testuser',
            password: '123456',
            fullName: 'کاربر تست',
            resetToken: null,              
            resetTokenExpiresAt: null,
        };

        const mockUser = {
            id: 'cm123',
            ...mockArgs,
            password: 'hashed_password',
            bio: null,
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockToken = 'fake-jwt-token';

        it('should register a new user successfully', async () => {
            mockAuthService.register.mockResolvedValue({ user: mockUser, token: mockToken });

            const result = await authResolvers.register(null as any, mockArgs, mockContext);

            expect(mockAuthService.register).toHaveBeenCalledWith(
                mockArgs.email,
                mockArgs.username,
                mockArgs.password,
                mockArgs.fullName,
                mockContext.res
            );
            expect(result).toEqual({
                success: true,
                message: 'ثبت‌نام با موفقیت انجام شد.',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    username: mockUser.username,
                    fullName: mockUser.fullName,
                    bio: mockUser.bio,
                    avatar: mockUser.avatar,
                    createdAt: mockUser.createdAt.toISOString(),
                    updatedAt: mockUser.updatedAt.toISOString(),
                },
                token: mockToken,
            });
        });

        it('should handle errors gracefully', async () => {
            const errorMessage = 'ایمیل یا نام کاربری قبلاً ثبت شده است.';
            mockAuthService.register.mockRejectedValue(new Error(errorMessage));

            const result = await authResolvers.register(null as any, mockArgs, mockContext);

            expect(result).toEqual({
                success: false,
                message: errorMessage,
                user: null,
                token: null,
            });
        });
    });

    // =============================================
    //  login
    // =============================================
    describe('login', () => {
        const mockArgs = { email: 'test@example.com', password: '123456' };

        const mockUser = {
            id: 'cm123',
            email: 'test@example.com',
            username: 'testuser',
            password: 'hashed_password',
            fullName: 'کاربر تست',
            bio: null,
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            resetToken: null,              // ✅ اضافه کن
            resetTokenExpiresAt: null,
        };

        const mockToken = 'fake-jwt-token';

        it('should login a user successfully', async () => {
            mockAuthService.login.mockResolvedValue({ user: mockUser, token: mockToken });

            const result = await authResolvers.login(null as any, mockArgs, mockContext);

            expect(mockAuthService.login).toHaveBeenCalledWith(
                mockArgs.email,
                mockArgs.password,
                mockContext.res
            );
            expect(result).toEqual({
                success: true,
                message: 'ورود با موفقیت انجام شد.',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    username: mockUser.username,
                    fullName: mockUser.fullName,
                    bio: mockUser.bio,
                    avatar: mockUser.avatar,
                    createdAt: mockUser.createdAt.toISOString(),
                    updatedAt: mockUser.updatedAt.toISOString(),
                },
                token: mockToken,
            });
        });

        it('should handle login errors gracefully', async () => {
            const errorMessage = 'رمز عبور اشتباه است.';
            mockAuthService.login.mockRejectedValue(new Error(errorMessage));

            const result = await authResolvers.login(null as any, mockArgs, mockContext);

            expect(result).toEqual({
                success: false,
                message: errorMessage,
                user: null,
                token: null,
            });
        });
    });

    // =============================================
    //  logout
    // =============================================
    describe('logout', () => {
        it('should logout successfully', async () => {
            mockAuthService.logout.mockResolvedValue(undefined as any);

            const result = await authResolvers.logout(null as any, null as any, mockContext);

            expect(mockAuthService.logout).toHaveBeenCalledWith(mockContext.res);
            expect(result).toEqual({
                success: true,
                message: 'خروج با موفقیت انجام شد.',
            });
        });

        it('should handle logout errors gracefully', async () => {
            const errorMessage = 'خطا در خروج';
            mockAuthService.logout.mockRejectedValue(new Error(errorMessage));

            const result = await authResolvers.logout(null as any, null as any, mockContext);

            expect(result).toEqual({
                success: false,
                message: errorMessage,
            });
        });
    });
    // =============================================
    //  requestPasswordReset
    // =============================================
    describe('requestPasswordReset', () => {
        const mockArgs = { email: 'test@example.com' };

        it('should request password reset successfully', async () => {
            mockAuthService.requestPasswordReset.mockResolvedValue(undefined as any);

            const result = await authResolvers.requestPasswordReset(null as any, mockArgs);

            expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(mockArgs.email);
            expect(result).toEqual({
                success: true,
                message: 'اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال شده است.',
            });
        });

        it('should handle errors gracefully', async () => {
            const errorMessage = 'خطا در ارسال ایمیل';
            mockAuthService.requestPasswordReset.mockRejectedValue(new Error(errorMessage));

            const result = await authResolvers.requestPasswordReset(null as any, mockArgs);

            expect(result).toEqual({
                success: false,
                message: errorMessage,
            });
        });
    });

    // =============================================
    //  resetPassword
    // =============================================
    describe('resetPassword', () => {
        const mockArgs = { token: 'reset-token-123', newPassword: 'newPassword123' };

        it('should reset password successfully', async () => {
            mockAuthService.resetPassword.mockResolvedValue(undefined as any);

            const result = await authResolvers.resetPassword(null as any, mockArgs);

            expect(mockAuthService.resetPassword).toHaveBeenCalledWith(mockArgs.token, mockArgs.newPassword);
            expect(result).toEqual({
                success: true,
                message: 'رمز عبور با موفقیت تغییر یافت.',
            });
        });

        it('should handle errors gracefully', async () => {
            const errorMessage = 'توکن بازیابی نامعتبر یا منقضی شده است.';
            mockAuthService.resetPassword.mockRejectedValue(new Error(errorMessage));

            const result = await authResolvers.resetPassword(null as any, mockArgs);

            expect(result).toEqual({
                success: false,
                message: errorMessage,
            });
        });
    });
});