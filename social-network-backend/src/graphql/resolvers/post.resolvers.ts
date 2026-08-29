// resolvers/post.resolvers.ts
// نقطه‌ی اتصال: فقط تکه‌های کوچیک‌تر رو کنار هم می‌ذاره

import { postQueries } from './post/post.queries';
import { postMutations } from './post/post.mutations';
import { likeResolvers } from './post/like.resolvers';
import { commentResolvers } from './post/comment.resolvers';

export const postResolvers = {
    Query: postQueries,
    Mutation: {
        ...postMutations,
        ...likeResolvers,
        ...commentResolvers,
    },
};