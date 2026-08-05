import { ProfileService } from '../profile.service';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';

jest.mock('bcryptjs');

jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

const mockPrisma = prisma as unknown as {
    user: {
        findUnique: jest.Mock;
        update: jest.Mock;
    };
};

describe('ProfileService', () => {
    let profileService: ProfileService;

    const existingUser = {
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

    beforeEach(() => {
        profileService = new ProfileService();
        jest.clearAllMocks();
    });

    // =============================================
    //  updateProfile
    // =============================================
    describe('updateProfile', () => {
        it('should update the user when data has no conflicts', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce(existingUser); // پیدا کردن کاربر
            const updatedUser = { ...existingUser, fullName: 'نام جدید', bio: 'bio جدید' };
            mockPrisma.user.update.mockResolvedValue(updatedUser);

            const result = await profileService.updateProfile('cm123', {
                fullName: 'نام جدید',
                bio: 'bio جدید',
            });

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'cm123' } });
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 'cm123' },
                data: {
                    username: existingUser.username,
                    fullName: 'نام جدید',
                    email: existingUser.email,
                    bio: 'bio جدید',
                    avatar: existingUser.avatar,
                },
            });
            expect(result).toEqual(updatedUser);
        });

        it('should throw if user is not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                profileService.updateProfile('nonexistent', { fullName: 'X' })
            ).rejects.toThrow('کاربر یافت نشد.');

            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });

        it('should throw if the new email is already taken by another user', async () => {
            mockPrisma.user.findUnique
                .mockResolvedValueOnce(existingUser) // پیدا کردن کاربر جاری
                .mockResolvedValueOnce({ id: 'someone-else', email: 'taken@example.com' }); // ایمیل تکراری

            await expect(
                profileService.updateProfile('cm123', { email: 'taken@example.com' })
            ).rejects.toThrow('این ایمیل قبلاً ثبت شده است.');

            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });

        it('should throw if the new username is already taken by another user', async () => {
            mockPrisma.user.findUnique
                .mockResolvedValueOnce(existingUser) // پیدا کردن کاربر جاری
                .mockResolvedValueOnce({ id: 'someone-else', username: 'takenname' }); // یوزرنیم تکراری

            await expect(
                profileService.updateProfile('cm123', { username: 'takenname' })
            ).rejects.toThrow('این نام کاربری قبلاً ثبت شده است.');

            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });

        it('should not check for conflicts when email/username are unchanged', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce(existingUser);
            mockPrisma.user.update.mockResolvedValue(existingUser);

            await profileService.updateProfile('cm123', {
                email: existingUser.email, // همون ایمیل قبلی
                username: existingUser.username, // همون یوزرنیم قبلی
            });

            // فقط همون یک findUnique اول (پیدا کردن کاربر) باید صدا زده بشه
            expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
        });
    });

    // =============================================
    //  changePassword
    // =============================================
    describe('changePassword', () => {
        it('should change the password when the old password is correct', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(existingUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
            const updatedUser = { ...existingUser, password: 'new_hashed_password' };
            mockPrisma.user.update.mockResolvedValue(updatedUser);

            const result = await profileService.changePassword('cm123', 'oldpass', 'newpass');

            expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', existingUser.password);
            expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 'cm123' },
                data: { password: 'new_hashed_password' },
            });
            expect(result).toEqual(updatedUser);
        });

        it('should throw if user is not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                profileService.changePassword('nonexistent', 'oldpass', 'newpass')
            ).rejects.toThrow('کاربر یافت نشد.');

            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });

        it('should throw if the old password is incorrect', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(existingUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                profileService.changePassword('cm123', 'wrongpass', 'newpass')
            ).rejects.toThrow('رمز عبور فعلی اشتباه است.');

            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });
    });
});