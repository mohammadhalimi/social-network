// src/graphql/resolvers/notification/notification.mutations.ts
import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';

export const notificationMutations = {
    markNotificationRead: async (_: any, { notificationId }: { notificationId: string }, context: any) => {
        const userId = requireAuth(context, 'برای این کار باید وارد شوید.');

        const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
        if (!notification) throw new Error('اعلان یافت نشد.');
        if (notification.recipientId !== userId) throw new Error('شما اجازه‌ی این کار را ندارید.');

        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return { success: true, message: 'اعلان خوانده شد.' };
    },

    markAllNotificationsRead: async (_: any, __: any, context: any) => {
        const userId = requireAuth(context, 'برای این کار باید وارد شوید.');

        await prisma.notification.updateMany({
            where: { recipientId: userId, isRead: false },
            data: { isRead: true },
        });

        return { success: true, message: 'همه‌ی اعلان‌ها خوانده شدند.' };
    },
};