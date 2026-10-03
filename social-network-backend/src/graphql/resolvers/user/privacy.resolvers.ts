// src/graphql/resolvers/user/privacy.resolvers.ts
import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';

export const privacyResolvers = {
    updatePrivacy: async (_: any, { isPrivate }: { isPrivate: boolean }, context: any) => {
        const userId = requireAuth(context, 'برای این کار باید وارد شوید.');

        await prisma.user.update({
            where: { id: userId },
            data: { isPrivate },
        });

        return {
            success: true,
            message: isPrivate ? 'صفحه‌ی شما خصوصی شد.' : 'صفحه‌ی شما عمومی شد.',
            isPrivate,
        };
    },
};