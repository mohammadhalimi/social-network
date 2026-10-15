// src/graphql/resolvers/user/__tests__/follow.resolvers.test.ts

// ✅ Mock کردن prisma (با تمام متدهای جدید)
jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
        follow: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        followRequest: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

jest.mock('../../helpers/notify', () => ({
    createNotification: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { createNotification } from '../../helpers/notify';
import { followResolvers } from '../follow.resolvers';

const mockedRequireAuth = requireAuth as jest.Mock;
const mockedCreateNotification = createNotification as jest.Mock;
const mockedUserFindUnique = (prisma as any).user.findUnique as jest.Mock;
const mockedFollowFindUnique = (prisma as any).follow.findUnique as jest.Mock;
const mockedFollowUpsert = (prisma as any).follow.upsert as jest.Mock;
const mockedFollowDeleteMany = (prisma as any).follow.deleteMany as jest.Mock;
const mockedFollowCount = (prisma as any).follow.count as jest.Mock;
const mockedFollowRequestFindUnique = (prisma as any).followRequest.findUnique as jest.Mock;
const mockedFollowRequestUpdate = (prisma as any).followRequest.update as jest.Mock;
const mockedFollowRequestDeleteMany = (prisma as any).followRequest.deleteMany as jest.Mock;
const mockedTransaction = (prisma as any).$transaction as jest.Mock;

describe('followResolvers', () => {
    let mockContext: any;

    const mockTargetUser = {
        id: 'target-user-1',
        email: 'target@example.com',
        username: 'targetuser',
        fullName: 'Target User',
        bio: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        mockContext = {
            req: {},
            res: {},
            user: { userId: 'current-user-1', email: 'current@example.com' },
        };
        jest.clearAllMocks();
    });

    // ==========================================================
    //  followUser
    // ==========================================================
    describe('followUser', () => {
        it('1. باید کاربر رو فالو کنه و پیام مناسب برگردونه', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            mockedUserFindUnique.mockResolvedValue(mockTargetUser);
            mockedFollowFindUnique.mockResolvedValue(null);  // ✅ کاربر قبلاً فالو نکرده
            mockedFollowUpsert.mockResolvedValue({});
            mockedFollowCount.mockResolvedValue(150);

            const result = await followResolvers.followUser(
                null as any,
                { userId: 'target-user-1' },
                mockContext
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith(
                mockContext,
                'برای دنبال کردن کاربر باید وارد شوید.'
            );
            expect(mockedUserFindUnique).toHaveBeenCalledWith({
                where: { id: 'target-user-1' },
            });
            expect(mockedFollowUpsert).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'current-user-1',
                        followingId: 'target-user-1',
                    },
                },
                create: {
                    followerId: 'current-user-1',
                    followingId: 'target-user-1',
                },
                update: {},
            });
            expect(mockedFollowCount).toHaveBeenCalledWith({
                where: { followingId: 'target-user-1' },
            });

            expect(result).toEqual({
                success: true,
                message: 'با موفقیت دنبال شد.',
                isFollowing: true,
                isPending: false,  // ✅ اضافه شد
                followersCount: 150,
            });
        });

        it('2. اگر کاربر لاگین نکرده باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای دنبال کردن کاربر باید وارد شوید.');
            });

            await expect(
                followResolvers.followUser(null as any, { userId: 'target-user-1' }, mockContext)
            ).rejects.toThrow('برای دنبال کردن کاربر باید وارد شوید.');

            expect(mockedUserFindUnique).not.toHaveBeenCalled();
        });

        it('3. اگر کاربر بخواد خودش رو فالو کنه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');

            await expect(
                followResolvers.followUser(null as any, { userId: 'current-user-1' }, mockContext)
            ).rejects.toThrow('نمی‌توانید خودتان را دنبال کنید.');

            expect(mockedUserFindUnique).not.toHaveBeenCalled();
        });

        it('4. اگر کاربر هدف پیدا نشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            mockedUserFindUnique.mockResolvedValue(null);

            await expect(
                followResolvers.followUser(null as any, { userId: 'nonexistent' }, mockContext)
            ).rejects.toThrow('کاربر یافت نشد.');

            expect(mockedFollowUpsert).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  unfollowUser
    // ==========================================================
    describe('unfollowUser', () => {
        it('5. باید کاربر رو آنفالو کنه و پیام مناسب برگردونه', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            mockedFollowDeleteMany.mockResolvedValue({ count: 1 });
            mockedFollowCount.mockResolvedValue(100);

            const result = await followResolvers.unfollowUser(
                null as any,
                { userId: 'target-user-1' },
                mockContext
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith(
                mockContext,
                'برای لغو دنبال کردن باید وارد شوید.'
            );
            expect(mockedFollowDeleteMany).toHaveBeenCalledWith({
                where: {
                    followerId: 'current-user-1',
                    followingId: 'target-user-1',
                },
            });
            expect(mockedFollowCount).toHaveBeenCalledWith({
                where: { followingId: 'target-user-1' },
            });

            expect(result).toEqual({
                success: true,
                message: 'دنبال کردن لغو شد.',
                isFollowing: false,
                isPending: false,  // ✅ اضافه شد
                followersCount: 100,
            });
        });

        it('6. اگر کاربر لاگین نکرده باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای لغو دنبال کردن باید وارد شوید.');
            });

            await expect(
                followResolvers.unfollowUser(null as any, { userId: 'target-user-1' }, mockContext)
            ).rejects.toThrow('برای لغو دنبال کردن باید وارد شوید.');

            expect(mockedFollowDeleteMany).not.toHaveBeenCalled();
        });
    });


    // ==========================================================
    //  cancelFollowRequest
    // ==========================================================
    describe('cancelFollowRequest', () => {
        it('7. باید درخواست فالوی PENDING رو حذف کنه', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            (prisma.followRequest.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

            const result = await followResolvers.cancelFollowRequest(
                null as any,
                { targetUserId: 'target-user-1' },
                mockContext
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith(
                mockContext,
                'برای لغو درخواست باید وارد شوید.'
            );
            expect(prisma.followRequest.deleteMany).toHaveBeenCalledWith({
                where: {
                    requesterId: 'current-user-1',
                    targetId: 'target-user-1',
                    status: 'PENDING',
                },
            });

            expect(result).toEqual({
                success: true,
                message: 'درخواست دنبال کردن لغو شد.',
            });
        });

        it('8. اگر کاربر لاگین نکرده باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای لغو درخواست باید وارد شوید.');
            });

            await expect(
                followResolvers.cancelFollowRequest(
                    null as any,
                    { targetUserId: 'target-user-1' },
                    mockContext
                )
            ).rejects.toThrow('برای لغو درخواست باید وارد شوید.');

            expect(prisma.followRequest.deleteMany).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  acceptFollowRequest
    // ==========================================================
    describe('acceptFollowRequest', () => {
        const mockRequest = {
            id: 'request-1',
            requesterId: 'requester-1',
            targetId: 'current-user-1',
            status: 'PENDING',
        };

        it('9. باید درخواست رو تأیید کنه، فالو بسازه و نوتیف بفرسته', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest);
            (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]);
            mockedCreateNotification.mockResolvedValue({});

            const result = await followResolvers.acceptFollowRequest(
                null as any,
                { requestId: 'request-1' },
                mockContext
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith(
                mockContext,
                'برای این کار باید وارد شوید.'
            );
            expect(prisma.followRequest.findUnique).toHaveBeenCalledWith({
                where: { id: 'request-1' },
            });
            expect(prisma.$transaction).toHaveBeenCalled();

            // ✅ بررسی نوتیف
            expect(mockedCreateNotification).toHaveBeenCalledWith({
                recipientId: 'requester-1',
                actorId: 'current-user-1',
                type: 'FOLLOW_REQUEST_ACCEPTED',
            });

            expect(result).toEqual({
                success: true,
                message: 'درخواست تأیید شد.',
            });
        });

        it('10. اگر درخواست پیدا نشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                followResolvers.acceptFollowRequest(
                    null as any,
                    { requestId: 'nonexistent' },
                    mockContext
                )
            ).rejects.toThrow('درخواست یافت نشد.');

            expect(prisma.$transaction).not.toHaveBeenCalled();
            expect(mockedCreateNotification).not.toHaveBeenCalled();
        });

        it('11. اگر کاربر مالک درخواست نباشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('wrong-user');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue({
                ...mockRequest,
                targetId: 'current-user-1',
            });

            await expect(
                followResolvers.acceptFollowRequest(
                    null as any,
                    { requestId: 'request-1' },
                    mockContext
                )
            ).rejects.toThrow('شما اجازه‌ی این کار را ندارید.');

            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('12. اگر درخواست قبلاً پردازش شده باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue({
                ...mockRequest,
                status: 'ACCEPTED',
            });

            await expect(
                followResolvers.acceptFollowRequest(
                    null as any,
                    { requestId: 'request-1' },
                    mockContext
                )
            ).rejects.toThrow('این درخواست قبلاً پردازش شده است.');

            expect(prisma.$transaction).not.toHaveBeenCalled();
        });
    });

    // ==========================================================
    //  rejectFollowRequest
    // ==========================================================
    describe('rejectFollowRequest', () => {
        const mockRequest = {
            id: 'request-1',
            requesterId: 'requester-1',
            targetId: 'current-user-1',
            status: 'PENDING',
        };

        it('13. باید درخواست رو رد کنه', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest);
            (prisma.followRequest.update as jest.Mock).mockResolvedValue({});

            const result = await followResolvers.rejectFollowRequest(
                null as any,
                { requestId: 'request-1' },
                mockContext
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith(
                mockContext,
                'برای این کار باید وارد شوید.'
            );
            expect(prisma.followRequest.update).toHaveBeenCalledWith({
                where: { id: 'request-1' },
                data: { status: 'REJECTED' },
            });

            expect(result).toEqual({
                success: true,
                message: 'درخواست رد شد.',
            });
        });

        it('14. اگر درخواست پیدا نشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                followResolvers.rejectFollowRequest(
                    null as any,
                    { requestId: 'nonexistent' },
                    mockContext
                )
            ).rejects.toThrow('درخواست یافت نشد.');

            expect(prisma.followRequest.update).not.toHaveBeenCalled();
        });

        it('15. اگر کاربر مالک درخواست نباشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('wrong-user');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest);

            await expect(
                followResolvers.rejectFollowRequest(
                    null as any,
                    { requestId: 'request-1' },
                    mockContext
                )
            ).rejects.toThrow('شما اجازه‌ی این کار را ندارید.');

            expect(prisma.followRequest.update).not.toHaveBeenCalled();
        });

        it('16. اگر درخواست قبلاً پردازش شده باشه، باید خطا بده', async () => {
            mockedRequireAuth.mockReturnValue('current-user-1');
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue({
                ...mockRequest,
                status: 'REJECTED',
            });

            await expect(
                followResolvers.rejectFollowRequest(
                    null as any,
                    { requestId: 'request-1' },
                    mockContext
                )
            ).rejects.toThrow('این درخواست قبلاً پردازش شده است.');

            expect(prisma.followRequest.update).not.toHaveBeenCalled();
        });
    });
});