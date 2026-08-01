import { UserService } from '../../../modules/user/user.service';

// ✅ ۱. Mock کردن UserService با یک instance مشترک
//    نکته مهم: چون user.resolver.ts در سطح ماژول با `new UserService()`
//    یک instance می‌سازه، باید مطمئن بشیم هر بار `new UserService()`
//    (چه در resolver، چه در تست) دقیقاً همون یک object مشترک رو برگردونه.
jest.mock('../../../modules/user/user.service', () => {
    const mockUserServiceInstance = {
        register: jest.fn(),
        login: jest.fn(),
    };
    return {
        // هر فراخوانی new UserService() همین یک instance رو برمی‌گردونه
        UserService: jest.fn(() => mockUserServiceInstance),
    };
});

// ✅ ۲. import کردن resolver بعد از mock (تا از instance مشترک استفاده کنه)
import { userResolvers } from '../user.resolver';

// ✅ ۳. یک mock ساده برای Response اکسپرس داخل context
const createMockRes = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
});

describe('UserResolver', () => {
    let mockUserService: jest.Mocked<UserService>;
    let mockContext: { res: ReturnType<typeof createMockRes>; req: any; user: any };

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    beforeEach(() => {
        // چون UserService حالا یک mock constructor است که همیشه همون
        // instance مشترک رو برمی‌گردونه، این خط همون object ای رو می‌گیره
        // که resolver واقعی هم استفاده می‌کنه.
        mockUserService = new UserService() as jest.Mocked<UserService>;

        // ✅ context تازه برای هر تست، چون resolver الان بهش وابسته‌ست
        mockContext = {
            req: {},
            res: createMockRes(),
            user: null,
        };

        jest.clearAllMocks();
    });

    // =============================================
    //  تست Mutation: register
    // =============================================
    describe('Mutation - register', () => {
        const mockArgs = {
            email: 'test@example.com',
            username: 'testuser',
            password: '123456',
            fullName: 'کاربر تست',
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
            // ✅ Arrange
            const mockResult = { user: mockUser, token: mockToken };
            mockUserService.register.mockResolvedValue(mockResult);

            // ✅ Act
            const result = await userResolvers.Mutation.register(
                null as any,
                mockArgs,
                mockContext // 👈 آرگومان سوم اضافه شد
            );

            // ✅ Assert
            expect(mockUserService.register).toHaveBeenCalledWith(
                mockArgs.email,
                mockArgs.username,
                mockArgs.password,
                mockArgs.fullName,
                mockContext.res // 👈 اضافه شد، چون resolver الان context.res رو پاس می‌ده
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
            // ✅ Arrange
            const errorMessage = 'ایمیل یا نام کاربری قبلاً ثبت شده است.';
            mockUserService.register.mockRejectedValue(new Error(errorMessage));

            // ✅ Act
            const result = await userResolvers.Mutation.register(
                null as any,
                mockArgs,
                mockContext // 👈 اضافه شد
            );

            // ✅ Assert
            expect(mockUserService.register).toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: errorMessage,
                user: null,
                token: null,
            });
        });
    });

    // =============================================
    //  تست Mutation: login
    // =============================================
    describe('Mutation - login', () => {
        const mockArgs = {
            email: 'test@example.com',
            password: '123456',
        };

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
        };

        const mockToken = 'fake-jwt-token';

        it('should login a user successfully', async () => {
            // ✅ Arrange
            const mockResult = { user: mockUser, token: mockToken };
            mockUserService.login.mockResolvedValue(mockResult);

            // ✅ Act
            const result = await userResolvers.Mutation.login(
                null as any,
                mockArgs,
                mockContext // 👈 اضافه شد
            );

            // ✅ Assert
            expect(mockUserService.login).toHaveBeenCalledWith(
                mockArgs.email,
                mockArgs.password,
                mockContext.res // 👈 اضافه شد
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
            // ✅ Arrange
            const errorMessage = 'رمز عبور اشتباه است.';
            mockUserService.login.mockRejectedValue(new Error(errorMessage));

            // ✅ Act
            const result = await userResolvers.Mutation.login(
                null as any,
                mockArgs,
                mockContext // 👈 اضافه شد
            );

            // ✅ Assert
            expect(result).toEqual({
                success: false,
                message: errorMessage,
                user: null,
                token: null,
            });
        });
    });
});