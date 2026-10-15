// src/graphql/resolvers/notification/__tests__/notification.mutations.test.ts

// ✅ Mock کردن prisma
jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        notification: {
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
    },
}));

// ✅ Mock کردن requireAuth
jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { notificationMutations } from '../notification.mutations';

const mockedRequireAuth = requireAuth as jest.Mock;
const mockedNotificationFindUnique = (prisma as any).notification.findUnique as jest.Mock;
const mockedNotificationUpdate = (prisma as any).notification.update as jest.Mock;
const mockedNotificationUpdateMany = (prisma as any).notification.updateMany as jest.Mock;

describe('notificationMutations', () => {
    let mockContext: any;

    const mockNotification = {
        id: 'notif-1',
        recipientId: 'user-1',
        actorId: 'actor-1',
        type: 'LIKE',
        isRead: false,
        createdAt: new Date(),
    };

    beforeEach(() => {
        mockContext = {
            req: {},
            res: {},
            user: { userId: 'user-1', email: 'test@example.com' },
        };
        jest.clearAllMocks();
    });

    // ==========================================================
    //  markNotificationRead
    // ==========================================================
    describe('markNotificationRead', () => {
        it('1. باید نوتیف رو به عنوان خوانده‌شده علامت بزنه', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedNotificationFindUnique.mockResolvedValue(mockNotification);
            mockedNotificationUpdate.mockResolvedValue({ ...mockNotification, isRead: true });

            const result = await notificationMutations.markNotificationRead(
                null,
                { notificationId: 'notif-1' },
                mockContext
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith(
                mockContext,
                'برای این کار باید وارد شوید.'
            );
            expect(mockedNotificationFindUnique).toHaveBeenCalledWith({
                where: { id: 'notif-1' },
            });
            expect(mockedNotificationUpdate).toHaveBeenCalledWith({
                where: { id: 'notif-1' },
                data: { isRead: true },
            });

            expect(result).toEqual({
                success: true,
                message: 'اعلان خوانده شد.',
            });
        });

        it('2. اگر نوتیف پیدا نشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedNotificationFindUnique.mockResolvedValue(null);

            await expect(
                notificationMutations.markNotificationRead(
                    null,
                    { notificationId: 'nonexistent' },
                    mockContext
                )
            ).rejects.toThrow('اعلان یافت نشد.');

            expect(mockedNotificationUpdate).not.toHaveBeenCalled();
        });

        it('3. اگر نوتیف متعلق به کاربر دیگه‌ای باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('user-2'); // کاربر دیگه
            mockedNotificationFindUnique.mockResolvedValue(mockNotification);

            await expect(
                notificationMutations.markNotificationRead(
                    null,
                    { notificationId: 'notif-1' },
                    mockContext
                )
            ).rejects.toThrow('شما اجازه‌ی این کار را ندارید.');

            expect(mockedNotificationUpdate).not.toHaveBeenCalled();
        });

        it('4. اگر کاربر لاگین نکرده باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای این کار باید وارد شوید.');
            });

            await expect(
                notificationMutations.markNotificationRead(
                    null,
                    { notificationId: 'notif-1' },
                    mockContext
                )
            ).rejects.toThrow('برای این کار باید وارد شوید.');

            expect(mockedNotificationFindUnique).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  markAllNotificationsRead
    // ==========================================================
    describe('markAllNotificationsRead', () => {
        it('5. باید همه‌ی نوتیف‌های خوانده‌نشده‌ی کاربر رو آپدیت کنه', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedNotificationUpdateMany.mockResolvedValue({ count: 5 });

            const result = await notificationMutations.markAllNotificationsRead(
                null,
                {},
                mockContext
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith(
                mockContext,
                'برای این کار باید وارد شوید.'
            );
            expect(mockedNotificationUpdateMany).toHaveBeenCalledWith({
                where: { recipientId: 'user-1', isRead: false },
                data: { isRead: true },
            });

            expect(result).toEqual({
                success: true,
                message: 'همه‌ی اعلان‌ها خوانده شدند.',
            });
        });

        it('6. اگر نوتیف خوانده‌نشده‌ای نباشه، باز هم success برگردونه', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedNotificationUpdateMany.mockResolvedValue({ count: 0 });

            const result = await notificationMutations.markAllNotificationsRead(
                null,
                {},
                mockContext
            );

            expect(result).toEqual({
                success: true,
                message: 'همه‌ی اعلان‌ها خوانده شدند.',
            });
        });

        it('7. اگر کاربر لاگین نکرده باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای این کار باید وارد شوید.');
            });

            await expect(
                notificationMutations.markAllNotificationsRead(null, {}, mockContext)
            ).rejects.toThrow('برای این کار باید وارد شوید.');

            expect(mockedNotificationUpdateMany).not.toHaveBeenCalled();
        });
    });
});