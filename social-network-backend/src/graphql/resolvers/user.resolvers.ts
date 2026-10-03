// resolvers/user.resolvers.ts
// نقطه‌ی اتصال: فقط تکه‌های کوچیک‌تر رو کنار هم می‌ذاره

import { postResolvers } from './post.resolvers';
import { userQueries } from './user/user.queries';
import { authResolvers } from './user/auth.resolvers';
import { followResolvers } from './user/follow.resolvers';
import { profileResolvers } from './user/profile.resolvers';
import { privacyResolvers } from './user/privacy.resolvers';

export const userResolvers = {
    Mutation: {
        ...authResolvers,
        ...profileResolvers,
        ...followResolvers,
        ...privacyResolvers,
        ...postResolvers.Mutation,
    },
    Query: userQueries,
    ...postResolvers.Query,
};