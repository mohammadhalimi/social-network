// resolvers/user.resolvers.ts
// نقطه‌ی اتصال: فقط تکه‌های کوچیک‌تر رو کنار هم می‌ذاره

import { authResolvers } from './user/auth.resolvers';
import { profileResolvers } from './user/profile.resolvers';
import { userQueries } from './user/user.queries';
import { postResolvers } from './post.resolvers';

export const userResolvers = {
    Mutation: {
        ...authResolvers,
        ...profileResolvers,
        ...postResolvers.Mutation,
    },
    Query: userQueries,
    ...postResolvers.Query,
};