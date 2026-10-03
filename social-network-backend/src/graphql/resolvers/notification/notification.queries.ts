// src/graphql/resolvers/notification/notification.queries.ts
import prisma from '../../../lib/prisma';
import { mapUser } from '../helpers/mapUser';
import { requireAuth } from '../try-catch/requireAuth';

export const notificationQueries = {
    getNotifications: async (
        _: any,
        { limit = 20, offset = 0 }: { limit: number; offset: number },
        context: any
    ) => {
        const userId = requireAuth(context, 'برای مشاهده‌ی اعلان‌ها باید وارد شوید.');

        const [notifications, totalCount, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { recipientId: userId },
                include: {
                    actor: true,
                    followRequest: {
                        include: { requester: true, target: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.notification.count({ where: { recipientId: userId } }),
            prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
        ]);

        return {
            notifications: notifications.map((n) => ({
                id: n.id,
                type: n.type,
                isRead: n.isRead,
                createdAt: n.createdAt.toISOString(),
                actor: mapUser(n.actor),
                followRequest: n.followRequest
                    ? {
                          id: n.followRequest.id,
                          status: n.followRequest.status,
                          createdAt: n.followRequest.createdAt.toISOString(),
                          requester: mapUser(n.followRequest.requester),
                          target: mapUser(n.followRequest.target),
                      }
                    : null,
            })),
            totalCount,
            unreadCount,
            hasMore: offset + notifications.length < totalCount,
        };
    },
};