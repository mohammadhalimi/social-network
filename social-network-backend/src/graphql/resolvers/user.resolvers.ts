// src/graphql/resolvers/user.resolvers.ts
// نقطه‌ی اتصال: فقط تکه‌های کوچیک‌تر مربوط به User رو کنار هم می‌ذاره

import { userQueries } from './user/user.queries';
import { authResolvers } from './user/auth.resolvers';
import { followResolvers } from './user/follow.resolvers';
import { profileResolvers } from './user/profile.resolvers';
import { privacyResolvers } from './user/privacy.resolvers';

export const userResolvers = {
    Query: {
        ...userQueries,
    },
    Mutation: {
        ...authResolvers,
        ...profileResolvers,
        ...followResolvers,
        ...privacyResolvers,
    },
};