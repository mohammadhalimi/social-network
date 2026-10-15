// src/graphql/resolvers/helpers/__tests__/notify.test.ts

// ✅ Mock کردن prisma
jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        notification: {
            create: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
        },
    },
}));

// ✅ Mock کردن mapUser
jest.mock('../mapUser', () => ({
    mapUser: jest.fn((user: any) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
    })),
}));

// ✅ Mock کردن socket
jest.mock('../../../../socket', () => ({
    emitToUser: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { mapUser } from '../mapUser';
import { emitToUser } from '../../../../socket';
import { createNotification } from '../notify';

const mockedNotificationCreate = (prisma as any).notification.create as jest.Mock;
const mockedNotificationFindFirst = (prisma as any).notification.findFirst as jest.Mock;
const mockedNotificationCount = (prisma as any).notification.count as jest.Mock;
const mockedMapUser = mapUser as jest.Mock;
const mockedEmitToUser = emitToUser as jest.Mock;

describe('createNotification', () => {
    const mockActor = {
        id: 'actor-1',
        username: 'actor',
        fullName: 'Actor User',
        avatar: null,
    };

    const mockNotification = {
        id: 'notif-1',
        recipientId: 'recipient-1',
        actorId: 'actor-1',
        type: 'FOLLOW',
        isRead: false,
        createdAt: new Date('2026-10-15T12:00:00.000Z'),
        actor: mockActor,
        followRequest: null,
        postId: null,
        commentId: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================
    //  تست ۱: نوتیف ساده (FOLLOW)
    // ==========================================================
    it('1. باید نوتیف FOLLOW رو بسازه و به سوکت بفرسته', async () => {
        mockedNotificationCreate.mockResolvedValue(mockNotification);
        mockedNotificationCount.mockResolvedValue(1);

        const result = await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'FOLLOW',
        });

        expect(mockedNotificationCreate).toHaveBeenCalledWith({
            data: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'FOLLOW',
                followRequestId: undefined,
                postId: undefined,
                commentId: undefined,
            },
            include: {
                actor: true,
                followRequest: {
                    include: {
                        requester: true,
                        target: true,
                    },
                },
            },
        });

        expect(mockedNotificationCount).toHaveBeenCalledWith({
            where: { recipientId: 'recipient-1', isRead: false },
        });

        expect(mockedMapUser).toHaveBeenCalledWith(mockActor);
        expect(mockedEmitToUser).toHaveBeenCalledWith(
            'recipient-1',
            'notification:new',
            expect.objectContaining({
                id: 'notif-1',
                type: 'FOLLOW',
                isRead: false,
                createdAt: '2026-10-15T12:00:00.000Z',
                unreadCount: 1,
            })
        );

        expect(result).toEqual(mockNotification);
    });

    // ==========================================================
    //  تست ۲: جلوگیری از نوتیف به خود
    // ==========================================================
    it('2. اگر recipientId و actorId یکی باشن، نوتیف نساز و null برگردون', async () => {
        const result = await createNotification({
            recipientId: 'user-1',
            actorId: 'user-1',
            type: 'FOLLOW',
        });

        expect(result).toBeNull();
        expect(mockedNotificationCreate).not.toHaveBeenCalled();
        expect(mockedEmitToUser).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۳: جلوگیری از نوتیف تکراری LIKE
    // ==========================================================
    it('3. اگر نوتیف LIKE تکراری باشه، نوتیف نساز و null برگردون', async () => {
        // ✅ نوتیف LIKE قبلاً ساخته شده
        mockedNotificationFindFirst.mockResolvedValue({ id: 'existing-notif' });

        const result = await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'LIKE',
            postId: 'post-1',
        });

        expect(result).toBeNull();
        expect(mockedNotificationFindFirst).toHaveBeenCalledWith({
            where: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'LIKE',
                postId: 'post-1',
            },
        });
        expect(mockedNotificationCreate).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۴: LIKE جدید (بدون تکراری)
    // ==========================================================
    it('4. اگر نوتیف LIKE تکراری نباشه، نوتیف بساز', async () => {
        mockedNotificationFindFirst.mockResolvedValue(null); // ✅ تکراری نیست
        mockedNotificationCreate.mockResolvedValue({
            ...mockNotification,
            type: 'LIKE',
            postId: 'post-1',
        });
        mockedNotificationCount.mockResolvedValue(3);

        const result = await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'LIKE',
            postId: 'post-1',
        });

        expect(mockedNotificationFindFirst).toHaveBeenCalledWith({
            where: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'LIKE',
                postId: 'post-1',
            },
        });
        expect(mockedNotificationCreate).toHaveBeenCalledWith({
            data: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'LIKE',
                followRequestId: undefined,
                postId: 'post-1',
                commentId: undefined,
            },
            include: expect.any(Object),
        });
        expect(mockedEmitToUser).toHaveBeenCalled();
        expect(result).not.toBeNull();
    });

    // ==========================================================
    //  تست ۵: جلوگیری از نوتیف تکراری COMMENT_LIKE
    // ==========================================================
    it('5. اگر نوتیف COMMENT_LIKE تکراری باشه، نوتیف نساز', async () => {
        mockedNotificationFindFirst.mockResolvedValue({ id: 'existing-notif' });

        const result = await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'COMMENT_LIKE',
            commentId: 'comment-1',
        });

        expect(result).toBeNull();
        expect(mockedNotificationFindFirst).toHaveBeenCalledWith({
            where: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'COMMENT_LIKE',
                commentId: 'comment-1',
            },
        });
        expect(mockedNotificationCreate).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  تست ۶: COMMENT_LIKE جدید
    // ==========================================================
    it('6. اگر نوتیف COMMENT_LIKE تکراری نباشه، نوتیف بساز', async () => {
        mockedNotificationFindFirst.mockResolvedValue(null);
        mockedNotificationCreate.mockResolvedValue({
            ...mockNotification,
            type: 'COMMENT_LIKE',
            commentId: 'comment-1',
        });
        mockedNotificationCount.mockResolvedValue(2);

        const result = await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'COMMENT_LIKE',
            commentId: 'comment-1',
        });

        expect(mockedNotificationCreate).toHaveBeenCalledWith({
            data: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'COMMENT_LIKE',
                followRequestId: undefined,
                postId: undefined,
                commentId: 'comment-1',
            },
            include: expect.any(Object),
        });
        expect(result).not.toBeNull();
    });

    // ==========================================================
    //  تست ۷: FOLLOW_REQUEST با followRequestId
    // ==========================================================
    it('7. باید نوتیف FOLLOW_REQUEST رو با followRequestId بسازه', async () => {
        mockedNotificationCreate.mockResolvedValue({
            ...mockNotification,
            type: 'FOLLOW_REQUEST',
            followRequestId: 'req-1',
        });
        mockedNotificationCount.mockResolvedValue(2);

        await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'FOLLOW_REQUEST',
            followRequestId: 'req-1',
        });

        expect(mockedNotificationCreate).toHaveBeenCalledWith({
            data: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'FOLLOW_REQUEST',
                followRequestId: 'req-1',
                postId: undefined,
                commentId: undefined,
            },
            include: expect.any(Object),
        });
    });

    // ==========================================================
    //  تست ۸: COMMENT
    // ==========================================================
    it('8. باید نوتیف COMMENT رو با postId و commentId بسازه', async () => {
        mockedNotificationCreate.mockResolvedValue({
            ...mockNotification,
            type: 'COMMENT',
        });
        mockedNotificationCount.mockResolvedValue(1);

        await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'COMMENT',
            postId: 'post-1',
            commentId: 'comment-1',
        });

        expect(mockedNotificationCreate).toHaveBeenCalledWith({
            data: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'COMMENT',
                followRequestId: undefined,
                postId: 'post-1',
                commentId: 'comment-1',
            },
            include: expect.any(Object),
        });
    });

    // ==========================================================
    //  تست ۹: REPLY
    // ==========================================================
    it('9. باید نوتیف REPLY رو با postId و commentId بسازه', async () => {
        mockedNotificationCreate.mockResolvedValue({
            ...mockNotification,
            type: 'REPLY',
        });
        mockedNotificationCount.mockResolvedValue(1);

        await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'REPLY',
            postId: 'post-1',
            commentId: 'parent-comment-1',
        });

        expect(mockedNotificationCreate).toHaveBeenCalledWith({
            data: {
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'REPLY',
                followRequestId: undefined,
                postId: 'post-1',
                commentId: 'parent-comment-1',
            },
            include: expect.any(Object),
        });
    });

    // ==========================================================
    //  تست ۱۰: socket payload
    // ==========================================================
    it('10. باید payload سوکت رو با تمام فیلدها بفرسته', async () => {
        mockedNotificationCreate.mockResolvedValue({
            ...mockNotification,
            type: 'LIKE',
            postId: 'post-1',
            commentId: null,
        });
        mockedNotificationCount.mockResolvedValue(5);

        await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'LIKE',
            postId: 'post-1',
        });

        expect(mockedEmitToUser).toHaveBeenCalledWith(
            'recipient-1',
            'notification:new',
            expect.objectContaining({
                id: 'notif-1',
                type: 'LIKE',
                isRead: false,
                createdAt: expect.any(String),
                actor: expect.objectContaining({ id: 'actor-1' }),
                postId: 'post-1',
                commentId: null,
                followRequest: null,
                unreadCount: 5,
            })
        );
    });

    // ==========================================================
    //  تست ۱۱: FOLLOW_REQUEST در payload سوکت
    // ==========================================================
    it('11. اگر followRequest وجود داشته باشه، در payload سوکت هم مپ بشه', async () => {
        const mockFollowRequest = {
            id: 'req-1',
            status: 'PENDING',
            createdAt: new Date('2026-10-15T11:00:00.000Z'),
            requester: { id: 'req-1', username: 'req', fullName: 'Req', avatar: null },
            target: { id: 'tgt-1', username: 'tgt', fullName: 'Tgt', avatar: null },
        };

        mockedNotificationCreate.mockResolvedValue({
            ...mockNotification,
            type: 'FOLLOW_REQUEST',
            followRequest: mockFollowRequest,
        });
        mockedNotificationCount.mockResolvedValue(2);

        await createNotification({
            recipientId: 'recipient-1',
            actorId: 'actor-1',
            type: 'FOLLOW_REQUEST',
            followRequestId: 'req-1',
        });

        expect(mockedMapUser).toHaveBeenCalledWith(mockFollowRequest.requester);
        expect(mockedMapUser).toHaveBeenCalledWith(mockFollowRequest.target);

        expect(mockedEmitToUser).toHaveBeenCalledWith(
            'recipient-1',
            'notification:new',
            expect.objectContaining({
                followRequest: {
                    id: 'req-1',
                    status: 'PENDING',
                    createdAt: '2026-10-15T11:00:00.000Z',
                    requester: expect.objectContaining({ id: 'req-1' }),
                    target: expect.objectContaining({ id: 'tgt-1' }),
                },
            })
        );
    });

    // ==========================================================
    //  تست ۱۲: خطای Prisma
    // ==========================================================
    it('12. اگر create خطا بده، خطا propagate بشه و سوکت صدا زده نشه', async () => {
        mockedNotificationCreate.mockRejectedValue(new Error('DB error'));

        await expect(
            createNotification({
                recipientId: 'recipient-1',
                actorId: 'actor-1',
                type: 'FOLLOW',
            })
        ).rejects.toThrow('DB error');

        expect(mockedEmitToUser).not.toHaveBeenCalled();
    });
});