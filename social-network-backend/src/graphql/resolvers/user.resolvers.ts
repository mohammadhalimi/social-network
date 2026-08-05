// resolvers/user.resolvers.ts
// نقطه‌ی اتصال: فقط تکه‌های کوچیک‌تر رو کنار هم می‌ذاره

import { authResolvers } from './auth.resolvers';
import { profileResolvers } from './profile.resolvers';
import { userQueries } from './user.queries';

export const userResolvers = {
    Mutation: {
        ...authResolvers,
        ...profileResolvers,
    },
    Query: userQueries,
};