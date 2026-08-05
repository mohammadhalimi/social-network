// resolvers/user.queries.ts
// Queryهای مربوط به کاربر

import prisma from '../../lib/prisma';
import { mapUser } from './helpers/mapUser';
import { requireAuth } from './try-catch/requireAuth';

export const userQueries = {
    _empty: () => '',

    me: async (_: any, __: any, context: any) => {
        const userId = requireAuth(context, 'برای دسترسی به این بخش باید وارد شوید.');

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error('کاربر یافت نشد.');
        }

        return mapUser(user);
    },
};