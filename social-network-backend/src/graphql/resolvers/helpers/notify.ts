// src/graphql/resolvers/helpers/notify.ts
import { mapUser } from './mapUser';
import prisma from '../../../lib/prisma';
import { emitToUser } from '../../../socket';

interface CreateNotificationParams {
    recipientId: string;
    actorId: string;
    type: 'FOLLOW' | 'FOLLOW_REQUEST' | 'FOLLOW_REQUEST_ACCEPTED';
    followRequestId?: string;
}

export async function createNotification({
    recipientId,
    actorId,
    type,
    followRequestId,
}: CreateNotificationParams) {
    const notification = await prisma.notification.create({
        data: { recipientId, actorId, type, followRequestId },
        include: { actor: true },
    });

    const unreadCount = await prisma.notification.count({
        where: { recipientId, isRead: false },
    });

    // ✅ ارسال لحظه‌ای از طریق سوکت (اگر کاربر آنلاین باشد)
    emitToUser(recipientId, 'notification:new', {
        id: notification.id,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        actor: mapUser(notification.actor),
        unreadCount,
    });

    return notification;
}