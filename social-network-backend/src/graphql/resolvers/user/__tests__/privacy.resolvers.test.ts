// src/graphql/resolvers/user/__tests__/privacy.resolvers.test.ts

// ✅ Mock کردن prisma
jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            update: jest.fn(),
        },
    },
}));

// ✅ Mock کردن requireAuth
jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { privacyResolvers } from '../privacy.resolvers';

const mockedUserUpdate = (prisma as any).user.update as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;

describe('privacyResolvers.updatePrivacy', () => {
    let mockContext: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = {
            req: {},
            res: {},
            user: { userId: 'user-1', email: 'test@example.com' },
        };
    });

    // ==========================================================
    //  حالت ۱: خصوصی کردن پیج
    // ==========================================================
    it('1. باید کاربر رو خصوصی کنه و پیام مناسب برگردونه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedUserUpdate.mockResolvedValue({ id: 'user-1', isPrivate: true });

        const result = await privacyResolvers.updatePrivacy(
            null,
            { isPrivate: true },
            mockContext
        );

        expect(mockedRequireAuth).toHaveBeenCalledWith(
            mockContext,
            'برای این کار باید وارد شوید.'
        );
        expect(mockedUserUpdate).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { isPrivate: true },
        });
        expect(result).toEqual({
            success: true,
            message: 'صفحه‌ی شما خصوصی شد.',
            isPrivate: true,
        });
    });

    // ==========================================================
    //  حالت ۲: عمومی کردن پیج
    // ==========================================================
    it('2. باید کاربر رو عمومی کنه و پیام مناسب برگردونه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedUserUpdate.mockResolvedValue({ id: 'user-1', isPrivate: false });

        const result = await privacyResolvers.updatePrivacy(
            null,
            { isPrivate: false },
            mockContext
        );

        expect(mockedUserUpdate).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { isPrivate: false },
        });
        expect(result).toEqual({
            success: true,
            message: 'صفحه‌ی شما عمومی شد.',
            isPrivate: false,
        });
    });

    // ==========================================================
    //  حالت ۳: کاربر لاگین نکرده
    // ==========================================================
    it('3. اگر کاربر لاگین نکرده باشه، باید خطا بده و prisma صدا زده نشه', async () => {
        mockedRequireAuth.mockImplementation(() => {
            throw new Error('برای این کار باید وارد شوید.');
        });

        await expect(
            privacyResolvers.updatePrivacy(null, { isPrivate: true }, {})
        ).rejects.toThrow('برای این کار باید وارد شوید.');

        expect(mockedUserUpdate).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۴: خطای Prisma
    // ==========================================================
    it('4. اگر Prisma خطا بده، باید خطا propagate بشه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedUserUpdate.mockRejectedValue(new Error('Database error'));

        await expect(
            privacyResolvers.updatePrivacy(null, { isPrivate: true }, mockContext)
        ).rejects.toThrow('Database error');
    });
});