// src/graphql/resolvers/notification/__tests__/notification.queries.test.ts

// ✅ Mock کردن prisma
jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        notification: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

// ✅ Mock کردن requireAuth
jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

// ✅ Mock کردن mapUser
jest.mock('../../helpers/mapUser', () => ({
    mapUser: jest.fn((user: any) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt?.toISOString?.() ?? user.createdAt,
        updatedAt: user.updatedAt?.toISOString?.() ?? user.updatedAt,
        followersCount: 0,
        followingCount: 0,
        isFollowing: false,
        isPrivate: user.isPrivate ?? false,
        isFollowRequestPending: false,
    })),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { mapUser } from '../../helpers/mapUser';
import { notificationQueries } from '../notification.queries';

const mockedRequireAuth = requireAuth as jest.Mock;
const mockedNotificationFindMany = (prisma as any).notification.findMany as jest.Mock;
const mockedNotificationCount = (prisma as any).notification.count as jest.Mock;
const mockedMapUser = mapUser as jest.Mock;

describe('notificationQueries.getNotifications', () => {
    let mockContext: any;

    const mockActor = {
        id: 'actor-1',
        email: 'actor@example.com',
        username: 'actor',
        fullName: 'Actor User',
        bio: null,
        avatar: null,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const mockRequester = {
        id: 'requester-1',
        email: 'requester@example.com',
        username: 'requester',
        fullName: 'Requester User',
        bio: null,
        avatar: null,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const mockTarget = {
        id: 'target-1',
        email: 'target@example.com',
        username: 'target',
        fullName: 'Target User',
        bio: null,
        avatar: null,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
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
    //  حالت ۱: دریافت موفق نوتیف‌ها
    // ==========================================================
    it('1. باید نوتیف‌ها رو با تمام فیلدها برگردونه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');

        const mockNotifications = [
            {
                id: 'notif-1',
                type: 'LIKE',
                isRead: false,
                createdAt: new Date('2026-10-15T12:00:00.000Z'),
                actor: mockActor,
                followRequest: null,
                postId: 'post-1',
                commentId: null,
            },
            {
                id: 'notif-2',
                type: 'FOLLOW_REQUEST',
                isRead: true,
                createdAt: new Date('2026-10-15T11:00:00.000Z'),
                actor: mockActor,
                followRequest: {
                    id: 'req-1',
                    status: 'PENDING',
                    createdAt: new Date('2026-10-15T11:00:00.000Z'),
                    requester: mockRequester,
                    target: mockTarget,
                },
                postId: null,
                commentId: null,
            },
        ];

        mockedNotificationFindMany.mockResolvedValue(mockNotifications);
        mockedNotificationCount
            .mockResolvedValueOnce(2)   // totalCount
            .mockResolvedValueOnce(1);  // unreadCount

        const result = await notificationQueries.getNotifications(
            null,
            { limit: 20, offset: 0 },
            mockContext
        );

        expect(mockedRequireAuth).toHaveBeenCalledWith(
            mockContext,
            'برای مشاهده‌ی اعلان‌ها باید وارد شوید.'
        );
        expect(mockedNotificationFindMany).toHaveBeenCalledWith({
            where: { recipientId: 'user-1' },
            include: {
                actor: true,
                followRequest: {
                    include: { requester: true, target: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            skip: 0,
        });

        expect(result.notifications).toHaveLength(2);
        expect(result.notifications[0]).toMatchObject({
            id: 'notif-1',
            type: 'LIKE',
            isRead: false,
            createdAt: '2026-10-15T12:00:00.000Z',
            followRequest: null,
        });
        expect(result.notifications[1]).toMatchObject({
            id: 'notif-2',
            type: 'FOLLOW_REQUEST',
            isRead: true,
            followRequest: {
                id: 'req-1',
                status: 'PENDING',
                createdAt: '2026-10-15T11:00:00.000Z',
            },
        });
        expect(result.totalCount).toBe(2);
        expect(result.unreadCount).toBe(1);
        expect(result.hasMore).toBe(false);
    });

    // ==========================================================
    //  حالت ۲: Pagination — hasMore true
    // ==========================================================
    it('2. اگر تعداد کل بیشتر از limit باشه، hasMore باید true باشه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedNotificationFindMany.mockResolvedValue([]);
        mockedNotificationCount
            .mockResolvedValueOnce(50)  // totalCount
            .mockResolvedValueOnce(5);  // unreadCount

        const result = await notificationQueries.getNotifications(
            null,
            { limit: 20, offset: 0 },
            mockContext
        );

        expect(result.hasMore).toBe(true);
    });

    // ==========================================================
    //  حالت ۳: Pagination — offset
    // ==========================================================
    it('3. باید limit و offset رو به prisma پاس بده', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedNotificationFindMany.mockResolvedValue([]);
        mockedNotificationCount.mockResolvedValue(0);

        await notificationQueries.getNotifications(
            null,
            { limit: 10, offset: 30 },
            mockContext
        );

        expect(mockedNotificationFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 10,
                skip: 30,
            })
        );
    });

    // ==========================================================
    //  حالت ۴: مقادیر پیش‌فرض
    // ==========================================================
    it('4. اگر limit و offset ارسال نشن، پیش‌فرض 20 و 0 استفاده بشه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedNotificationFindMany.mockResolvedValue([]);
        mockedNotificationCount.mockResolvedValue(0);

        await notificationQueries.getNotifications(
            null,
            {} as any,
            mockContext
        );

        expect(mockedNotificationFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 20,
                skip: 0,
            })
        );
    });

    // ==========================================================
    //  حالت ۵: کاربر لاگین نکرده
    // ==========================================================
    it('5. اگر کاربر لاگین نکرده باشه، باید خطا بده', async () => {
        mockedRequireAuth.mockImplementation(() => {
            throw new Error('برای مشاهده‌ی اعلان‌ها باید وارد شوید.');
        });

        await expect(
            notificationQueries.getNotifications(null, { limit: 20, offset: 0 }, {})
        ).rejects.toThrow('برای مشاهده‌ی اعلان‌ها باید وارد شوید.');

        expect(mockedNotificationFindMany).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۶: لیست خالی
    // ==========================================================
    it('6. اگر نوتیفی وجود نداشته باشه، لیست خالی برگردونه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedNotificationFindMany.mockResolvedValue([]);
        mockedNotificationCount.mockResolvedValue(0);

        const result = await notificationQueries.getNotifications(
            null,
            { limit: 20, offset: 0 },
            mockContext
        );

        expect(result.notifications).toEqual([]);
        expect(result.totalCount).toBe(0);
        expect(result.unreadCount).toBe(0);
        expect(result.hasMore).toBe(false);
    });

    // ==========================================================
    //  حالت ۷: Map User صدا زده بشه
    // ==========================================================
    it('7. باید mapUser رو برای actor صدا بزنه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedNotificationFindMany.mockResolvedValue([
            {
                id: 'notif-1',
                type: 'LIKE',
                isRead: false,
                createdAt: new Date('2026-10-15T12:00:00.000Z'),
                actor: mockActor,
                followRequest: null,
            },
        ]);
        mockedNotificationCount.mockResolvedValue(1);

        await notificationQueries.getNotifications(
            null,
            { limit: 20, offset: 0 },
            mockContext
        );

        expect(mockedMapUser).toHaveBeenCalledWith(mockActor);
    });

    // ==========================================================
    //  حالت ۸: FollowRequest Mapping
    // ==========================================================
    it('8. باید followRequest رو با requester و target مپ کنه', async () => {
        mockedRequireAuth.mockReturnValue('user-1');
        mockedNotificationFindMany.mockResolvedValue([
            {
                id: 'notif-1',
                type: 'FOLLOW_REQUEST',
                isRead: false,
                createdAt: new Date('2026-10-15T12:00:00.000Z'),
                actor: mockActor,
                followRequest: {
                    id: 'req-1',
                    status: 'PENDING',
                    createdAt: new Date('2026-10-15T11:00:00.000Z'),
                    requester: mockRequester,
                    target: mockTarget,
                },
            },
        ]);
        mockedNotificationCount.mockResolvedValue(1);

        const result = await notificationQueries.getNotifications(
            null,
            { limit: 20, offset: 0 },
            mockContext
        );

        expect(result.notifications[0].followRequest).toMatchObject({
            id: 'req-1',
            status: 'PENDING',
            createdAt: '2026-10-15T11:00:00.000Z',
        });
        expect(mockedMapUser).toHaveBeenCalledWith(mockRequester);
        expect(mockedMapUser).toHaveBeenCalledWith(mockTarget);
    });
});