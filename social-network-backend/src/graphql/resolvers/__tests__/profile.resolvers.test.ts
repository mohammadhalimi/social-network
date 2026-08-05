import { ProfileService } from '../../../modules/profile/profile.service';

jest.mock('../../../modules/profile/profile.service', () => {
    const mockProfileServiceInstance = {
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
    };
    return {
        ProfileService: jest.fn(() => mockProfileServiceInstance),
    };
});

import { profileResolvers } from '../profile.resolvers';

describe('profileResolvers', () => {
    let mockProfileService: jest.Mocked<ProfileService>;
    let mockContext: { req: any; res: any; user: { userId: string; email: string } | null };

    const mockUpdatedUser = {
        id: 'cm123',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'کاربر تست',
        bio: 'bio جدید',
        avatar: null,
        password: 'Deadlock_2001#',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        mockProfileService = new ProfileService() as jest.Mocked<ProfileService>;
        mockContext = {
            req: {},
            res: {},
            user: { userId: 'cm123', email: 'test@example.com' },
        };
        jest.clearAllMocks();
    });

    // =============================================
    //  updateProfile
    // =============================================
    describe('updateProfile', () => {
        const mockArgs = {
            username: 'newusername',
            fullName: 'نام جدید',
            email: 'new@example.com',
            bio: 'bio جدید',
            avatar: null,
        };

        it('should update profile successfully when authenticated', async () => {
            mockProfileService.updateProfile.mockResolvedValue(mockUpdatedUser);

            const result = await profileResolvers.updateProfile(null as any, mockArgs, mockContext);

            expect(mockProfileService.updateProfile).toHaveBeenCalledWith('cm123', mockArgs);
            expect(result).toEqual({
                success: true,
                message: 'پروفایل با موفقیت به‌روزرسانی شد.',
                user: {
                    id: mockUpdatedUser.id,
                    email: mockUpdatedUser.email,
                    username: mockUpdatedUser.username,
                    fullName: mockUpdatedUser.fullName,
                    bio: mockUpdatedUser.bio,
                    avatar: mockUpdatedUser.avatar,
                    createdAt: mockUpdatedUser.createdAt.toISOString(),
                    updatedAt: mockUpdatedUser.updatedAt.toISOString(),
                },
            });
        });

        it('should reject when not authenticated', async () => {
            mockContext.user = null;

            const result = await profileResolvers.updateProfile(null as any, mockArgs, mockContext);

            expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: 'برای ویرایش پروفایل باید وارد شوید.',
                user: null,
            });
        });

        it('should handle errors gracefully', async () => {
            const errorMessage = 'نام کاربری تکراری است.';
            mockProfileService.updateProfile.mockRejectedValue(new Error(errorMessage));

            const result = await profileResolvers.updateProfile(null as any, mockArgs, mockContext);

            expect(result).toEqual({
                success: false,
                message: errorMessage,
                user: null,
            });
        });
    });

    // =============================================
    //  changePassword
    // =============================================
    describe('changePassword', () => {
        const mockArgs = { oldPassword: 'old123', newPassword: 'new123' };

        it('should change password successfully when authenticated', async () => {
            mockProfileService.changePassword.mockResolvedValue(mockUpdatedUser);

            const result = await profileResolvers.changePassword(null as any, mockArgs, mockContext);

            expect(mockProfileService.changePassword).toHaveBeenCalledWith(
                'cm123',
                mockArgs.oldPassword,
                mockArgs.newPassword
            );
            expect(result).toEqual({
                success: true,
                message: 'رمز عبور با موفقیت تغییر یافت.',
                user: {
                    id: mockUpdatedUser.id,
                    email: mockUpdatedUser.email,
                    username: mockUpdatedUser.username,
                    fullName: mockUpdatedUser.fullName,
                    bio: mockUpdatedUser.bio,
                    avatar: mockUpdatedUser.avatar,
                    createdAt: mockUpdatedUser.createdAt.toISOString(),
                    updatedAt: mockUpdatedUser.updatedAt.toISOString(),
                },
            });
        });

        it('should reject when not authenticated', async () => {
            mockContext.user = null;

            const result = await profileResolvers.changePassword(null as any, mockArgs, mockContext);

            expect(mockProfileService.changePassword).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: 'برای تغییر رمز عبور باید وارد شوید.',
                user: null,
            });
        });

        it('should handle errors gracefully', async () => {
            const errorMessage = 'رمز عبور فعلی نادرست است.';
            mockProfileService.changePassword.mockRejectedValue(new Error(errorMessage));

            const result = await profileResolvers.changePassword(null as any, mockArgs, mockContext);

            expect(result).toEqual({
                success: false,
                message: errorMessage,
                user: null,
            });
        });
    });
});