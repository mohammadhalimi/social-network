// src/graphql/resolvers/helpers/notify.ts
import { mapUser } from './mapUser';
import prisma from '../../../lib/prisma';
import { emitToUser } from '../../../socket';

interface CreateNotificationParams {
    recipientId: string;
    actorId: string;
    type: 'FOLLOW' | 'FOLLOW_REQUEST' | 'FOLLOW_REQUEST_ACCEPTED' | 'LIKE' | 'COMMENT' | 'REPLY' | 'COMMENT_LIKE';
    followRequestId?: string;
    postId?: string;      // ✅ جدید
    commentId?: string;   // ✅ جدید
}

export async function createNotification({
    recipientId,
    actorId,
    type,
    followRequestId,
    postId,
    commentId,
}: CreateNotificationParams) {
    // ✅ جلوگیری از نوتیف به خود
    if (recipientId === actorId) {
        return null;
    }

    // ✅ جلوگیری از نوتیف تکراری برای LIKE و COMMENT_LIKE
    if (type === 'LIKE' && postId) {
        const existing = await prisma.notification.findFirst({
            where: {
                recipientId,
                actorId,
                type: 'LIKE',
                postId,
            },
        });

        if (existing) {
            return null; // نوتیف تکراری نساز
        }
    }

    if (type === 'COMMENT_LIKE' && commentId) {
        const existing = await prisma.notification.findFirst({
            where: {
                recipientId,
                actorId,
                type: 'COMMENT_LIKE',
                commentId,
            },
        });

        if (existing) {
            return null; // نوتیف تکراری نساز
        }
    }

    // ✅ ساخت نوتیف
    const notification = await prisma.notification.create({
        data: {
            recipientId,
            actorId,
            type,
            followRequestId,
            postId,
            commentId,
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

    const unreadCount = await prisma.notification.count({
        where: { recipientId, isRead: false },
    });

    // ✅ ارسال لحظه‌ای از طریق سوکت
    emitToUser(recipientId, 'notification:new', {
        id: notification.id,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        actor: mapUser(notification.actor),
        postId: notification.postId,        // ✅ جدید
        commentId: notification.commentId,  // ✅ جدید
        followRequest: notification.followRequest
            ? {
                  id: notification.followRequest.id,
                  status: notification.followRequest.status,
                  createdAt: notification.followRequest.createdAt.toISOString(),
                  requester: mapUser(notification.followRequest.requester),
                  target: mapUser(notification.followRequest.target),
              }
            : null,
        unreadCount,
    });

    return notification;
}