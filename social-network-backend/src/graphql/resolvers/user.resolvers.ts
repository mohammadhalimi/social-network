// resolvers/user.resolvers.ts
// نقطه‌ی اتصال: فقط تکه‌های کوچیک‌تر رو کنار هم می‌ذاره

import { postResolvers } from './post.resolvers';
import { userQueries } from './user/user.queries';
import { authResolvers } from './user/auth.resolvers';
import { profileResolvers } from './user/profile.resolvers';
import { followResolvers } from './user/follow.resolvers'; // ✅ اضافه شد

export const userResolvers = {
    Mutation: {
        ...authResolvers,
        ...profileResolvers,
        ...followResolvers,
        ...postResolvers.Mutation,
    },
    Query: userQueries,
    ...postResolvers.Query,
};